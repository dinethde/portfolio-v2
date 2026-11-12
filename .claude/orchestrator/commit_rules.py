"""Check git and gh command lines against the commit rules (the ``writing-commits`` skill).

Everything here is a pure function of the command text, so it is easy to test. Anything
that can't be parsed is let through: the guard never blocks on a guess.
"""

from __future__ import annotations

import re
import shlex
from pathlib import Path

from orchestrator.config import CommitRules, PullRequestRules

ATTRIBUTION = re.compile(
    r"co-authored-by|generated (with|by)|noreply@anthropic|\bclaude(\.ai| code| opus| sonnet| haiku)\b"
    r"|claude-session|\bwritten by (ai|an ai|claude|chatgpt|copilot)\b",
    re.IGNORECASE,
)
FILLER_WORDS = (
    "comprehensive",
    "robust",
    "seamless",
    "seamlessly",
    "streamline",
    "streamlined",
    "leverage",
    "leverages",
    "utilize",
    "utilizes",
    "enhance",
    "enhanced",
    "enhances",
    "facilitate",
    "facilitates",
    "delve",
    "intricate",
    "pivotal",
    "crucial",
    "significant",
    "significantly",
    "cutting-edge",
    "elegant",
    "performant",
    "extensible",
    "ensure that",
    "in order to",
)
DEAD_OPENING = re.compile(
    r"^\s*(this commit|this change|this pr|this pull request|overall,|additionally,)", re.IGNORECASE | re.MULTILINE
)
EMOJI = re.compile("[\U0001f300-\U0001faff\U00002600-\U000027bf\U0001f000-\U0001f2ff⭐✅]")
STAGE_ALL = re.compile(r"\bgit\s+add\s+(?:-A\b|--all\b|-u\b|--update\b|\.(?=\s|$|[;&|]))")
COMMIT_ALL = re.compile(r"\bgit\s+commit\b[^|;&]*\s-[a-zA-Z]*a[a-zA-Z]*\b")
HEREDOC = re.compile(r"<<-?\s*['\"]?(\w+)['\"]?\s*\n(.*?)\n\s*\1\b", re.DOTALL)
UNPROVEN_CLAIM = re.compile(r"all tests pass", re.IGNORECASE)


def check_text(text: str, what: str, extra_words: tuple[str, ...] = ()) -> list[str]:
    """Problems with free text: attribution, emoji, filler words and dead openings."""
    problems = []
    if ATTRIBUTION.search(text):
        problems.append(f"{what} has tool attribution. Remove it")
    if EMOJI.search(text):
        problems.append(f"{what} has emoji")
    lowered = text.lower()
    found = [w for w in (*FILLER_WORDS, *extra_words) if re.search(rf"(?<![a-z-]){re.escape(w)}(?![a-z-])", lowered)]
    if found:
        problems.append(f"{what} uses filler words ({', '.join(found)}). Say what actually changed")
    if DEAD_OPENING.search(text):
        problems.append(f"{what} opens with a dead phrase (This commit, This change, Overall, Additionally)")
    return problems


def check_subject(subject: str, what: str, rules: CommitRules) -> list[str]:
    """Problems with a Conventional Commits subject line or PR title."""
    subject = subject.strip()
    types = "|".join(map(re.escape, rules.types))
    match = re.match(rf"^(?:{types})(?:\([a-z0-9_./-]+\))?!?: (?P<text>.+)$", subject)
    if not match:
        return [f"{what} must be `type(scope): subject`, type one of {', '.join(rules.types)}. Got {subject!r}"]
    problems = []
    if len(subject) > rules.max_subject_length:
        problems.append(f"{what} is {len(subject)} characters. Keep it to {rules.max_subject_length}")
    text = match.group("text")
    if text[:1].isupper():
        problems.append(f"{what} should be lowercase after the colon")
    if text.rstrip().endswith("."):
        problems.append(f"{what} shouldn't end with a full stop")
    return problems


def _tokens(command: str) -> list[str]:
    try:
        return shlex.split(command)
    except ValueError:
        return []


def _values(tokens: list[str], flags: tuple[str, ...]) -> list[str]:
    values = []
    for index, token in enumerate(tokens):
        if token in flags and index + 1 < len(tokens):
            values.append(tokens[index + 1])
        values.extend(token[len(f) + 1 :] for f in flags if f.startswith("--") and token.startswith(f + "="))
    return values


def _read(cwd: Path, name: str) -> str | None:
    try:
        return (cwd / name).read_text(encoding="utf-8")
    except OSError:
        return None


def commit_message(command: str, cwd: Path) -> str | None:
    """The message a ``git commit`` command would use, or None if it can't be known."""
    heredoc = HEREDOC.search(command)
    if heredoc:
        message: str | None = heredoc.group(2)
    else:
        tokens = _tokens(command)
        parts = _values(tokens, ("-m", "--message"))
        files = _values(tokens, ("-F", "--file"))
        message = "\n\n".join(parts) if parts else _read(cwd, files[0]) if files else None
    if not message or "$(" in message:  # command substitution: the real text isn't visible here
        return None
    return message


def check_command(command: str, cwd: Path, commit: CommitRules, pr: PullRequestRules) -> list[str]:
    """Every rule a shell command breaks. An empty list means it may run."""
    if "git" not in command and "gh " not in command:
        return []
    if STAGE_ALL.search(command):
        return [
            "Stage files by path (`git add -- <paths>` or `git add -p <file>`), not everything. "
            "One commit is one logical change."
        ]
    if COMMIT_ALL.search(command) and "--amend" not in command:
        return ["`git commit -a` commits every changed file. Stage this change's files by path, then commit."]

    problems: list[str] = []
    if re.search(r"\bgit\s+commit\b", command) and "--no-edit" not in command:
        message = commit_message(command, cwd)
        if message:
            problems += check_subject(message.strip().splitlines()[0], "commit subject", commit)
            problems += check_text(message, "commit message", commit.extra_banned_words)

    if re.search(r"\bgh\s+pr\s+create\b", command):
        tokens = _tokens(command)
        bodies = _values(tokens, ("--body", "-b"))
        bodies += [text for name in _values(tokens, ("--body-file", "-F")) if (text := _read(cwd, name))]
        problems += check_pull_request(
            _values(tokens, ("--title", "-t")), "\n".join(bodies), _values(tokens, ("--base", "-B")), commit, pr
        )
    return problems


def check_pull_request(
    titles: list[str], body: str, bases: list[str], commit: CommitRules, pr: PullRequestRules
) -> list[str]:
    """Problems with a pull request's title, body and base branch."""
    problems = [f"PR base must be {pr.base!r}, not {base!r}" for base in bases if base != pr.base]
    for title in titles:
        problems += check_subject(title, "PR title", commit)
        problems += check_text(title, "PR title", commit.extra_banned_words)
    if body.strip():
        problems += check_text(body, "PR body", commit.extra_banned_words)
        words = len(body.split())
        if words > pr.max_words:
            problems.append(f"PR body is {words} words. Keep it under {pr.max_words}, or split the PR")
        if UNPROVEN_CLAIM.search(body):
            problems.append('PR body says "all tests pass". Name the command, test or screen you checked')
    return problems
