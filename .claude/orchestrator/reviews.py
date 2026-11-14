"""Review results and the pull request gate.

These are the reviews that run **before** a pull request opens. A review agent ends with a
REVIEW block naming the branch it reviewed. The ``review-stop`` hook records it in
``.claude/state/reviews/<branch>/<agent>.json`` with that branch's tip, so parallel
branches never share a record.

Before ``gh pr create`` runs, :func:`gate` checks that every review the config requires for
the changed files passed on the branch's current commit, or that nothing it cares about
changed since. The merge gate runs the same check against the PR's head commit.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from orchestrator.config import Config
from orchestrator.gitutil import changed_since_base, current_branch, files_between, head_commit, rev_parse

REVIEWS_DIR = Path(".claude") / "state" / "reviews"
VERDICTS = ("PASS", "CHANGES", "ACCEPTED")
PASSING = ("PASS", "ACCEPTED")
REPORT_TAIL = 4000


@dataclass(frozen=True)
class ReviewRecord:
    """The outcome of one review run."""

    agent: str
    verdict: str
    head: str
    at: str
    report: str = ""
    reason: str = ""


@dataclass(frozen=True)
class ReviewBlock:
    """The REVIEW block a review agent ends with."""

    agent: str | None
    verdict: str | None
    branch: str | None = None

    @classmethod
    def parse(cls, message: str) -> ReviewBlock:
        """Find the REVIEW, VERDICT and BRANCH lines anywhere in the message."""
        agent = re.search(r"^\s*REVIEW:\s*(\S+)", message, re.MULTILINE)
        verdict = re.search(r"^\s*VERDICT:\s*(PASS|CHANGES)\b", message, re.MULTILINE | re.IGNORECASE)
        branch = re.search(r"^\s*BRANCH:\s*(\S+)", message, re.MULTILINE)
        return cls(
            agent.group(1) if agent else None,
            verdict.group(1).upper() if verdict else None,
            branch.group(1).strip("`") if branch else None,
        )


def branch_key(branch: str | None) -> str:
    """A folder name for a branch (``feat/P1-04-pill`` -> ``feat__P1-04-pill``)."""
    return re.sub(r"[^A-Za-z0-9._-]", "_", (branch or "detached").replace("/", "__"))


def _path(project_root: Path, branch: str | None, agent: str) -> Path:
    return project_root / REVIEWS_DIR / branch_key(branch) / f"{agent}.json"


def save(
    project_root: Path,
    work_root: Path,
    agent: str,
    verdict: str,
    *,
    branch: str | None = None,
    report: str = "",
    reason: str = "",
) -> ReviewRecord:
    """Record a review of ``branch`` (default: the branch checked out in ``work_root``) at its current tip."""
    if verdict not in VERDICTS:
        raise ValueError(f"verdict must be one of {', '.join(VERDICTS)}")
    branch = branch or current_branch(work_root)
    head = (rev_parse(work_root, branch) if branch else None) or head_commit(work_root, short=False) or ""
    record = ReviewRecord(
        agent=agent,
        verdict=verdict,
        head=head,
        at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        report=report[-REPORT_TAIL:],
        reason=reason,
    )
    path = _path(project_root, branch, agent)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(asdict(record), indent=2) + "\n", encoding="utf-8")
    return record


def load(project_root: Path, branch: str | None, agent: str) -> ReviewRecord | None:
    """The last review of ``branch`` by ``agent``, if any."""
    try:
        data = json.loads(_path(project_root, branch, agent).read_text(encoding="utf-8"))
        return ReviewRecord(**data)
    except (OSError, ValueError, TypeError):
        return None


def owed(
    project_root: Path, work_root: Path, config: Config, *, branch: str | None, head: str, changed: list[str]
) -> list[str]:
    """Reviews ``branch`` still needs at commit ``head``, given the files it changes against the PR base."""
    missing = []
    for review in config.reviews:
        pattern = re.compile(review.when_changed)
        if not any(pattern.search(f) for f in changed):
            continue
        record = load(project_root, branch, review.agent)
        if record is None:
            missing.append(f"{review.agent}: hasn't reviewed {branch}")
            continue
        if record.verdict not in PASSING:
            missing.append(f"{review.agent}: last verdict was {record.verdict}. Fix the findings and run it again")
            continue
        if record.head != head:
            since = files_between(work_root, record.head, head)
            if since is None or any(pattern.search(f) for f in since):
                missing.append(f"{review.agent}: files it checks changed after it passed. Run it again")
    return missing


def gate(project_root: Path, work_root: Path, config: Config) -> list[str]:
    """Reviews still owed before the branch checked out in ``work_root`` may open a pull request.

    Fails open when git can't say what changed: the gate never blocks on a guess.
    """
    changed = changed_since_base(work_root, config.pull_request.base)
    head = head_commit(work_root, short=False)
    if changed is None or head is None:
        return []
    return owed(project_root, work_root, config, branch=current_branch(work_root), head=head, changed=changed)
