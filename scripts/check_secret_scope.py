#!/usr/bin/env python3
"""Fail if GITHUB_TOKEN appears outside src/lib/github/ (TECH_SPEC §8).

    python3 scripts/check_secret_scope.py                 scan src/ and public/
    python3 scripts/check_secret_scope.py <file> [...]    scan only these files

The token is read in one place. Anything else under src/ or public/ that names it is a leak risk.
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence
from pathlib import Path

from _source_files import ROOT, Problem, relative

NAME = "GITHUB_TOKEN"
ALLOWED_PREFIX = "src/lib/github/"
SCANNED_DIRS = ("src", "public")
TEXT_SUFFIXES = frozenset(
    {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".md", ".mdx", ".html", ".svg"}
)


def scan_files(paths: Sequence[str], root: Path = ROOT) -> list[Path]:
    """The given files, or every text file under src/ and public/."""
    if paths:
        return sorted(p for p in (root / x for x in paths) if p.is_file())
    found = (p for d in SCANNED_DIRS for p in (root / d).rglob("*") if p.is_file())
    return sorted(p for p in found if p.suffix in TEXT_SUFFIXES)


def find_token_mentions(path: Path, root: Path = ROOT) -> list[Problem]:
    """Every line in one file that names the token, unless the file is in src/lib/github/."""
    rel = relative(path, root)
    if rel.startswith(ALLOWED_PREFIX):
        return []
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    return [
        Problem(rel, number, f"{NAME} outside {ALLOWED_PREFIX} (TECH_SPEC §8)")
        for number, line in enumerate(lines, start=1)
        if NAME in line
    ]


def main(argv: Sequence[str] | None = None) -> int:
    """Scan the files and return the exit code."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="*", help="files to scan (default: src/ and public/)")
    files = scan_files(parser.parse_args(argv).files)
    problems = [p for f in files for p in find_token_mentions(f)]
    if problems:
        print(f"{len(problems)} mention(s) of {NAME} outside {ALLOWED_PREFIX}:", file=sys.stderr)
        print("\n".join(map(str, problems)), file=sys.stderr)
        return 1
    print(f"check_secret_scope: {len(files)} file(s), {NAME} stays in {ALLOWED_PREFIX}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
