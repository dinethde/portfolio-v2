"""Path patterns used in a task's ``owns`` list and in the config.

A pattern is a repo-relative POSIX path. ``*`` matches inside one path segment and
``**`` matches across segments, so ``src/icons/**`` owns everything under ``src/icons/``.
"""

from __future__ import annotations

import re
from functools import lru_cache


def is_glob(pattern: str) -> bool:
    """Return True if the pattern contains a wildcard."""
    return "*" in pattern


@lru_cache(maxsize=512)
def _compile(pattern: str) -> re.Pattern[str]:
    parts: list[str] = []
    i = 0
    while i < len(pattern):
        if pattern.startswith("**/", i):
            parts.append("(?:.*/)?")
            i += 3
        elif pattern.startswith("**", i):
            parts.append(".*")
            i += 2
        elif pattern[i] == "*":
            parts.append("[^/]*")
            i += 1
        else:
            parts.append(re.escape(pattern[i]))
            i += 1
    return re.compile("".join(parts) + r"\Z")


def matches(pattern: str, path: str) -> bool:
    """Return True if ``path`` is matched by ``pattern``."""
    if not is_glob(pattern):
        return path == pattern
    return _compile(pattern).match(path) is not None


def matches_any(patterns: list[str] | tuple[str, ...], path: str) -> bool:
    """Return True if any pattern matches ``path``."""
    return any(matches(p, path) for p in patterns)


def _literal_prefix(pattern: str) -> str:
    return pattern.split("*", 1)[0]


def overlaps(a: str, b: str) -> bool:
    """Return True if two patterns could name the same file.

    Exact for two literal paths and for a literal against a glob. For two globs it
    compares the literal prefixes, which can report an overlap that isn't real but
    never misses one. That is the safe direction when deciding what may run in parallel.
    """
    if not is_glob(a) and not is_glob(b):
        return a == b
    if not is_glob(a):
        return matches(b, a)
    if not is_glob(b):
        return matches(a, b)
    pa, pb = _literal_prefix(a), _literal_prefix(b)
    return pa.startswith(pb) or pb.startswith(pa)


def is_under(path: str, prefixes: list[str] | tuple[str, ...]) -> bool:
    """Return True if ``path`` equals or sits under one of the prefixes."""
    return any(path == p.rstrip("/") or path.startswith(p if p.endswith("/") else p + "/") for p in prefixes)
