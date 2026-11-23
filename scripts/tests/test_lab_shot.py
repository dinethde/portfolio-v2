"""Tests for the lab screenshot script.

python3 -m unittest discover scripts/tests
"""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import lab_shot


class CheckId(unittest.TestCase):
    def setUp(self) -> None:
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.entries = Path(tmp.name)
        (self.entries / "menu-link.lab.tsx").write_text("", encoding="utf-8")

    def test_accepts_an_existing_entry(self) -> None:
        self.assertIsNone(lab_shot.check_id("menu-link", self.entries))

    def test_rejects_ids_that_could_escape_the_selector_or_path(self) -> None:
        for bad in ["../page", "Menu", "menu link", "menu-", "", "a#b"]:
            with self.subTest(bad=bad):
                self.assertIn("isn't a lab id", lab_shot.check_id(bad, self.entries) or "")

    def test_rejects_a_missing_entry(self) -> None:
        self.assertIn("no lab entry", lab_shot.check_id("no-such-entry", lab_shot.ENTRY_DIR) or "")


class PlaywrightEnv(unittest.TestCase):
    def test_drops_ci_so_the_dev_server_is_reused(self) -> None:
        env = lab_shot.playwright_env("smoke", {"CI": "1", "PATH": "/bin"}, 3456)
        self.assertNotIn("CI", env)
        self.assertEqual(env["PLAYWRIGHT_BASE_URL"], "http://localhost:3456")
        self.assertEqual(env["PATH"], "/bin")
        self.assertEqual(env["LAB_ID"], "smoke")
        self.assertEqual(env["LAB_OUT"], "tests/visual/out")


class LabPort(unittest.TestCase):
    def test_uses_lab_port_when_set(self) -> None:
        self.assertEqual(lab_shot.lab_port(Path("/a"), {"LAB_PORT": "4100"}), 4100)

    def test_gives_each_checkout_its_own_stable_port(self) -> None:
        main = lab_shot.lab_port(Path("/repo"), {})
        worktree = lab_shot.lab_port(Path("/repo/.claude/worktrees/P2-06"), {})
        self.assertEqual(main, lab_shot.lab_port(Path("/repo"), {}))
        self.assertNotEqual(main, worktree)
        for port in (main, worktree):
            self.assertTrue(3100 <= port < 3900)


if __name__ == "__main__":
    unittest.main()
