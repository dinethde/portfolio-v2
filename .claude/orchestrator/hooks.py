"""Claude Code hook handlers. Each reads the hook's JSON from stdin.

``subagent-stop``  a worker tries to finish: check its REPORT, run its task's checks, and
                   send it back (up to ``max_retries`` times) until they pass and it has committed.
``review-stop``    a review agent tries to finish: it must end with a REVIEW block, which is recorded.
``guard-bash``     before a Bash command: block commits and PRs that break the commit rules, and a PR
                   while a required review is missing or out of date.
``tests-only``     before a Write or Edit by the test planner: allow test files only.
``pr-review-stop`` pr-reviewer tries to finish: it must end with a PR block on the PR's current head.
``pr-fix-stop``    pr-fixer tries to finish: its fixes must be committed and pushed.
``guard-agent``    before the lead starts a subagent: no new pr-fixer round once a PR used up its rounds.
``format``         after a Write or Edit: run the matching formatter from the config.
``require-commit`` the lead tries to finish: send it back once if work is uncommitted.

Hooks fail open: if a hook can't read its input or the project, it lets Claude carry on.
"""

from __future__ import annotations

import contextlib
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from orchestrator import commit_rules, prs, reviews, tasks
from orchestrator.config import Config, ConfigError, find_project_root, load_config
from orchestrator.gitutil import changed_files, current_branch, fetch, main_checkout, rev_parse, unpushed_commits
from orchestrator.patterns import is_under, matches_any
from orchestrator.verify import Result, Step, verify

BLOCKING_EXIT = 2
STATE_DIR = Path(".claude") / "state"
REPORT_TAIL = 1500
FAILURE_TAIL = 1200
FORMAT_TIMEOUT_SECONDS = 20
HANDBACK_WAIT_SECONDS = 5.0
HANDBACK_POLL_SECONDS = 0.1
REPORT_TEMPLATE = "TASK: <id>\nSTATUS: DONE | BLOCKED\nFILES: …\nCOMMITS: …\nCHECKS: …\nNOTES: …"
REVIEW_TEMPLATE = (
    "REVIEW: <your agent name>\nVERDICT: PASS | CHANGES\nBRANCH: <the branch you reviewed>\nSCOPE: …\nFINDINGS:\n1. …"
)
PR_CREATE = re.compile(r"\bgh\s+pr\s+create\b")
PR_MERGE = re.compile(r"\bgh\s+pr\s+merge\b")
MERGE_FLAGS = {"squash": "--squash", "rebase": "--rebase", "merge": "--merge"}
PR_TEMPLATE = "PR: <number>\nVERDICT: APPROVE | CHANGES\nHEAD: <the commit you reviewed>\nCOMMENTS: …"
FIX_TEMPLATE = "PR: <number>\nSTATUS: DONE | BLOCKED\nCOMMITS: …\nREPLIES: …\nNOTES: …"


@dataclass(frozen=True)
class Context:
    """The hook input plus the project it belongs to."""

    payload: dict[str, Any]
    work_root: Path
    project_root: Path
    config: Config

    @property
    def state_root(self) -> Path:
        """Where run state (results, attempts, reviews) is kept: always the main checkout."""
        return self.project_root / STATE_DIR


def _read_payload() -> dict[str, Any]:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    data = json.loads(raw)
    return data if isinstance(data, dict) else {}


def _context(payload: dict[str, Any]) -> Context | None:
    cwd = Path(payload.get("cwd") or Path.cwd())
    work_root = find_project_root(cwd)
    if work_root is None:
        return None
    # A worker in a git worktree has its own cwd. Results still go to the main checkout.
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR")
    project_root = Path(project_dir) if project_dir else (main_checkout(work_root) or work_root)
    try:
        config = load_config(work_root)
    except ConfigError:
        return None
    return Context(payload, work_root, project_root, config)


def _write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def _block(reason: str) -> int:
    """Tell Claude to keep going, with ``reason`` as its next instruction."""
    sys.stdout.write(json.dumps({"decision": "block", "reason": reason}))
    return 0


def _final_message(payload: dict[str, Any]) -> str:
    """The agent's final report.

    An agent that hands its report back with the ``SubagentHandback`` tool ends on a tool call,
    so ``last_assistant_message`` is empty. Then the report is that call's ``message``, read from
    the agent's transcript. The stop hook can run before that line is written, so wait for it.
    """
    message = str(payload.get("last_assistant_message") or "")
    if message.strip():
        return message
    transcript = payload.get("agent_transcript_path")
    if not transcript:
        return message
    deadline = time.monotonic() + HANDBACK_WAIT_SECONDS
    while True:
        handback = _handback_message(Path(str(transcript)))
        if handback is not None:
            return handback
        if time.monotonic() >= deadline:
            return message
        time.sleep(HANDBACK_POLL_SECONDS)


def _handback_message(transcript: Path) -> str | None:
    """The ``message`` of the last ``SubagentHandback`` call in ``transcript``, if it's written yet."""
    try:
        lines = transcript.read_text(encoding="utf-8").splitlines()
    except OSError:
        return None
    for line in reversed(lines):
        try:
            entry = json.loads(line)
        except ValueError:
            continue  # a line still being written
        content = (entry.get("message") or {}).get("content") if isinstance(entry, dict) else None
        if not isinstance(content, list):
            continue
        for block in reversed(content):
            if isinstance(block, dict) and block.get("type") == "tool_use" and block.get("name") == "SubagentHandback":
                return str((block.get("input") or {}).get("message") or "")
    return None


# ---------------------------------------------------------------- subagent-stop


@dataclass(frozen=True)
class Report:
    """The REPORT block at the end of a worker's last message."""

    task: str | None
    status: str | None

    @classmethod
    def parse(cls, message: str) -> Report:
        """Find TASK and STATUS lines anywhere in the message."""
        task = re.search(r"^\s*TASK:\s*(\S+)", message, re.MULTILINE)
        status = re.search(r"^\s*STATUS:\s*(DONE|BLOCKED)\b", message, re.MULTILINE | re.IGNORECASE)
        return cls(task.group(1) if task else None, status.group(1).upper() if status else None)


class Attempts:
    """How many times one worker has been sent back, kept on disk between hook runs."""

    def __init__(self, state: Path, agent_id: str) -> None:
        self.path = state / "attempts" / f"{agent_id}.json"

    def count(self) -> int:
        """Attempts so far."""
        try:
            return int(json.loads(self.path.read_text(encoding="utf-8")).get("n", 0))
        except (OSError, ValueError):
            return 0

    def bump(self) -> int:
        """Add one attempt and return the new count."""
        n = self.count() + 1
        _write_json(self.path, {"n": n})
        return n


def _verify_task(ctx: Context, task_id: str) -> Result:
    try:
        plan = tasks.load_plan(ctx.work_root, ctx.config)
        return verify(tasks.find(plan, task_id), ctx.config, ctx.work_root)
    except tasks.PlanError as exc:
        return Result(task=task_id, title="?", agent="?", steps=[Step("load the plan", ok=False, output=str(exc))])


def subagent_stop(ctx: Context) -> int:
    """Decide whether a worker may finish."""
    agent_id = str(ctx.payload.get("agent_id") or "unknown-agent")
    message = _final_message(ctx.payload)
    report = Report.parse(message)
    attempts = Attempts(ctx.state_root, agent_id)
    max_retries = ctx.config.max_retries

    def record(status: str, **extra: object) -> None:
        name = report.task or f"unknown-{agent_id}"
        _write_json(
            ctx.state_root / "results" / f"{name}.json",
            {
                "task": report.task,
                "status": status,
                "attempts": attempts.count(),
                **extra,
                "agent": ctx.payload.get("agent_type"),
                "agent_id": agent_id,
                "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "report": message[-REPORT_TAIL:],
            },
        )

    if not report.task or not report.status:
        if attempts.bump() <= max_retries:
            return _block(f"Finish with the REPORT block from CLAUDE.md, exactly:\n{REPORT_TEMPLATE}")
        record("no-report")
        return 0

    if report.status == "BLOCKED":
        record("blocked")
        return 0

    branch = current_branch(ctx.work_root)
    rules = ctx.config.pull_request
    if branch in (rules.base, *rules.protected) and attempts.bump() <= max_retries:
        return _block(
            f"You're on {branch}. Work for {report.task} belongs on its own branch: "
            f"`git switch -c feat/{report.task}-<slug>` (your commits come with you), then finish again."
        )

    result = _verify_task(ctx, report.task)
    if result.ok and result.uncommitted:
        if attempts.bump() <= max_retries:
            record("uncommitted", uncommitted=result.uncommitted)
            return _block(
                f"Checks pass for {report.task}, but these files aren't committed: {', '.join(result.uncommitted)}.\n"
                "Commit them now as atomic commits (one logical change each, staged by path, message per the "
                "writing-commits skill), then finish again with the REPORT block."
            )
        record("pass-uncommitted", uncommitted=result.uncommitted, warnings=result.warnings)
        return 0
    if result.ok:
        record("pass", warnings=result.warnings, skipped=[s.name for s in result.steps if s.skipped])
        return 0

    n = attempts.bump()
    failing = [s for s in result.steps if not s.ok]
    record(
        "failed" if n > max_retries else "retrying",
        warnings=result.warnings,
        failing=[{"name": s.name, "output": s.output[-REPORT_TAIL:]} for s in failing],
    )
    if n > max_retries:
        return 0
    parts = [
        f"Checks failed for {report.task} (attempt {n} of {max_retries}). Fix them, then finish again "
        "with the REPORT block."
    ]
    parts += [f"\n--- {s.name} ---\n{s.output[-FAILURE_TAIL:]}" for s in failing]
    parts.append(
        "\nIf the fix needs a file outside your owns list, or a new package, stop and reply "
        "STATUS: BLOCKED with the reason."
    )
    return _block("\n".join(parts))


# ---------------------------------------------------------------- review-stop


def review_stop(ctx: Context) -> int:
    """Make a review agent end with a REVIEW block, and record its verdict for the PR gate."""
    agent_id = str(ctx.payload.get("agent_id") or "unknown-agent")
    agent_type = str(ctx.payload.get("agent_type") or "")
    message = _final_message(ctx.payload)
    block = reviews.ReviewBlock.parse(message)
    if not block.agent or not block.verdict:
        if Attempts(ctx.state_root, agent_id).bump() <= ctx.config.max_retries:
            return _block(f"Finish with the REVIEW block, exactly:\n{REVIEW_TEMPLATE}")
        return 0
    # Plugins prefix the type (``kit:design-reviewer``). The block must name the agent that ran.
    agent = agent_type.rsplit(":", 1)[-1] or block.agent
    if block.agent != agent:
        return _block(f"Your REVIEW line must name you: `REVIEW: {agent}`.")
    branch = block.branch or current_branch(ctx.work_root)
    if not branch or rev_parse(ctx.work_root, branch) is None:
        if Attempts(ctx.state_root, agent_id).bump() <= ctx.config.max_retries:
            return _block(
                f"Add the branch you reviewed to the REVIEW block: `BRANCH: <name>`. Got {branch!r}, "
                "which isn't a branch here."
            )
        return 0
    reviews.save(ctx.project_root, ctx.work_root, agent, block.verdict, branch=branch, report=message)
    return 0


# ---------------------------------------------------------------- guard-bash


def guard_bash(ctx: Context) -> int:
    """Block a Bash command that breaks the commit rules (exit 2, reason on stderr)."""
    command = str((ctx.payload.get("tool_input") or {}).get("command") or "")
    problems = commit_rules.check_command(
        command, ctx.work_root, ctx.config.commit, ctx.config.pull_request, current_branch(ctx.work_root)
    )
    if PR_MERGE.search(command):
        problems += _merge_problems(ctx, command)
    if PR_CREATE.search(command):
        problems += [
            f"review needed first: {item}" for item in reviews.gate(ctx.project_root, ctx.work_root, ctx.config)
        ]
    if not problems:
        return 0
    print("Commit guard (see the writing-commits skill):\n- " + "\n- ".join(problems), file=sys.stderr)
    return BLOCKING_EXIT


def _merge_problems(ctx: Context, command: str) -> list[str]:
    tokens = commit_rules.split_command(command)
    rules = ctx.config.pull_request
    problems = []
    flag = MERGE_FLAGS[rules.merge_method]
    if flag not in tokens:
        problems.append(f"Merge with `{flag}` (pull_request.merge_method)")
    if "--admin" in tokens:
        problems.append("`--admin` skips the branch rules. Never use it")
    number = prs.merge_number(tokens)
    if number is None:
        return [*problems, "Name the PR: `gh pr merge <number> ...`"]
    info = prs.pr_info(ctx.work_root, number)
    if info is None:
        return [*problems, f"Couldn't read PR #{number} from GitHub, so the merge can't be checked. Try again"]
    problems += prs.merge_gate(ctx.project_root, ctx.config, number, info)
    # The pre-PR reviews must still hold for the commit being merged: a fix can change what they checked.
    branch, head = str(info.get("headRefName") or ""), str(info.get("headRefOid") or "")
    if branch and head:
        fetch(ctx.work_root, branch)
        changed = [str(f.get("path")) for f in info.get("files") or [] if isinstance(f, dict)]
        problems += [
            f"pre-PR review needed again: {item}"
            for item in reviews.owed(
                ctx.project_root, ctx.work_root, ctx.config, branch=branch, head=head, changed=changed
            )
        ]
    return problems


# ---------------------------------------------------------------- pr-review-stop and pr-fix-stop


def pr_review_stop(ctx: Context) -> int:
    """Make pr-reviewer end with a PR block about the PR's current head, and record it for the merge gate."""
    agent_id = str(ctx.payload.get("agent_id") or "unknown-agent")
    message = _final_message(ctx.payload)
    block = prs.PrBlock.parse(message)
    if block.number is None or block.verdict is None or block.head is None:
        if Attempts(ctx.state_root, agent_id).bump() <= ctx.config.max_retries:
            return _block(f"Finish with the PR block, exactly:\n{PR_TEMPLATE}")
        return 0
    info = prs.pr_info(ctx.work_root, block.number)
    head = str(info.get("headRefOid") or "") if info else block.head
    if info and not prs.same_commit(block.head, head):
        if Attempts(ctx.state_root, agent_id).bump() <= ctx.config.max_retries:
            return _block(
                f"PR #{block.number} is now at {head[:12]}, but you reviewed {block.head}. "
                "Review the new commits too, then finish with the PR block again."
            )
        return 0
    prs.save(ctx.project_root, block.number, block.verdict, head, report=message)
    return 0


def pr_fix_stop(ctx: Context) -> int:
    """Make pr-fixer commit and push its fixes before it finishes."""
    agent_id = str(ctx.payload.get("agent_id") or "unknown-agent")
    message = _final_message(ctx.payload)
    number = re.search(r"^\s*PR:\s*#?(\d+)", message, re.MULTILINE)
    status = re.search(r"^\s*STATUS:\s*(DONE|BLOCKED)\b", message, re.MULTILINE | re.IGNORECASE)
    attempts = Attempts(ctx.state_root, agent_id)
    if not number or not status:
        if attempts.bump() <= ctx.config.max_retries:
            return _block(f"Finish with the FIX block, exactly:\n{FIX_TEMPLATE}")
        return 0
    if status.group(1).upper() == "BLOCKED":
        return 0
    pending = [f for f in changed_files(ctx.work_root) or [] if not is_under(f, ctx.config.ignore_paths)]
    unpushed = unpushed_commits(ctx.work_root)
    problems = []
    if pending:
        problems.append("uncommitted changes: " + ", ".join(pending[:10]))
    if unpushed is None:
        problems.append("this branch has no upstream: push it with `git push -u origin HEAD`")
    elif unpushed:
        problems.append(f"{unpushed} commit(s) not pushed: run `git push`")
    if problems and attempts.bump() <= ctx.config.max_retries:
        return _block("Before you finish: " + "; ".join(problems) + ". Then reply on each comment you fixed.")
    return 0


# ---------------------------------------------------------------- guard-agent

PR_NUMBER = re.compile(r"\bPR\s*#?(\d+)\b", re.IGNORECASE)


def guard_agent(ctx: Context) -> int:
    """Stop the review loop at ``max_review_rounds``: no new pr-fixer round once they're used up."""
    tool_input = ctx.payload.get("tool_input") or {}
    agent = str(tool_input.get("subagent_type") or "").rsplit(":", 1)[-1]
    if agent != "pr-fixer":
        return 0
    match = PR_NUMBER.search(str(tool_input.get("prompt") or ""))
    if not match:
        print("Name the pull request in pr-fixer's prompt: `PR <number>`.", file=sys.stderr)
        return BLOCKING_EXIT
    number = int(match.group(1))
    record = prs.load(ctx.project_root, number)
    limit = ctx.config.pull_request.max_review_rounds
    if record and record.verdict == "CHANGES" and record.rounds >= limit:
        print(
            f"PR #{number} has had {record.rounds} rounds of changes (limit {limit}). Don't start another: "
            "read the open threads yourself, then fix it, settle it, or ask the user.",
            file=sys.stderr,
        )
        return BLOCKING_EXIT
    return 0


# ---------------------------------------------------------------- tests-only


def _locate(ctx: Context, file_path: str) -> tuple[Path, str] | None:
    """The checkout a file belongs to and its path inside it.

    A file in a worktree under the project (``.claude/worktrees/<name>/src/a.ts``) belongs to that
    worktree, so rules written for ``src/…`` still match it.
    """
    path = Path(file_path).resolve()
    root = find_project_root(path.parent) or ctx.work_root.resolve()
    try:
        return root, path.relative_to(root).as_posix()
    except ValueError:
        return None


def tests_only(ctx: Context) -> int:
    """Block a Write or Edit outside the configured test paths (exit 2, reason on stderr)."""
    tool_input = ctx.payload.get("tool_input") or {}
    file_path = tool_input.get("file_path") or tool_input.get("notebook_path")
    if not file_path:
        return 0
    located = _locate(ctx, str(file_path))
    relative = located[1] if located else str(file_path)
    if matches_any(ctx.config.test_paths, relative):
        return 0
    allowed = ", ".join(ctx.config.test_paths)
    print(
        f"{relative} isn't a test file. You may only write files matching {allowed}. "
        "If the code itself needs a change, describe it in your report instead.",
        file=sys.stderr,
    )
    return BLOCKING_EXIT


# ---------------------------------------------------------------- format


def format_file(ctx: Context) -> int:
    """Run the first matching formatter on the edited file. Never fails the edit."""
    file_path = (ctx.payload.get("tool_input") or {}).get("file_path")
    if not file_path:
        return 0
    located = _locate(ctx, str(file_path))
    if located is None:
        return 0  # outside the project
    root, relative = located
    for rule in ctx.config.format_on_edit:
        if not re.search(rule.files, relative):
            continue
        if rule.requires_path and not (root / rule.requires_path).exists():
            continue
        if rule.requires_command and shutil.which(rule.requires_command) is None:
            continue
        command = rule.cmd.replace("{file}", shlex.quote(relative))
        with contextlib.suppress(OSError, subprocess.TimeoutExpired):
            subprocess.run(  # noqa: S602 - project-owned command line
                command, shell=True, cwd=root, capture_output=True, timeout=FORMAT_TIMEOUT_SECONDS, check=False
            )
        return 0
    return 0


# ---------------------------------------------------------------- require-commit


def require_commit(ctx: Context) -> int:
    """Send the lead back once if it tries to finish with uncommitted work."""
    if ctx.payload.get("stop_hook_active"):
        return 0  # second stop in a row: the lead chose to leave it, don't loop
    changed = changed_files(ctx.work_root)
    if not changed:
        return 0
    pending = [f for f in changed if not is_under(f, ctx.config.ignore_paths)]
    if not pending:
        return 0
    shown = "\n".join(f"  {f}" for f in pending[:15]) + ("\n  …" if len(pending) > 15 else "")
    return _block(
        f"There are uncommitted changes:\n{shown}\n\n"
        "Commit them as atomic commits before you finish: one logical change per commit, staged by path, "
        "message per the writing-commits skill. Log any decision the docs don't cover in STATE.md in the same "
        "commit. If a file must stay uncommitted on purpose (the user's own work in progress), say so and stop."
    )


HANDLERS: dict[str, Callable[[Context], int]] = {
    "subagent-stop": subagent_stop,
    "review-stop": review_stop,
    "guard-bash": guard_bash,
    "tests-only": tests_only,
    "pr-review-stop": pr_review_stop,
    "pr-fix-stop": pr_fix_stop,
    "guard-agent": guard_agent,
    "format": format_file,
    "require-commit": require_commit,
}


def run(name: str) -> int:
    """Entry point for ``orch hook <name>``."""
    try:
        payload = _read_payload()
    except ValueError:
        return 0
    ctx = _context(payload)
    if ctx is None:
        return 0
    return HANDLERS[name](ctx)
