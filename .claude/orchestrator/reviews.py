"""Review results and the pull request gate.

A review agent ends with a REVIEW block. The ``review-stop`` hook records it in
``.claude/state/reviews/<agent>.json`` together with the commit it reviewed. Before
``gh pr create`` runs, :func:`gate` checks that every review the config requires for the
changed files passed on the current commit, or that nothing it cares about changed since.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from orchestrator.config import Config
from orchestrator.gitutil import changed_since_base, files_between, head_commit

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

    @classmethod
    def parse(cls, message: str) -> ReviewBlock:
        """Find the REVIEW and VERDICT lines anywhere in the message."""
        agent = re.search(r"^\s*REVIEW:\s*(\S+)", message, re.MULTILINE)
        verdict = re.search(r"^\s*VERDICT:\s*(PASS|CHANGES)\b", message, re.MULTILINE | re.IGNORECASE)
        return cls(agent.group(1) if agent else None, verdict.group(1).upper() if verdict else None)


def _path(project_root: Path, agent: str) -> Path:
    return project_root / REVIEWS_DIR / f"{agent}.json"


def save(
    project_root: Path, work_root: Path, agent: str, verdict: str, *, report: str = "", reason: str = ""
) -> ReviewRecord:
    """Record a review of the current commit."""
    if verdict not in VERDICTS:
        raise ValueError(f"verdict must be one of {', '.join(VERDICTS)}")
    record = ReviewRecord(
        agent=agent,
        verdict=verdict,
        head=head_commit(work_root, short=False) or "",
        at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        report=report[-REPORT_TAIL:],
        reason=reason,
    )
    path = _path(project_root, agent)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(asdict(record), indent=2) + "\n", encoding="utf-8")
    return record


def load(project_root: Path, agent: str) -> ReviewRecord | None:
    """The last recorded review by ``agent``, if any."""
    try:
        data = json.loads(_path(project_root, agent).read_text(encoding="utf-8"))
        return ReviewRecord(**data)
    except (OSError, ValueError, TypeError):
        return None


def gate(project_root: Path, work_root: Path, config: Config) -> list[str]:
    """Reviews still owed before a pull request. Empty when it may open.

    Fails open when git can't say what changed: the gate never blocks on a guess.
    """
    changed = changed_since_base(work_root, config.pull_request.base)
    head = head_commit(work_root, short=False)
    if changed is None or head is None:
        return []
    owed = []
    for review in config.reviews:
        pattern = re.compile(review.when_changed)
        if not any(pattern.search(f) for f in changed):
            continue
        record = load(project_root, review.agent)
        if record is None:
            owed.append(f"{review.agent}: hasn't run on this branch")
            continue
        if record.verdict not in PASSING:
            owed.append(f"{review.agent}: last verdict was {record.verdict}. Fix the findings and run it again")
            continue
        if record.head != head:
            since = files_between(work_root, record.head, head)
            if since is None or any(pattern.search(f) for f in since):
                owed.append(f"{review.agent}: files it checks changed after it passed. Run it again")
    return owed
