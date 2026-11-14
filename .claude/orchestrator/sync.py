"""Install the kit into a project and keep it up to date.

``orch init`` and ``orch sync`` run from the kit repository. They copy the kit's files
into the project's ``.claude/`` folder, refresh the generic block at the top of
``CLAUDE.md``, and make sure ``.claude/settings.json`` has the kit's hooks.

A manifest records the hash of every file the kit wrote, so ``sync`` refuses to overwrite
a file someone edited by hand, and ``orch doctor`` can spot such edits from inside the project.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from orchestrator import __version__
from orchestrator.gitutil import head_commit

KIT_ROOT = Path(__file__).resolve().parents[2]
PACKAGE_DIR = Path(__file__).resolve().parent
MANAGED_PACKAGE = Path(".claude") / "orchestrator"
MANIFEST = MANAGED_PACKAGE / "manifest.json"
CLAUDE_MD = Path("CLAUDE.md")
SETTINGS = Path(".claude") / "settings.json"
BEGIN = "<!-- orchestrator:begin — managed by `orch sync`, edit the kit instead -->"
END = "<!-- orchestrator:end -->"
LAUNCHER = 'python3 "$CLAUDE_PROJECT_DIR/.claude/orch.py"'

# (event, matcher, hook name, timeout in seconds)
REQUIRED_HOOKS = (
    ("PreToolUse", "Bash", "guard-bash", 45),
    ("PreToolUse", "Agent|Task", "guard-agent", 15),
    ("PostToolUse", "Write|Edit", "format", 30),
    ("Stop", None, "require-commit", 20),
)
REQUIRED_ENV = {"CLAUDE_CODE_FORK_SUBAGENT": "0", "CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "1"}
REQUIRED_DENY = ("Agent(fork)",)
REQUIRED_ASK = ("Bash(python3 .claude/orch.py accept-review*)",)
TEMPLATES = {
    Path(".claude") / "orchestrator.json": "orchestrator.json",
    SETTINGS: "settings.json",
    Path("STATE.md"): "STATE.md",
    Path("plan") / "README.md": "plan/README.md",
}


class SyncError(Exception):
    """The kit can't be installed or updated as asked."""


def kit_available() -> bool:
    """True when this code runs from the kit repository, not from a vendored copy."""
    return (KIT_ROOT / "kit" / "claude").is_dir() and (KIT_ROOT / "src" / "orchestrator").is_dir()


def _require_kit() -> None:
    if not kit_available():
        raise SyncError("run init and sync from the kit repository: python3 <kit>/orch.py sync <project>")


def sha256(data: bytes) -> str:
    """Hex digest of ``data``."""
    return hashlib.sha256(data).hexdigest()


def desired_files() -> dict[str, bytes]:
    """Every file the kit manages, by project-relative POSIX path."""
    _require_kit()
    files: dict[str, bytes] = {}
    claude_src = KIT_ROOT / "kit" / "claude"
    for path in sorted(claude_src.rglob("*")):
        if path.is_file() and "__pycache__" not in path.parts:
            files[(Path(".claude") / path.relative_to(claude_src)).as_posix()] = path.read_bytes()
    for path in sorted(PACKAGE_DIR.glob("*.py")):
        files[(MANAGED_PACKAGE / path.name).as_posix()] = path.read_bytes()
    return files


def read_manifest(project: Path) -> dict[str, Any]:
    """The manifest the last sync wrote, or an empty one."""
    try:
        data = json.loads((project / MANIFEST).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {"files": {}}
    return data if isinstance(data.get("files"), dict) else {"files": {}}


# ---------------------------------------------------------------- CLAUDE.md block


def kit_block() -> str:
    """The generic CLAUDE.md section, wrapped in its markers."""
    _require_kit()
    text = (KIT_ROOT / "kit" / "CLAUDE.kit.md").read_text(encoding="utf-8").strip()
    return f"{BEGIN}\n{text}\n{END}"


def with_block(current: str | None, block: str) -> str:
    """``current`` CLAUDE.md with the kit block replaced, or put at the top if it isn't there."""
    if not current:
        return f"{block}\n\n# Project\n\n<!-- What this project is, its docs, commands and code rules. -->\n"
    start, end = current.find(BEGIN), current.find(END)
    if start != -1 and end > start:
        return current[:start] + block + current[end + len(END) :]
    if start != -1 or end != -1:
        raise SyncError("CLAUDE.md has only one of the orchestrator markers. Fix it by hand")
    return f"{block}\n\n{current}"


# ---------------------------------------------------------------- settings.json


def _hook_command(name: str) -> str:
    return f"{LAUNCHER} hook {name}"


def merged_settings(settings: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """``settings`` with the kit's hooks, env and deny rules added. Returns it and what changed."""
    added: list[str] = []
    hooks = settings.setdefault("hooks", {})
    for event, matcher, name, timeout in REQUIRED_HOOKS:
        command = _hook_command(name)
        groups = hooks.setdefault(event, [])
        present = any(h.get("command") == command for g in groups for h in g.get("hooks", []))
        if not present:
            group: dict[str, Any] = {"hooks": [{"type": "command", "command": command, "timeout": timeout}]}
            if matcher:
                group = {"matcher": matcher, **group}
            groups.append(group)
            added.append(f"{event} hook `{name}`")
    env = settings.setdefault("env", {})
    for key, value in REQUIRED_ENV.items():
        if env.get(key) != value:
            env[key] = value
            added.append(f"env {key}={value}")
    permissions = settings.setdefault("permissions", {})
    for kind, rules in (("deny", REQUIRED_DENY), ("ask", REQUIRED_ASK)):
        current = permissions.setdefault(kind, [])
        for rule in rules:
            if rule not in current:
                current.append(rule)
                added.append(f"{kind} {rule}")
    return settings, added


# ---------------------------------------------------------------- sync


@dataclass
class Plan:
    """What a sync will do. Nothing is written until :func:`apply`."""

    write: dict[str, bytes] = field(default_factory=dict)
    delete: list[str] = field(default_factory=list)
    conflicts: list[str] = field(default_factory=list)
    claude_md: str | None = None
    settings: dict[str, Any] | None = None
    settings_changes: list[str] = field(default_factory=list)
    created: list[str] = field(default_factory=list)

    @property
    def changes(self) -> list[str]:
        """One line per change, for printing."""
        lines = [f"write  {p}" for p in sorted(self.write)]
        lines += [f"delete {p}" for p in self.delete]
        lines += [f"create {p}" for p in self.created]
        if self.claude_md is not None:
            lines.append(f"update {CLAUDE_MD} (kit block)")
        lines += [f"settings: add {c}" for c in self.settings_changes]
        return lines


def plan_sync(project: Path, *, force: bool = False, create_templates: bool = False) -> Plan:
    """Work out what ``sync`` (or ``init`` with ``create_templates``) would change."""
    if not project.is_dir():
        raise SyncError(f"{project} is not a folder")
    plan = Plan()
    old = read_manifest(project)["files"]
    desired = desired_files()

    for rel, data in desired.items():
        target = project / rel
        if not target.exists():
            plan.write[rel] = data
            continue
        current = target.read_bytes()
        if current == data:
            continue
        edited = rel not in old or sha256(current) != old[rel]
        if edited and not force:
            plan.conflicts.append(f"{rel} was changed by hand")
        else:
            plan.write[rel] = data

    for old_rel, digest in old.items():
        target = project / old_rel
        if old_rel in desired or not target.exists():
            continue
        if sha256(target.read_bytes()) != digest and not force:
            plan.conflicts.append(f"{old_rel} is no longer in the kit but was changed by hand")
        else:
            plan.delete.append(old_rel)

    if create_templates:
        for template_path, name in TEMPLATES.items():
            if not (project / template_path).exists():
                plan.write[template_path.as_posix()] = (KIT_ROOT / "kit" / "templates" / name).read_bytes()
                plan.created.append(template_path.as_posix())

    claude_md = project / CLAUDE_MD
    current_md = claude_md.read_text(encoding="utf-8") if claude_md.exists() else None
    updated_md = with_block(current_md, kit_block())
    if updated_md != current_md:
        plan.claude_md = updated_md

    settings_path = project / SETTINGS
    if settings_path.exists():
        try:
            settings = json.loads(settings_path.read_text(encoding="utf-8"))
        except ValueError as exc:
            raise SyncError(f"{SETTINGS} is not valid JSON: {exc}") from exc
        merged, changes = merged_settings(settings)
        if changes:
            plan.settings, plan.settings_changes = merged, changes
    return plan


def apply(project: Path, plan: Plan) -> None:
    """Write the planned changes and a fresh manifest."""
    if plan.conflicts:
        listed = "\n  ".join(plan.conflicts)
        raise SyncError(f"refusing to overwrite:\n  {listed}\nre-run with --force to replace them")
    for rel, data in plan.write.items():
        target = project / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    for rel in plan.delete:
        (project / rel).unlink()
    if plan.claude_md is not None:
        (project / CLAUDE_MD).write_text(plan.claude_md, encoding="utf-8")
    if plan.settings is not None:
        (project / SETTINGS).write_text(json.dumps(plan.settings, indent=2) + "\n", encoding="utf-8")
    manifest = {
        "version": __version__,
        "kit_commit": head_commit(KIT_ROOT),
        "files": {rel: sha256(data) for rel, data in desired_files().items()},
    }
    (project / MANIFEST).parent.mkdir(parents=True, exist_ok=True)
    (project / MANIFEST).write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- doctor


def doctor(project: Path) -> list[str]:
    """Problems with the kit inside a project. Works without the kit repository."""
    problems: list[str] = []
    manifest = read_manifest(project)
    if not manifest["files"]:
        return [f"no {MANIFEST}: run `orch sync` from the kit"]
    for rel, digest in sorted(manifest["files"].items()):
        target = project / rel
        if not target.exists():
            problems.append(f"missing kit file {rel}")
        elif sha256(target.read_bytes()) != digest:
            problems.append(f"{rel} was changed by hand: change the kit and sync instead")
    claude_md = project / CLAUDE_MD
    if not claude_md.exists() or BEGIN not in claude_md.read_text(encoding="utf-8"):
        problems.append(f"{CLAUDE_MD} has no kit block")
    settings_path = project / SETTINGS
    try:
        settings = json.loads(settings_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        problems.append(f"{SETTINGS} is missing or not valid JSON")
    else:
        _, missing = merged_settings(settings)
        problems.extend(f"{SETTINGS} lacks {m}" for m in missing)
    return problems
