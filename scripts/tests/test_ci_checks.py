"""Tests for the CI-only checks: the token scope and the bundle budget.

python3 -m unittest discover scripts/tests
"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import check_bundle
import check_secret_scope


class Repo(unittest.TestCase):
    def setUp(self) -> None:
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name).resolve()

    def write(self, rel: str, text: str) -> Path:
        path = self.root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path


class CheckSecretScopeTest(Repo):
    def test_flags_the_token_outside_lib_github(self) -> None:
        path = self.write("src/app/page.tsx", "const a = 1;\nprocess.env.GITHUB_TOKEN;\n")
        found = check_secret_scope.find_token_mentions(path, self.root)
        self.assertEqual([p.line for p in found], [2])

    def test_lib_github_may_read_it(self) -> None:
        path = self.write("src/lib/github/contributions.ts", "process.env.GITHUB_TOKEN;\n")
        self.assertEqual(check_secret_scope.find_token_mentions(path, self.root), [])

    def test_scans_only_text_files_in_src_and_public(self) -> None:
        self.write("src/a.ts", "")
        self.write("public/b.svg", "")
        self.write("public/resume.pdf", "")
        self.write("worker/index.ts", "")
        found = check_secret_scope.scan_files([], self.root)
        self.assertEqual([p.relative_to(self.root).as_posix() for p in found], ["public/b.svg", "src/a.ts"])


class CheckBundleTest(Repo):
    def test_counts_only_the_routes_first_load_chunks(self) -> None:
        self.write(".next/static/chunks/a.js", "a" * 1000)
        self.write(".next/static/chunks/other.js", "b" * 1000)
        stats = [{"route": "/", "firstLoadChunkPaths": [".next/static/chunks/a.js"]}]
        self.write(".next/diagnostics/route-bundle-stats.json", json.dumps(stats))
        count, size = check_bundle.client_js_bytes(self.root / ".next")
        self.assertEqual(count, 1)
        self.assertGreater(size, 0)

    def test_fails_over_the_limit(self) -> None:
        self.write(".next/static/chunks/a.js", "x")
        next_dir = str(self.root / ".next")
        self.assertEqual(check_bundle.main(["--dir", next_dir, "--limit-kb", "0"]), 1)
        self.assertEqual(check_bundle.main(["--dir", next_dir, "--limit-kb", "220"]), 0)

    def test_fails_without_a_build(self) -> None:
        self.assertEqual(check_bundle.main(["--dir", str(self.root / ".next")]), 1)


if __name__ == "__main__":
    unittest.main()
