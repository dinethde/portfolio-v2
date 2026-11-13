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


def _git(root: Path, *args: str) -> str | None:
    """Run a read-only git command and return its output, or None if it fails."""
    try:
        result = subprocess.run(
            ["git", *args], cwd=root, capture_output=True, text=True, timeout=GIT_TIMEOUT_SECONDS, check=False
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    return result.stdout if result.returncode == 0 else None


def head_commit(root: Path, *, short: bool = True) -> str | None:
    """Return the hash of HEAD, or None outside a repository."""
    output = _git(root, "rev-parse", *(["--short"] if short else []), "HEAD")
    if not output:
        return None
    return output.strip() or None


def merge_base(root: Path, base: str) -> str | None:
    """Where HEAD left ``base``, trying ``origin/<base>`` first."""
    for ref in (f"origin/{base}", base):
        output = _git(root, "merge-base", "HEAD", ref)
        if output and output.strip():
            return output.strip()
    return None


def files_between(root: Path, start: str, end: str = "HEAD") -> list[str] | None:
    """Files that differ between two commits, or None if git can't tell."""
    output = _git(root, "diff", "--name-only", f"{start}..{end}")
    return None if output is None else [line for line in output.splitlines() if line]


def changed_since_base(root: Path, base: str) -> list[str] | None:
    """Files changed on this branch since it left ``base``, committed or not."""
    start = merge_base(root, base)
    if start is None:
        return None
    committed = files_between(root, start)
    pending = changed_files(root)
    if committed is None or pending is None:
        return None
    return sorted({*committed, *pending})


def current_branch(root: Path) -> str | None:
    """The checked-out branch, or None when detached or outside a repository."""
    output = _git(root, "symbolic-ref", "--quiet", "--short", "HEAD")
    if not output:
        return None
    return output.strip() or None


def unpushed_commits(root: Path) -> int | None:
    """Commits on HEAD that its upstream doesn't have, or None without an upstream."""
    output = _git(root, "rev-list", "--count", "@{upstream}..HEAD")
    return int(output.strip()) if output and output.strip().isdigit() else None


def main_checkout(root: Path) -> Path | None:
    """The main working tree of the repository ``root`` belongs to, even from inside a linked worktree."""
    output = _git(root, "rev-parse", "--path-format=absolute", "--git-common-dir")
    if not output or not output.strip():
        return None
    common = Path(output.strip())
    return common.parent if common.name == ".git" else None


def rev_parse(root: Path, ref: str) -> str | None:
    """The full hash ``ref`` points at, or None if it doesn't name a commit."""
    output = _git(root, "rev-parse", "--verify", "--quiet", f"{ref}^{{commit}}")
    if not output:
        return None
    return output.strip() or None


def fetch(root: Path, *refs: str) -> bool:
    """Fetch ``refs`` from origin. True on success."""
    return _git(root, "fetch", "--quiet", "origin", *refs) is not None
