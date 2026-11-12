"""Run the checks for one task: the configured checks on its owned files, then its own commands."""

from __future__ import annotations

import os
import re
import shlex
import shutil
import subprocess
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

from orchestrator.config import Check, Config
from orchestrator.gitutil import changed_files
from orchestrator.patterns import is_glob, is_under, matches_any
from orchestrator.tasks import Task

OUTPUT_TAIL_LINES = 40
TIMED_OUT = 124


@dataclass
class Step:
    """One check and how it went."""

    name: str
    ok: bool
    skipped: bool = False
    output: str = ""


@dataclass
class Result:
    """Everything ``orch verify`` found for one task."""

    task: str
    title: str
    agent: str
    steps: list[Step] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    uncommitted: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        """True when no step failed."""
        return all(step.ok for step in self.steps)

    def to_dict(self) -> dict[str, Any]:
        """A JSON-ready dict, with ``ok`` included."""
        return {**asdict(self), "ok": self.ok}


def tail(text: str, lines: int = OUTPUT_TAIL_LINES) -> str:
    """The last ``lines`` lines of ``text``."""
    return "\n".join(text.strip().splitlines()[-lines:])


def run_shell(command: str, cwd: Path, timeout: int) -> tuple[int, str]:
    """Run a command from the config or a task file and return its exit code and output.

    These commands are written by the project owner (``bun run test x``, pipes and
    ``&&`` included), so they run through the shell on purpose.
    """
    env = {**os.environ, "FORCE_COLOR": "0", "NO_COLOR": "1"}
    try:
        result = subprocess.run(  # noqa: S602 - trusted, project-owned command lines
            command, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout, env=env, check=False
        )
    except subprocess.TimeoutExpired:
        return TIMED_OUT, f"timed out after {timeout}s: {command}"
    return result.returncode, (result.stdout or "") + (result.stderr or "")


def _available(check: Check, root: Path) -> bool:
    if check.requires_path and not (root / check.requires_path).exists():
        return False
    return not (check.requires_command and shutil.which(check.requires_command) is None)


def run_check(
    check: Check, files: list[str], owns: tuple[str, ...], root: Path, timeout: int
) -> tuple[Step, str | None]:
    """Run one configured check. Returns the step and an optional warning."""
    pattern = re.compile(check.files)
    targets = [f for f in files if pattern.search(f)]
    if not targets or not _available(check, root):
        return Step(check.name, ok=True, skipped=True), None

    command = check.cmd.replace("{files}", " ".join(shlex.quote(f) for f in targets))
    code, output = run_shell(command, root, timeout)
    if check.mode == "files":
        return Step(check.name, ok=code == 0, output="" if code == 0 else tail(output)), None

    error_line = re.compile(check.error_regex or "")
    mine: list[str] = []
    others: set[str] = set()
    for line in output.splitlines():
        match = error_line.match(line)
        if not match:
            continue
        path = os.path.relpath(os.path.normpath(root / match.group("file").strip()), root)
        if matches_any(owns, path):
            mine.append(line)
        else:
            others.add(path)
    if code != 0 and not mine and not others:
        # The tool failed without a recognisable error line (a crash or bad config). Don't hide it.
        return Step(check.name, ok=False, output=tail(output)), None
    warning = None
    if others:
        sample = ", ".join(sorted(others)[:5])
        warning = f"{check.name}: errors in {len(others)} file(s) outside this task (the lead will see them): {sample}"
    return Step(check.name, ok=not mine, output="\n".join(mine[-OUTPUT_TAIL_LINES:])), warning


def verify(task: Task, config: Config, root: Path) -> Result:
    """Run every check for ``task`` from the folder ``root``."""
    result = Result(task=task.id, title=task.title, agent=task.agent)
    timeout = config.command_timeout_seconds

    literal = [p for p in task.owns if not is_glob(p)]
    missing = [p for p in literal if not (root / p).exists()]
    result.steps.append(
        Step("owned files exist", ok=not missing, output="missing:\n" + "\n".join(missing) if missing else "")
    )

    present = sorted({*(p for p in literal if (root / p).exists()), *expand_globs(task.owns, root)})
    for check in config.checks:
        step, warning = run_check(check, present, task.owns, root, timeout)
        result.steps.append(step)
        if warning:
            result.warnings.append(warning)

    for command in task.verify:
        code, output = run_shell(command, root, timeout)
        result.steps.append(Step(f"verify: {command}", ok=code == 0, output="" if code == 0 else tail(output)))

    changed = changed_files(root)
    if changed is not None:
        outside = [f for f in changed if not matches_any(task.owns, f) and not is_under(f, config.ignore_paths)]
        if outside:
            more = " …" if len(outside) > 8 else ""
            result.warnings.append(
                "changed files outside owns (maybe another task running at the same time): "
                + ", ".join(outside[:8])
                + more
            )
        result.uncommitted = [f for f in changed if matches_any(task.owns, f)]
    return result


def expand_globs(owns: tuple[str, ...], root: Path) -> list[str]:
    """Every existing file under ``root`` that a glob in ``owns`` matches."""
    found: set[str] = set()
    for pattern in (p for p in owns if is_glob(p)):
        prefix = pattern.split("*", 1)[0]
        base = root / prefix.rsplit("/", 1)[0] if "/" in prefix else root
        if not base.is_dir():
            continue
        for path in base.rglob("*"):
            relative = path.relative_to(root).as_posix()
            if path.is_file() and matches_any((pattern,), relative):
                found.add(relative)
    return sorted(found)


def format_result(result: Result) -> str:
    """Human-readable report, ending with ``RESULT: PASS`` or ``RESULT: FAIL``."""
    lines = [f"{result.task} · {result.title} · {result.agent}"]
    for step in result.steps:
        label = "SKIP" if step.skipped else "PASS" if step.ok else "FAIL"
        lines.append(f"  {label}  {step.name}")
        if not step.ok and step.output:
            lines.extend("        " + line for line in step.output.splitlines())
    lines.extend(f"  WARN  {w}" for w in result.warnings)
    if result.uncommitted:
        lines.append("  TODO  commit these as atomic commits: " + ", ".join(result.uncommitted))
    lines.append("RESULT: PASS" if result.ok else "RESULT: FAIL")
    return "\n".join(lines)
