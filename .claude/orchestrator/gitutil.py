"""Small, read-only git helpers."""

from __future__ import annotations

import subprocess
from pathlib import Path

GIT_TIMEOUT_SECONDS = 30


def _porcelain_path(line: str) -> str:
    path = line[3:]
    if " -> " in path:  # a rename: keep the new name
        path = path.split(" -> ", 1)[1]
    return path.strip('"')


def changed_files(root: Path) -> list[str] | None:
    """Return every changed or untracked file, or None when git can't tell."""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain", "--untracked-files=all"],
            cwd=root,
            capture_output=True,
            text=True,
            timeout=GIT_TIMEOUT_SECONDS,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    return [_porcelain_path(line) for line in result.stdout.splitlines() if line.strip()]


def head_commit(root: Path) -> str | None:
    """Return the short hash of HEAD, or None outside a repository."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=root,
            capture_output=True,
            text=True,
            timeout=GIT_TIMEOUT_SECONDS,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip() or None
