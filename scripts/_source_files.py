"""Shared helpers for the source checks in this folder."""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_SUFFIXES = (".ts", ".tsx", ".css")


@dataclass(frozen=True)
class Problem:
    """One rule broken at one place."""

    path: str
    line: int
    message: str

    def __str__(self) -> str:
        return f"{self.path}:{self.line}: {self.message}"


def source_files(paths: Sequence[str], root: Path = ROOT) -> list[Path]:
    """The ``.ts``, ``.tsx`` and ``.css`` files to scan: the given paths, or everything under ``src/``."""
    candidates: Iterable[Path] = (root / p for p in paths) if paths else (root / "src").rglob("*")
    return sorted(p for p in candidates if p.is_file() and p.suffix in SOURCE_SUFFIXES)


def relative(path: Path, root: Path = ROOT) -> str:
    """``path`` relative to the repo root, with forward slashes."""
    return path.resolve().relative_to(root.resolve()).as_posix()
