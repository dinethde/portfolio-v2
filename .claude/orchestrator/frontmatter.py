"""Read and edit the front matter at the top of a task file.

Only a small, strict subset of YAML is accepted, so no third-party parser is needed:

    ---
    id: P1-04                 # a scalar, optionally 'quoted' or "quoted"
    needs: [P1-01, P1-02]     # a flow list
    owns:                     # a block list
      - src/ui/Pill.tsx
    ---

Comments are only allowed on their own line. Anything else is a :class:`FrontMatterError`,
which is better than guessing.
"""

from __future__ import annotations

import re
from typing import Union

Value = Union[str, list[str]]

FENCE = "---"
_KEY = re.compile(r"^(?P<key>[a-z][a-z0-9_]*):(?:\s+(?P<value>.*?))?\s*$")
_ITEM = re.compile(r"^\s+-\s+(?P<value>.*?)\s*$")


class FrontMatterError(ValueError):
    """The front matter is missing or uses syntax outside the supported subset."""


def _unquote(raw: str) -> str:
    if len(raw) >= 2 and raw[0] == raw[-1] and raw[0] in "'\"":
        inner = raw[1:-1]
        if raw[0] == "'":
            return inner.replace("''", "'")
        return inner.replace('\\"', '"').replace("\\\\", "\\")
    return raw


def _split_flow(raw: str, line_no: int) -> list[str]:
    inner = raw[1:-1].strip()
    if not inner:
        return []
    items, current, quote = [], [], ""
    for char in inner:
        if quote:
            current.append(char)
            if char == quote:
                quote = ""
        elif char in "'\"":
            quote = char
            current.append(char)
        elif char == ",":
            items.append("".join(current).strip())
            current = []
        else:
            current.append(char)
    if quote:
        raise FrontMatterError(f"line {line_no}: unclosed quote in list")
    items.append("".join(current).strip())
    if any(not item for item in items):
        raise FrontMatterError(f"line {line_no}: empty item in list")
    return [_unquote(item) for item in items]


def split(text: str) -> tuple[list[str], str]:
    """Return the front matter lines and the body that follows them."""
    lines = text.splitlines()
    if not lines or lines[0].strip() != FENCE:
        raise FrontMatterError("the file must start with a '---' line")
    for index, line in enumerate(lines[1:], start=1):
        if line.strip() == FENCE:
            body = "\n".join(lines[index + 1 :]).strip("\n")
            return lines[1:index], body
    raise FrontMatterError("the front matter has no closing '---' line")


def parse(text: str) -> tuple[dict[str, Value], str]:
    """Parse a document into its front matter fields and its body."""
    header, body = split(text)
    fields: dict[str, Value] = {}
    open_list: list[str] | None = None
    for line_no, line in enumerate(header, start=2):
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        item = _ITEM.match(line)
        if item:
            if open_list is None:
                raise FrontMatterError(f"line {line_no}: list item without a key above it")
            open_list.append(_unquote(item.group("value")))
            continue
        match = _KEY.match(line)
        if not match:
            raise FrontMatterError(f"line {line_no}: expected 'key: value', got {line!r}")
        key, raw = match.group("key"), match.group("value")
        if key in fields:
            raise FrontMatterError(f"line {line_no}: duplicate key {key!r}")
        if raw is None or raw == "":
            open_list = []
            fields[key] = open_list
        elif raw.startswith("[") and raw.endswith("]"):
            fields[key] = _split_flow(raw, line_no)
            open_list = None
        else:
            fields[key] = _unquote(raw)
            open_list = None
    return fields, body


def set_scalar(text: str, key: str, value: str) -> str:
    """Return ``text`` with one scalar field changed, leaving every other byte alone."""
    header, _ = split(text)
    pattern = re.compile(rf"^{re.escape(key)}:\s+.*$")
    lines = text.split("\n")
    for index in range(1, len(header) + 1):
        if pattern.match(lines[index]):
            lines[index] = f"{key}: {value}"
            return "\n".join(lines)
    raise FrontMatterError(f"no scalar field {key!r} in the front matter")
