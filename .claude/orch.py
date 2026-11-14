#!/usr/bin/env python3
"""Run ``orch`` inside a project: ``python3 .claude/orch.py <command>``.

Managed by the orchestrator kit (``orch sync``). Don't edit it here.
"""

from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from orchestrator.cli import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main(["-C", str(HERE.parent), *sys.argv[1:]] if "-C" not in sys.argv else None))
