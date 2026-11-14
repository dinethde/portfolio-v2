#!/usr/bin/env python3
"""Fail on raw colour values outside the token file (CLAUDE.md code rules).

    python3 scripts/check_tokens.py                 scan src/
    python3 scripts/check_tokens.py <file> [...]    scan only these files

Finds hex colours and rgb(), rgba(), hsl(), hsla(), oklch() and oklab() in .ts, .tsx and .css
files, including Tailwind arbitrary values such as ``bg-[#fff]`` or ``shadow-[0_0_1px_rgba(…)]``.
Only the generated ``src/styles/design-tokens.css`` may hold them. A new colour starts in Figma.
There is no escape comment on purpose.
"""

from __future__ import annotations

import argparse
import re
import sys
from collections.abc import Sequence
from pathlib import Path

from _source_files import ROOT, Problem, relative, source_files

ALLOWED = frozenset({"src/styles/design-tokens.css"})
RAW_COLOUR = re.compile(
    r"(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])"
    r"|(?<![a-zA-Z])(?:rgba?|hsla?|oklch|oklab)\s*\("
)


def find_raw_colours(path: Path, root: Path = ROOT) -> list[Problem]:
    """Every raw colour value in one file."""
    rel = relative(path, root)
    if rel in ALLOWED:
        return []
    return [
        Problem(rel, number, f"raw colour {match.group(0)!r}: use a token class (TECH_SPEC §2.1)")
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1)
        for match in RAW_COLOUR.finditer(line)
    ]


def main(argv: Sequence[str] | None = None) -> int:
    """Scan the files and return the exit code."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="*", help="files to scan (default: everything under src/)")
    files = source_files(parser.parse_args(argv).files)
    problems = [p for f in files for p in find_raw_colours(f)]
    if problems:
        print(f"{len(problems)} raw colour value(s). A new colour starts in Figma:", file=sys.stderr)
        print("\n".join(map(str, problems)), file=sys.stderr)
        return 1
    print(f"check_tokens: {len(files)} file(s), no raw colour values")
    return 0


if __name__ == "__main__":
    sys.exit(main())
