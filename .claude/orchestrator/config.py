"""Load and validate a project's ``.claude/orchestrator.json``.

The config is the only project-specific input to the kit. Unknown keys are an error,
so a typo can't silently switch a check off.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Any, TypeVar

CONFIG_PATH = Path(".claude") / "orchestrator.json"

LEAD = "lead"
HUMAN = "human"
DEFAULT_WORKERS = ("builder", "mechanic")


T = TypeVar("T")


class ConfigError(Exception):
    """The config file is missing, unreadable or invalid."""


@dataclass(frozen=True)
class Check:
    """A command run on a task's owned files by ``orch verify``.

    ``cmd`` may contain ``{files}``, replaced by the matching owned files, shell-quoted.
    In ``filter-errors`` mode the command checks the whole project, and only error lines
    (matched by ``error_regex`` with a ``file`` group) that point at owned files fail the task.
    """

    name: str
    cmd: str
    files: str = ".*"
    requires_path: str | None = None
    requires_command: str | None = None
    mode: str = "files"
    error_regex: str | None = None


@dataclass(frozen=True)
class FormatRule:
    """A formatter run after every Write or Edit. ``cmd`` may contain ``{file}``."""

    files: str
    cmd: str
    requires_path: str | None = None
    requires_command: str | None = None


@dataclass(frozen=True)
class CommitRules:
    """Limits checked by the commit guard."""

    max_subject_length: int = 60
    types: tuple[str, ...] = (
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
    )
    extra_banned_words: tuple[str, ...] = ()


@dataclass(frozen=True)
class PullRequestRules:
    """Limits checked when an agent runs ``gh pr create``."""

    base: str = "main"
    max_words: int = 200


@dataclass(frozen=True)
class Config:
    """Everything the kit needs to know about one project."""

    plan_dir: str = "plan"
    task_id_pattern: str = r"^[A-Z]+\d+-\d+$"
    workers: tuple[str, ...] = DEFAULT_WORKERS
    max_parallel: int = 3
    max_retries: int = 3
    command_timeout_seconds: int = 480
    full_verify: str | None = None
    core_paths: tuple[str, ...] = ()
    ignore_paths: tuple[str, ...] = (".claude/state/",)
    checks: tuple[Check, ...] = ()
    format_on_edit: tuple[FormatRule, ...] = ()
    commit: CommitRules = field(default_factory=CommitRules)
    pull_request: PullRequestRules = field(default_factory=PullRequestRules)

    @property
    def agents(self) -> tuple[str, ...]:
        """Every valid value for a task's ``agent`` field."""
        return (LEAD, *self.workers, HUMAN)


def _build(cls: type[T], raw: object, where: str) -> T:
    """Create dataclass ``cls`` from a JSON object, rejecting unknown keys."""
    if not isinstance(raw, dict):
        raise ConfigError(f"{where} must be an object")
    known = set(getattr(cls, "__dataclass_fields__", {}))
    unknown = sorted(set(raw) - known)
    if unknown:
        raise ConfigError(f"{where}: unknown key(s) {', '.join(unknown)}")
    values = {k: tuple(v) if isinstance(v, list) else v for k, v in raw.items()}
    try:
        return cls(**values)
    except TypeError as exc:
        raise ConfigError(f"{where}: {exc}") from exc


def parse_config(raw: dict[str, Any]) -> Config:
    """Turn the decoded JSON into a validated :class:`Config`."""
    data = {k: v for k, v in raw.items() if not k.startswith("$") and not k.startswith("_")}
    checks = tuple(_build(Check, c, f"checks[{i}]") for i, c in enumerate(data.pop("checks", [])))
    fmt = tuple(_build(FormatRule, r, f"format_on_edit[{i}]") for i, r in enumerate(data.pop("format_on_edit", [])))
    commit = _build(CommitRules, data.pop("commit", {}), "commit")
    pr = _build(PullRequestRules, data.pop("pull_request", {}), "pull_request")
    config = _build(Config, data, "orchestrator.json")
    config = replace(config, checks=checks, format_on_edit=fmt, commit=commit, pull_request=pr)
    _validate(config)
    return config


def _validate(config: Config) -> None:
    for pattern, where in (
        [(config.task_id_pattern, "task_id_pattern")]
        + [(c.files, f"check {c.name!r} files") for c in config.checks]
        + [(r.files, "format_on_edit files") for r in config.format_on_edit]
    ):
        try:
            re.compile(pattern)
        except re.error as exc:
            raise ConfigError(f"{where}: bad regex {pattern!r}: {exc}") from exc
    for check in config.checks:
        if check.mode not in ("files", "filter-errors"):
            raise ConfigError(f"check {check.name!r}: mode must be 'files' or 'filter-errors'")
        if check.mode == "filter-errors" and not check.error_regex:
            raise ConfigError(f"check {check.name!r}: filter-errors mode needs error_regex")
    if config.max_parallel < 1 or config.max_retries < 0:
        raise ConfigError("max_parallel must be at least 1 and max_retries at least 0")
    clash = {LEAD, HUMAN} & set(config.workers)
    if clash:
        raise ConfigError(f"workers can't be named {', '.join(sorted(clash))}")


def load_config(root: Path) -> Config:
    """Read the config of the project at ``root``."""
    path = root / CONFIG_PATH
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ConfigError(f"{CONFIG_PATH} not found in {root}. Run `orch init` from the kit first.") from exc
    except ValueError as exc:
        raise ConfigError(f"{CONFIG_PATH} is not valid JSON: {exc}") from exc
    return parse_config(raw)


def find_project_root(start: Path) -> Path | None:
    """Walk up from ``start`` to the first folder that holds the config."""
    start = start.resolve()
    for folder in (start, *start.parents):
        if (folder / CONFIG_PATH).is_file():
            return folder
    return None
