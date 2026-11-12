---
name: run-plan
description: Run the task plan in plan/ as the lead. Pick the next wave, do lead tasks yourself, send worker tasks to subagents, check each result, set statuses and commit. Use when asked to build, continue or run the plan.
---

# Run the plan (lead session only)

You are the lead. Workers code. You build the `lead` tasks and judge everything. Spend tokens on judgement, not on reading what a script can check.

**Where things are**
- `plan/<ID>.md`: one file per task. Its `status:` line is the truth. Change it with `python3 .claude/orch.py status <ID> <todo|doing|done|blocked>`, never by hand.
- `.claude/orchestrator.json`: `max_parallel`, `max_retries`, `full_verify`, `core_paths`.
- `.claude/state/results/<ID>.json`: what the worker stop hook found. Not committed.
- `STATE.md`: read it first, every session.

**Native Tasks are the progress view, not the plan.** When a wave starts, `TaskCreate` one item per task in it (subject `<ID> · <title>`), and mark each completed when you close it. If the two ever disagree, the plan files win.

## 1. Pick the wave

1. `python3 .claude/orch.py next`. It lists `running`, `lead`, `workers` (already checked: no two share a file, at most `max_parallel`), `waiting` and `human`.
2. Set every task you start to `doing`, in one commit: `chore(plan): start P1-04, P1-05`.
3. **Lead tasks first, one at a time.** Workers copy what you set up. While a lead task is in progress, you may already send the `workers` list.
4. `human` tasks: skip them and list them for the user at the end.

## 2. Send a worker

Agent tool, `subagent_type` = the task's agent. The whole prompt:

```
TASK <ID>
<one or two lines, only if you know something the task file doesn't>
```

- **Never pass `model`.** The agent file sets it; passing one replaces the cheap model.
- **Don't paste docs, specs or code into the prompt.** The worker reads its own task. Every word you send is paid twice.
- Never send a worker a `lead` task.

## 3. Check a finished worker

Read in this order and stop once you can decide:

1. Its REPORT (the final message).
2. `.claude/state/results/<ID>.json`: `status`, `failing`, `warnings`, `skipped`.
3. Visible work: send `design-reviewer` with the task's component and Figma ids, for all the wave's visible tasks in one call. Its findings are your visual check; you don't compare screenshots yourself.
4. The diff (`git diff <base>..HEAD -- <owned files>`), **only** if: the status isn't `pass`, there are warnings, steps were skipped, the screenshot looks off, or it touches a `core_paths` entry.

| Outcome | Action |
|---|---|
| Good | `status <ID> done`, and log any decision from NOTES in STATE.md. One commit: `chore(plan): close P1-04` |
| Small fix | Fix it as its own commit, re-run `orch verify <ID>`, then close it |
| A bug was fixed (by anyone) | Send `test-planner` with the fix commit, so the bug can't come back |
| Wrong, and the worker can fix it | Resume the same worker (`SendMessage` to its id) with the file, what's wrong and what it should be. One resume at most, then fix it yourself |
| `blocked` | Answer and resume, rewrite the task, or do it yourself. A real gap in the plan: fix the task file |
| `failed` (retries used up) | Read the failing output. Fix it yourself or split the task |

## When to send the reviewers

| Reviewer | Send it |
|---|---|
| `design-reviewer` | After a wave with visible tasks (see above), and before a PR that touches UI |
| `test-planner` | After any bug fix, and before a `lead` task with more than one moving part (it lists the tests first, so you build against them) |
| `architecture-auditor` | At the end of each phase, and before a PR |

A reviewer's prompt is the scope only: `main..HEAD`, a task id, or a component plus its Figma ids. Its `CHANGES` findings become fixes (yours or a worker's, each its own commit) or new tasks. If you disagree with a finding, log why in STATE.md and run `orch accept-review <agent> --reason "…"` (it asks the user).

## 4. Close the wave

1. Run `full_verify` from the config. Fix anything a parallel task broke, each fix its own commit.
2. `git status` must be clean.
3. Delete `.claude/state/attempts/` so retry counts restart.
4. Back to step 1.

## 5. Stop and report when

- every task in the current phase is `done` and `architecture-auditor` passed on it, or
- a decision belongs to the user: an open item in STATE.md or the docs, a design change, a package the docs don't list.

The report is short: what's done, what's blocked and why, and the `human` tasks waiting.

## Running unattended

`/goal` with a condition the evaluator can check:

```
/goal `python3 .claude/orch.py next` shows no lead or worker tasks for phase P2, and full_verify ran last and exited 0, or stop after 40 turns
```
