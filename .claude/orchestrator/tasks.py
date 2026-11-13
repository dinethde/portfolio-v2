"""The plan: one Markdown file per task in the plan folder.

Each file is named ``<id>.md`` and starts with front matter (see :mod:`frontmatter`).
The files are the source of truth for the plan and its status. They are versioned
with the code, so every status change is a commit.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field, replace
from pathlib import Path

from orchestrator import frontmatter
from orchestrator.config import HUMAN, LEAD, Config
from orchestrator.patterns import overlaps

FILE_STATUSES = ("todo", "done", "blocked")
"""Written in the task file and committed. ``done`` is set on the task's own branch, so it reaches
the PR base only when the PR merges."""
RUNTIME_STATUSES = ("doing", "review")
"""Kept in ``.claude/state/status.json``, never committed: ``doing`` while it's built, ``review``
while its PR is open. They change many times a day and would only cause merge conflicts in git."""
STATUSES = FILE_STATUSES + RUNTIME_STATUSES
RUNTIME_FILE = Path(".claude") / "state" / "status.json"
REQUIRED = ("id", "title", "agent", "status")
LIST_FIELDS = ("needs", "owns", "read", "figma", "verify")
README = "README.md"


class PlanError(Exception):
    """A task file can't be read or the plan as a whole is inconsistent."""


@dataclass(frozen=True)
class Task:
    """One unit of work, as written in its task file."""

    id: str
    title: str
    agent: str
    status: str
    path: Path
    body: str = ""
    needs: tuple[str, ...] = ()
    owns: tuple[str, ...] = ()
    read: tuple[str, ...] = ()
    figma: tuple[str, ...] = ()
    verify: tuple[str, ...] = ()

    @property
    def phase(self) -> str:
        """The id up to the last dash, for example ``P1`` for ``P1-04``."""
        return self.id.rsplit("-", 1)[0]

    @property
    def is_worker_task(self) -> bool:
        """True when a subagent does this task."""
        return self.agent not in (LEAD, HUMAN)


def _as_list(value: frontmatter.Value, key: str, path: Path) -> tuple[str, ...]:
    if isinstance(value, str):
        raise PlanError(f"{path.name}: {key!r} must be a list")
    return tuple(value)


def load_task(path: Path) -> Task:
    """Read one task file."""
    try:
        fields, body = frontmatter.parse(path.read_text(encoding="utf-8"))
    except frontmatter.FrontMatterError as exc:
        raise PlanError(f"{path.name}: {exc}") from exc
    missing = [k for k in REQUIRED if not isinstance(fields.get(k), str) or not fields[k]]
    if missing:
        raise PlanError(f"{path.name}: missing {', '.join(missing)}")
    unknown = sorted(set(fields) - set(REQUIRED) - set(LIST_FIELDS))
    if unknown:
        raise PlanError(f"{path.name}: unknown field(s) {', '.join(unknown)}")
    lists = {k: _as_list(fields[k], k, path) for k in LIST_FIELDS if k in fields}
    return Task(
        id=str(fields["id"]),
        title=str(fields["title"]),
        agent=str(fields["agent"]),
        status=str(fields["status"]),
        path=path,
        body=body,
        needs=lists.get("needs", ()),
        owns=lists.get("owns", ()),
        read=lists.get("read", ()),
        figma=lists.get("figma", ()),
        verify=lists.get("verify", ()),
    )


def load_plan(root: Path, config: Config) -> list[Task]:
    """Read every task file, sorted by id, and check the plan is consistent."""
    folder = root / config.plan_dir
    if not folder.is_dir():
        raise PlanError(f"plan folder {config.plan_dir}/ not found")
    tasks = [load_task(p) for p in sorted(folder.glob("*.md")) if p.name != README]
    problems = validate(tasks, config)
    if problems:
        raise PlanError("the plan has problems:\n  " + "\n  ".join(problems))
    return sorted(tasks, key=lambda t: _sort_key(t.id))


def _sort_key(task_id: str) -> list[object]:
    return [int(part) if part.isdigit() else part for part in re.split(r"(\d+)", task_id)]


def validate(tasks: list[Task], config: Config) -> list[str]:
    """Return every problem in the plan. An empty list means it's consistent."""
    problems: list[str] = []
    id_pattern = re.compile(config.task_id_pattern)
    by_id: dict[str, Task] = {}
    for task in tasks:
        where = task.path.name
        if task.id in by_id:
            problems.append(f"{where}: id {task.id} is used twice")
        by_id[task.id] = task
        if task.path.stem != task.id:
            problems.append(f"{where}: file name must be {task.id}.md")
        if not id_pattern.match(task.id):
            problems.append(f"{where}: id doesn't match {config.task_id_pattern}")
        if task.agent not in config.agents:
            problems.append(f"{where}: agent must be one of {', '.join(config.agents)}")
        if task.status not in FILE_STATUSES:
            problems.append(f"{where}: status must be one of {', '.join(FILE_STATUSES)}")
        if task.agent != HUMAN and not task.verify:
            problems.append(f"{where}: needs at least one verify command")
        if task.is_worker_task and not task.owns:
            problems.append(f"{where}: a worker task must list the files it owns")
    for task in tasks:
        for need in task.needs:
            if need not in by_id:
                problems.append(f"{task.path.name}: needs unknown task {need}")
    problems.extend(_cycles(by_id))
    return problems


def _cycles(by_id: dict[str, Task]) -> list[str]:
    state: dict[str, int] = {}

    def visit(task_id: str, trail: list[str]) -> str | None:
        if state.get(task_id) == 1:
            return " -> ".join([*trail[trail.index(task_id) :], task_id])
        if state.get(task_id) == 2 or task_id not in by_id:
            return None
        state[task_id] = 1
        for need in by_id[task_id].needs:
            found = visit(need, [*trail, task_id])
            if found:
                return found
        state[task_id] = 2
        return None

    for task_id in by_id:
        cycle = visit(task_id, [])
        if cycle:
            return [f"dependency cycle: {cycle}"]
    return []


def find(tasks: list[Task], task_id: str) -> Task:
    """Return the task with ``task_id``."""
    for task in tasks:
        if task.id == task_id:
            return task
    raise PlanError(f"no task {task_id}")


def ready(tasks: list[Task]) -> list[Task]:
    """Tasks still to do whose every dependency is done."""
    done = {t.id for t in tasks if t.status == "done"}
    return [t for t in tasks if t.status == "todo" and set(t.needs) <= done]


@dataclass
class Wave:
    """What to start next: the lead's own task, worker tasks to run in parallel, and the rest."""

    lead: list[Task] = field(default_factory=list)
    workers: list[Task] = field(default_factory=list)
    waiting: list[Task] = field(default_factory=list)
    human: list[Task] = field(default_factory=list)
    running: list[Task] = field(default_factory=list)
    in_review: list[Task] = field(default_factory=list)


def _clashes(task: Task, others: list[Task]) -> bool:
    return any(overlaps(a, b) for other in others for a in task.owns for b in other.owns)


def next_wave(tasks: list[Task], max_parallel: int) -> Wave:
    """Pick the next wave.

    Worker tasks join the wave in plan order while there is room and their ``owns``
    don't overlap a running task, an open pull request, a ready lead task or one already picked.
    Only ``done`` (merged) satisfies a dependency, so a task never builds on unmerged work.
    """
    wave = Wave(running=[t for t in tasks if t.status == "doing"], in_review=[t for t in tasks if t.status == "review"])
    candidates = ready(tasks)
    wave.lead = [t for t in candidates if t.agent == LEAD]
    wave.human = [t for t in candidates if t.agent == HUMAN]
    room = max_parallel - sum(1 for t in wave.running if t.is_worker_task)
    busy = wave.running + wave.in_review + wave.lead
    for task in (t for t in candidates if t.is_worker_task):
        if room > 0 and not _clashes(task, busy + wave.workers):
            wave.workers.append(task)
            room -= 1
        else:
            wave.waiting.append(task)
    return wave


def _read_runtime(state_root: Path) -> dict[str, str]:
    try:
        data = json.loads((state_root / RUNTIME_FILE).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    return {str(k): str(v) for k, v in data.items()} if isinstance(data, dict) else {}


def with_runtime(tasks: list[Task], state_root: Path) -> list[Task]:
    """The tasks with their ``doing`` and ``review`` states applied. A task the file calls done stays done."""
    runtime = _read_runtime(state_root)
    return [replace(t, status=runtime[t.id]) if t.status == "todo" and t.id in runtime else t for t in tasks]


def set_status(task: Task, status: str, state_root: Path) -> None:
    """Set a task's status: ``doing`` and ``review`` in the run state, the rest in its file."""
    if status not in STATUSES:
        raise PlanError(f"status must be one of {', '.join(STATUSES)}")
    runtime = _read_runtime(state_root)
    runtime.pop(task.id, None)
    if status in RUNTIME_STATUSES:
        runtime[task.id] = status
    else:
        text = task.path.read_text(encoding="utf-8")
        task.path.write_text(frontmatter.set_scalar(text, "status", status), encoding="utf-8")
    path = state_root / RUNTIME_FILE
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(runtime, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def render(task: Task) -> str:
    """The task as a worker reads it: fields first, then the instructions."""
    lines = [f"{task.id} · {task.title} · {task.agent} · {task.status}"]
    for label, values in (("Needs", task.needs), ("Owns", task.owns), ("Read", task.read), ("Figma", task.figma)):
        if values:
            lines.append(f"{label}:")
            lines.extend(f"  - {v}" for v in values)
    if task.verify:
        lines.append("Verify (each must exit 0):")
        lines.extend(f"  - {v}" for v in task.verify)
    if task.body:
        lines += ["", task.body]
    return "\n".join(lines)
