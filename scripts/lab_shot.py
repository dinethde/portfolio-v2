#!/usr/bin/env python3
"""Screenshot one component lab entry at 390, 834 and 1440.

    python3 scripts/lab_shot.py <id>     (or: bun run lab:shot <id>)

Shoots ``#lab-<id>`` from ``/lab?only=<id>`` into ``tests/visual/out/<id>-<width>.png``.
Starts ``bun run dev`` if nothing answers on port 3000, and stops it again afterwards.
The browser work is ``tests/e2e/lab-shot.spec.ts``; Playwright reuses the running dev server.
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from collections.abc import Sequence
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "http://localhost:3000"
OUT_DIR = "tests/visual/out"
SPEC = "tests/e2e/lab-shot.spec.ts"
ENTRY_DIR = ROOT / "src/app/(dev)/lab/entries"
ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
START_TIMEOUT_S = 90


def server_up(url: str = BASE_URL) -> bool:
    """True if something answers HTTP on ``url``."""
    try:
        with urllib.request.urlopen(url, timeout=2):
            return True
    except urllib.error.HTTPError:
        return True  # it answered, even if with an error page
    except (urllib.error.URLError, OSError):
        return False


def check_id(entry_id: str, entry_dir: Path = ENTRY_DIR) -> str | None:
    """The problem with ``entry_id``, or None if it names an existing lab entry."""
    if not ID_PATTERN.match(entry_id):
        return f"'{entry_id}' isn't a lab id (lowercase words joined by '-')"
    if not (entry_dir / f"{entry_id}.lab.tsx").is_file():
        return f"no lab entry at {(entry_dir / f'{entry_id}.lab.tsx').relative_to(ROOT)}"
    return None


def playwright_env(entry_id: str, base: dict[str, str]) -> dict[str, str]:
    """The environment for the spec. ``CI`` is dropped so Playwright reuses the dev server."""
    env = {k: v for k, v in base.items() if k != "CI"}
    env["LAB_ID"] = entry_id
    env["LAB_OUT"] = OUT_DIR
    return env


def start_dev_server() -> subprocess.Popen[bytes]:
    """Start ``bun run dev`` and wait until it answers."""
    proc = subprocess.Popen(
        ["bun", "run", "dev"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True
    )
    deadline = time.monotonic() + START_TIMEOUT_S
    while time.monotonic() < deadline:
        if proc.poll() is not None:
            raise RuntimeError("bun run dev exited before it started")
        if server_up():
            return proc
        time.sleep(0.5)
    proc.terminate()
    raise RuntimeError(f"the dev server didn't answer within {START_TIMEOUT_S}s")


def main(argv: Sequence[str] | None = None) -> int:
    """Shoot the entry. Returns the exit code."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("id", help="the lab entry id, the <id> in entries/<id>.lab.tsx")
    entry_id = parser.parse_args(argv).id
    problem = check_id(entry_id)
    if problem:
        print(f"lab_shot: {problem}", file=sys.stderr)
        return 2

    server = None
    try:
        if not server_up():
            print("lab_shot: starting bun run dev")
            server = start_dev_server()
        result = subprocess.run(
            ["bunx", "playwright", "test", SPEC, "--project=chromium"],
            cwd=ROOT,
            env=playwright_env(entry_id, dict(os.environ)),
            check=False,
        )
    except RuntimeError as exc:
        print(f"lab_shot: {exc}", file=sys.stderr)
        return 2
    finally:
        if server is not None:
            server.terminate()
            server.wait(timeout=10)

    if result.returncode == 0:
        print(f"lab_shot: wrote {OUT_DIR}/{entry_id}-{{390,834,1440}}.png")
    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
