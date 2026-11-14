"""Tests for the source checks and the token builder.

python3 -m unittest discover scripts/tests
"""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import build_tokens
import check_code_rules
import check_tokens


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


class CheckTokensTest(Repo):
    def test_finds_raw_colours(self) -> None:
        path = self.write("src/a.tsx", 'x = "bg-[#fff]"\ny = "shadow-[0_0_1px_rgba(0,0,0,.1)]"\nz = "#a1"\n')
        found = check_tokens.find_raw_colours(path, self.root)
        self.assertEqual([p.line for p in found], [1, 2])

    def test_token_file_is_allowed(self) -> None:
        path = self.write("src/styles/design-tokens.css", "--c: #ffffff;\n")
        self.assertEqual(check_tokens.find_raw_colours(path, self.root), [])

    def test_ignores_ids_and_entities(self) -> None:
        path = self.write("src/a.tsx", 'href="#story" text="&#123;" class="bg-surface-page-active"\n')
        self.assertEqual(check_tokens.find_raw_colours(path, self.root), [])


class CodeRulesTest(Repo):
    def messages(self, rel: str, text: str) -> list[str]:
        return [p.message for p in check_code_rules.check_file(self.write(rel, text), self.root)]

    def test_props_and_spacing(self) -> None:
        text = "export interface PillProps {}\n<div className='space-y-4'/>\n"
        found = self.messages("src/components/ui/Pill.tsx", text)
        self.assertEqual(len(found), 2)

    def test_use_effect(self) -> None:
        bad = "useEffect(() => {}, [])\n"
        good = "// subscription: window resize\nuseEffect(() => {}, [])\n"
        self.assertEqual(len(self.messages("src/hooks/a.ts", bad)), 1)
        self.assertEqual(self.messages("src/hooks/b.ts", good), [])

    def test_length(self) -> None:
        self.assertEqual(len(self.messages("src/components/ui/Big.tsx", "x\n" * 251)), 1)
        self.assertEqual(self.messages("src/lib/big.ts", "x\n" * 251), [])


class BuildTokensTest(unittest.TestCase):
    def test_color_names(self) -> None:
        self.assertEqual(build_tokens.color_var("text/neutral/p1/active"), "--color-txt-neutral-p1-active")
        self.assertEqual(build_tokens.color_var("bg/surface/page/active"), "--color-surface-page-active")
        self.assertEqual(build_tokens.color_var("components/pill/modern/border"), "--color-pill-modern-border")
        self.assertEqual(build_tokens.color_var("neutral/1100"), "--color-neutral-1100")

    def test_missing_alias(self) -> None:
        data = {
            "variables": [{"name": "bg/x/y", "collection": build_tokens.SEMANTIC_COLLECTION, "alias": "nope/1"}],
            "textStyles": [],
        }
        with self.assertRaises(build_tokens.TokenError):
            build_tokens.build(data)

    def test_committed_file_is_current(self) -> None:
        self.assertEqual(build_tokens.main(["--check"]), 0)


if __name__ == "__main__":
    unittest.main()
