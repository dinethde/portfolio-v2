#!/usr/bin/env python3
"""Fail if the client JavaScript is over 220 KB gzip (TECH_SPEC §10, STATE D-73).

    python3 scripts/check_bundle.py [--limit-kb 220] [--dir .next]

Run it after ``bun run build``. It gzips the scripts the home page loads first (the ``/`` entry in
``.next/diagnostics/route-bundle-stats.json``) and adds up the sizes. Without that file it counts every
``.js`` file under ``.next/static``.
"""

from __future__ import annotations

import argparse
import gzip
import json
import sys
from collections.abc import Sequence
from pathlib import Path

from _source_files import ROOT

LIMIT_KB = 220
NEXT_DIR = ROOT / ".next"
ROUTE = "/"


def gzip_size(path: Path) -> int:
    """Bytes of one file after gzip."""
    return len(gzip.compress(path.read_bytes(), compresslevel=9))


def first_load_files(next_dir: Path, route: str = ROUTE) -> list[Path]:
    """The scripts a route loads first, or every script under ``static/`` if Next didn't list them."""
    stats = next_dir / "diagnostics" / "route-bundle-stats.json"
    if stats.is_file():
        for entry in json.loads(stats.read_text(encoding="utf-8")):
            if entry.get("route") == route:
                return sorted(next_dir.parent / p for p in entry["firstLoadChunkPaths"])
    return sorted((next_dir / "static").rglob("*.js"))


def client_js_bytes(next_dir: Path) -> tuple[int, int]:
    """Number of scripts and their total gzip size."""
    files = first_load_files(next_dir)
    return len(files), sum(gzip_size(f) for f in files)


def main(argv: Sequence[str] | None = None) -> int:
    """Measure the bundle and return the exit code."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--limit-kb", type=float, default=LIMIT_KB)
    parser.add_argument("--dir", type=Path, default=NEXT_DIR, help="the build folder")
    args = parser.parse_args(argv)
    if not args.dir.is_dir():
        print(f"{args.dir} not found: run `bun run build` first", file=sys.stderr)
        return 1
    count, size = client_js_bytes(args.dir)
    kb = size / 1024
    if kb > args.limit_kb:
        print(
            f"client JavaScript is {kb:.1f} KB gzip over {count} file(s); the limit is {args.limit_kb:g} KB",
            file=sys.stderr,
        )
        return 1
    print(f"check_bundle: {count} file(s), {kb:.1f} KB gzip (limit {args.limit_kb:g} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
