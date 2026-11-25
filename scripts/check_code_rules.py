#!/usr/bin/env python3
"""Check the CLAUDE.md code rules that a script can check.

    python3 scripts/check_code_rules.py                 scan src/
    python3 scripts/check_code_rules.py <file> [...]    scan only these files

Fails on:
- a component file (``src/components/**/*.tsx``) longer than 250 lines
- a props type or interface declared in a ``.tsx`` file (it belongs in ``<Name>.types.ts``)
- Tailwind ``space-x-*`` or ``space-y-*`` (siblings are spaced with flex or grid ``gap``)
- ``useEffect`` without a ``// subscription: <what>`` comment on the line above

Import order is Biome's job. Margins between siblings need a reviewer's eye.
"""

from __future__ import annotations

import argparse
import re
import sys
from collections.abc import Sequence
from pathlib import Path

from _source_files import ROOT, Problem, relative, source_files

MAX_COMPONENT_LINES = 250
PROPS_DECLARATION = re.compile(r"^\s*(?:export\s+)?(?:interface|type)\s+\w*Props\b")
SPACE_UTILITY = re.compile(r"(?<![\w-])space-[xy]-")
USE_EFFECT = re.compile(r"\buseEffect\s*\(")
SUBSCRIPTION_NOTE = "// subscription:"


def check_file(path: Path, root: Path = ROOT) -> list[Problem]:
    """Every code rule one file breaks."""
    rel = relative(path, root)
    lines = path.read_text(encoding="utf-8").splitlines()
    problems: list[Problem] = []
    is_component = rel.startswith("src/components/") and rel.endswith(".tsx")
    if is_component and len(lines) > MAX_COMPONENT_LINES:
        problems.append(Problem(rel, len(lines), f"{len(lines)} lines: split it (max {MAX_COMPONENT_LINES})"))
    for number, line in enumerate(lines, start=1):
        if rel.endswith(".tsx") and PROPS_DECLARATION.match(line):
            problems.append(Problem(rel, number, f"props type in the component: move it to {path.stem}.types.ts"))
        if SPACE_UTILITY.search(line):
            problems.append(Problem(rel, number, "space-x/space-y: use flex or grid with gap-*"))
        if USE_EFFECT.search(line) and not line.lstrip().startswith(("//", "*", "import")):
            above = lines[number - 2] if number >= 2 else ""
            if SUBSCRIPTION_NOTE not in above:
                problems.append(
                    Problem(
                        rel, number, f"useEffect needs a `{SUBSCRIPTION_NOTE} <what>` comment above it, or no useEffect"
                    )
                )
    return problems


def main(argv: Sequence[str] | None = None) -> int:
    """Scan the files and return the exit code."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="*", help="files to scan (default: everything under src/)")
    files = source_files(parser.parse_args(argv).files)
    problems = [p for f in files for p in check_file(f)]
    if problems:
        print(f"{len(problems)} code rule problem(s):", file=sys.stderr)
        print("\n".join(map(str, problems)), file=sys.stderr)
        return 1
    print(f"check_code_rules: {len(files)} file(s) ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
