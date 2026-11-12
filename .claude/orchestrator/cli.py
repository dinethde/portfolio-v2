"""The ``orch`` command.

Inside a project (``python3 .claude/orch.py <command>``):

    orch list                      every task: status, id, agent, title
    orch next                      the next wave: lead tasks, worker tasks to run in parallel, the rest
    orch show <ID>                 one task, as a worker reads it
    orch verify <ID> [--json]      run a task's checks
    orch status <ID> <STATUS>      set a task's status (todo, doing, done, blocked)
    orch check-plan                check the whole plan is consistent
    orch doctor                    check the kit files, CLAUDE.md block and settings
    orch check-pr --title T [--body-file F] [--base B]   the commit guard's PR rules, for CI
    orch hook <NAME>               run a Claude Code hook (used by settings and agents)

From the kit repository (``python3 <kit>/orch.py <command> <project>``):

    orch init <project>            install the kit and create the project templates that are missing
    orch sync <project> [--check]  update the kit files in a project

Exit codes: 0 success, 1 a check failed or something is out of date, 2 usage or setup error.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence
from pathlib import Path

from orchestrator import __version__, commit_rules, hooks, sync, tasks
from orchestrator.config import Config, ConfigError, find_project_root, load_config
from orchestrator.verify import format_result, verify

OK, FAILED, USAGE = 0, 1, 2


class CommandError(Exception):
    """A problem to report on stderr with exit code 2."""


def _project(args: argparse.Namespace) -> tuple[Path, Config]:
    root = find_project_root(Path(args.project or "."))
    if root is None:
        raise CommandError("no .claude/orchestrator.json here or in any parent folder")
    try:
        return root, load_config(root)
    except ConfigError as exc:
        raise CommandError(str(exc)) from exc


def _plan(args: argparse.Namespace) -> tuple[Path, Config, list[tasks.Task]]:
    root, config = _project(args)
    try:
        return root, config, tasks.load_plan(root, config)
    except tasks.PlanError as exc:
        raise CommandError(str(exc)) from exc


def _find(plan: list[tasks.Task], task_id: str) -> tasks.Task:
    try:
        return tasks.find(plan, task_id)
    except tasks.PlanError as exc:
        raise CommandError(str(exc)) from exc


def cmd_list(args: argparse.Namespace) -> int:
    _, _, plan = _plan(args)
    phase = None
    for task in plan:
        if phase is not None and task.phase != phase:
            print()
        phase = task.phase
        print(f"{task.status:<8} {task.id:<8} {task.agent:<9} {task.title}")
    return OK


def _line(task: tasks.Task) -> str:
    return f"  {task.id:<8} {task.agent:<9} {task.title}"


def cmd_next(args: argparse.Namespace) -> int:
    _, config, plan = _plan(args)
    wave = tasks.next_wave(plan, config.max_parallel)
    sections = (
        ("running", wave.running),
        ("lead (do these yourself, one at a time)", wave.lead),
        (f"workers (start together, max {config.max_parallel})", wave.workers),
        ("ready but waiting (overlapping files or no room)", wave.waiting),
        ("human (list them for the user)", wave.human),
    )
    shown = False
    for title, items in sections:
        if items:
            shown = True
            print(f"{title}:")
            print("\n".join(_line(t) for t in items))
    if not shown:
        left = [t for t in plan if t.status != "done"]
        print("every task is done" if not left else "nothing is ready: check the blocked tasks")
    return OK


def cmd_show(args: argparse.Namespace) -> int:
    _, _, plan = _plan(args)
    print(tasks.render(_find(plan, args.id)))
    return OK


def cmd_verify(args: argparse.Namespace) -> int:
    root, config, plan = _plan(args)
    result = verify(_find(plan, args.id), config, root)
    print(json.dumps(result.to_dict()) if args.json else format_result(result))
    return OK if result.ok else FAILED


def cmd_status(args: argparse.Namespace) -> int:
    _, _, plan = _plan(args)
    task = _find(plan, args.id)
    try:
        tasks.set_status(task, args.status)
    except tasks.PlanError as exc:
        raise CommandError(str(exc)) from exc
    print(f"{task.id}: {task.status} -> {args.status}")
    return OK


def cmd_check_plan(args: argparse.Namespace) -> int:
    _, _, plan = _plan(args)  # load_plan raises on any problem
    done = sum(t.status == "done" for t in plan)
    print(f"plan OK: {len(plan)} tasks, {done} done")
    return OK


def cmd_doctor(args: argparse.Namespace) -> int:
    root, _ = _project(args)
    problems = sync.doctor(root)
    try:
        tasks.load_plan(root, load_config(root))
    except (tasks.PlanError, ConfigError) as exc:
        problems.append(str(exc))
    for problem in problems:
        print(f"  - {problem}")
    print("doctor: OK" if not problems else f"doctor: {len(problems)} problem(s)")
    return OK if not problems else FAILED


def cmd_check_pr(args: argparse.Namespace) -> int:
    _, config = _project(args)
    try:
        body = Path(args.body_file).read_text(encoding="utf-8") if args.body_file else ""
    except OSError as exc:
        raise CommandError(f"can't read {args.body_file}: {exc}") from exc
    bases = [args.base] if args.base else []
    problems = commit_rules.check_pull_request([args.title], body, bases, config.commit, config.pull_request)
    for problem in problems:
        print(f"  - {problem}")
    print("pull request text: OK" if not problems else f"pull request text: {len(problems)} problem(s)")
    return OK if not problems else FAILED


def _sync(args: argparse.Namespace, *, init: bool) -> int:
    project = Path(args.project).resolve()
    try:
        plan = sync.plan_sync(project, force=args.force, create_templates=init)
        if args.check:
            for line in plan.changes + [f"conflict: {c}" for c in plan.conflicts]:
                print(line)
            up_to_date = not plan.changes and not plan.conflicts
            print("up to date" if up_to_date else "out of date")
            return OK if up_to_date else FAILED
        sync.apply(project, plan)
    except sync.SyncError as exc:
        raise CommandError(str(exc)) from exc
    for line in plan.changes or ["already up to date"]:
        print(line)
    if init and plan.created:
        print("\nnext: fill in the created files, then commit them (see the kit README)")
    return OK


def cmd_init(args: argparse.Namespace) -> int:
    return _sync(args, init=True)


def cmd_sync(args: argparse.Namespace) -> int:
    return _sync(args, init=False)


def cmd_hook(args: argparse.Namespace) -> int:
    return hooks.run(args.name)


def build_parser() -> argparse.ArgumentParser:
    """The argument parser for every subcommand."""
    parser = argparse.ArgumentParser(prog="orch", description="Run a task plan with a lead and worker agents.")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument("-C", dest="project", metavar="DIR", help="run as if started in DIR")
    sub = parser.add_subparsers(dest="command", required=True, metavar="command")

    sub.add_parser("list", help="list every task").set_defaults(func=cmd_list)
    sub.add_parser("next", help="show the next wave").set_defaults(func=cmd_next)
    p = sub.add_parser("show", help="print one task")
    p.add_argument("id")
    p.set_defaults(func=cmd_show)
    p = sub.add_parser("verify", help="run a task's checks")
    p.add_argument("id")
    p.add_argument("--json", action="store_true", help="machine-readable output")
    p.set_defaults(func=cmd_verify)
    p = sub.add_parser("status", help="set a task's status")
    p.add_argument("id")
    p.add_argument("status", choices=tasks.STATUSES)
    p.set_defaults(func=cmd_status)
    sub.add_parser("check-plan", help="check the plan is consistent").set_defaults(func=cmd_check_plan)
    sub.add_parser("doctor", help="check the kit is installed correctly").set_defaults(func=cmd_doctor)
    p = sub.add_parser("check-pr", help="check a pull request title and body against the commit rules")
    p.add_argument("--title", required=True)
    p.add_argument("--body-file", help="file holding the description")
    p.add_argument("--base", help="the base branch")
    p.set_defaults(func=cmd_check_pr)
    p = sub.add_parser("hook", help="run a Claude Code hook (reads JSON on stdin)")
    p.add_argument("name", choices=sorted(hooks.HANDLERS))
    p.set_defaults(func=cmd_hook)

    for name, func, text in (
        ("init", cmd_init, "install the kit into a project"),
        ("sync", cmd_sync, "update the kit files in a project"),
    ):
        p = sub.add_parser(name, help=text)
        p.add_argument("project", help="the project folder")
        p.add_argument("--check", action="store_true", help="only report what would change")
        p.add_argument("--force", action="store_true", help="overwrite kit files that were changed by hand")
        p.set_defaults(func=func)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run the command line and return the exit code."""
    args = build_parser().parse_args(argv)
    try:
        return int(args.func(args))
    except CommandError as exc:
        print(f"orch: {exc}", file=sys.stderr)
        return USAGE
    except BrokenPipeError:  # output piped into `head` and closed early
        sys.stderr.close()
        return OK
