"""Pull requests after they open: review records and the merge gate.

``pr-reviewer`` reviews an open PR on GitHub and ends with a PR block. The ``pr-review-stop``
hook records the verdict and the commit it reviewed in ``.claude/state/prs/<number>.json``.
Before ``gh pr merge`` runs, :func:`merge_gate` checks with GitHub that the PR targets the
PR base (never a protected branch), has no conflicts or failing checks, and was approved by
the reviewer on its current head commit. If GitHub can't be asked, the merge is blocked: a
merge is the one step that fails closed.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from orchestrator.config import Config

PRS_DIR = Path(".claude") / "state" / "prs"
GH_TIMEOUT_SECONDS = 30
REPORT_TAIL = 4000
PR_FIELDS = "number,state,isDraft,baseRefName,headRefName,headRefOid,mergeable,statusCheckRollup,files"
FAILED_CHECKS = {"FAILURE", "ERROR", "CANCELLED", "TIMED_OUT", "ACTION_REQUIRED", "STARTUP_FAILURE"}
PENDING_CHECKS = {"PENDING", "QUEUED", "IN_PROGRESS", "EXPECTED", "WAITING", "REQUESTED"}


def gh_command() -> str:
    """The gh executable. ``ORCH_GH`` overrides it (used by the tests)."""
    return os.environ.get("ORCH_GH", "gh")


@dataclass(frozen=True)
class PrRecord:
    """The latest review of one pull request."""

    number: int
    verdict: str
    head: str
    rounds: int
    at: str
    report: str = ""


@dataclass(frozen=True)
class PrBlock:
    """The PR block ``pr-reviewer`` ends with."""

    number: int | None
    verdict: str | None
    head: str | None

    @classmethod
    def parse(cls, message: str) -> PrBlock:
        """Find the PR, VERDICT and HEAD lines anywhere in the message."""
        number = re.search(r"^\s*PR:\s*#?(\d+)", message, re.MULTILINE)
        verdict = re.search(r"^\s*VERDICT:\s*(APPROVE|CHANGES)\b", message, re.MULTILINE | re.IGNORECASE)
        head = re.search(r"^\s*HEAD:\s*([0-9a-f]{7,40})\b", message, re.MULTILINE)
        return cls(
            int(number.group(1)) if number else None,
            verdict.group(1).upper() if verdict else None,
            head.group(1) if head else None,
        )


def _path(project_root: Path, number: int) -> Path:
    return project_root / PRS_DIR / f"{number}.json"


def load(project_root: Path, number: int) -> PrRecord | None:
    """The latest recorded review of PR ``number``, if any."""
    try:
        return PrRecord(**json.loads(_path(project_root, number).read_text(encoding="utf-8")))
    except (OSError, ValueError, TypeError):
        return None


def save(project_root: Path, number: int, verdict: str, head: str, report: str = "") -> PrRecord:
    """Record a review. Each ``CHANGES`` verdict counts as one review round."""
    previous = load(project_root, number)
    rounds = (previous.rounds if previous else 0) + (1 if verdict == "CHANGES" else 0)
    record = PrRecord(
        number=number,
        verdict=verdict,
        head=head,
        rounds=rounds,
        at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        report=report[-REPORT_TAIL:],
    )
    path = _path(project_root, number)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(asdict(record), indent=2) + "\n", encoding="utf-8")
    return record


def pr_info(work_root: Path, number: int) -> dict[str, Any] | None:
    """What GitHub says about PR ``number``, or None if gh can't tell."""
    try:
        result = subprocess.run(
            [gh_command(), "pr", "view", str(number), "--json", PR_FIELDS],
            cwd=work_root,
            capture_output=True,
            text=True,
            timeout=GH_TIMEOUT_SECONDS,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    try:
        data = json.loads(result.stdout)
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


def _check_states(info: dict[str, Any]) -> list[str]:
    states = []
    for check in info.get("statusCheckRollup") or []:
        state = check.get("conclusion") or check.get("state") or check.get("status") or ""
        states.append(str(state).upper())
    return states


def same_commit(a: str, b: str) -> bool:
    """True when two hashes name the same commit (either may be abbreviated)."""
    return bool(a and b) and (a.startswith(b) or b.startswith(a))


def merge_gate(project_root: Path, config: Config, number: int, info: dict[str, Any]) -> list[str]:
    """Reasons PR ``number`` may not be merged yet. Empty when it may."""
    rules = config.pull_request
    problems = []
    base = str(info.get("baseRefName") or "")
    if base in rules.protected:
        problems.append(f"PR #{number} targets {base}. Only a person merges into {base}")
    elif base != rules.base:
        problems.append(f"PR #{number} targets {base!r}. Agents only merge PRs into {rules.base!r}")
    if info.get("state") != "OPEN":
        problems.append(f"PR #{number} is {str(info.get('state')).lower()}, not open")
    if info.get("isDraft"):
        problems.append(f"PR #{number} is a draft")
    if info.get("mergeable") == "CONFLICTING":
        problems.append(f"PR #{number} has conflicts with {base}. Send pr-fixer to update the branch")
    states = _check_states(info)
    if any(s in FAILED_CHECKS for s in states):
        problems.append(f"PR #{number} has failing checks")
    elif any(s in PENDING_CHECKS for s in states):
        problems.append(f"PR #{number} still has checks running. Wait for them")
    record = load(project_root, number)
    head = str(info.get("headRefOid") or "")
    if record is None:
        problems.append(f"pr-reviewer hasn't reviewed PR #{number}")
    elif record.verdict != "APPROVE":
        problems.append(f"pr-reviewer's last verdict on PR #{number} was {record.verdict}")
    elif not same_commit(record.head, head):
        problems.append(f"PR #{number} changed after pr-reviewer approved it. Send pr-reviewer again")
    return problems


def merge_number(tokens: list[str]) -> int | None:
    """The PR number in a ``gh pr merge`` command (a number, ``#n`` or a PR URL)."""
    try:
        start = tokens.index("merge") + 1
    except ValueError:
        return None
    for token in tokens[start:]:
        match = re.fullmatch(r"#?(\d+)|https://github\.com/[^/]+/[^/]+/pull/(\d+)/?", token)
        if match:
            return int(match.group(1) or match.group(2))
    return None
