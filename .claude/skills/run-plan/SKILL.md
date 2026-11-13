---
name: run-plan
description: Run the task plan in plan/ as the lead. One task is one branch and one pull request into the PR base (dev). Pick the next wave, build lead tasks yourself, send worker tasks to subagents, review, open the PRs, run the review loop and merge. Use when asked to build, continue or run the plan.
---

# Run the plan (lead session only)

You are the lead. Workers code, reviewers judge, you decide and merge. Spend tokens on judgement, not on reading what a script or a reviewer already checked.

**The flow for every task:** its own branch → checks pass → pre-PR reviews → PR into `dev` → `pr-reviewer` ⇄ `pr-fixer` → merge → `done`. Nothing reaches `main`: a person merges `dev` into `main`.

**Where things are**
- `plan/<ID>.md`: one file per task. Change a status only with `python3 .claude/orch.py status <ID> <status>`: `todo` → `doing` → `review` (PR open) → `done` (merged), or `blocked`.
- `.claude/orchestrator.json`: `pull_request.base` (dev), `protected` (main), `merge_method`, `max_review_rounds`, `max_parallel`, `full_verify`, `core_paths`.
- `.claude/state/`: results, review records and PR records the hooks write. Not committed.
- `STATE.md`: read it first, every session.

**Native Tasks are the progress view, not the plan.** `TaskCreate` one item per task in the wave, mark it completed when merged. If they disagree, the plan files win.

**Where each status lives.** `doing` and `review` change all day, so they're kept in `.claude/state/status.json`, shared by every worktree and never committed. `todo`, `done` and `blocked` are written in the task file. Set `done` on the task's own branch, in its PR (`chore(plan): close P1-04`), so the task turns `done` on `dev` at the moment the PR merges, and never before.

## 1. Start clean

```bash
git switch dev && git pull --ff-only
python3 .claude/orch.py next
```

`next` lists `running`, `in review`, `lead`, `workers` (no two share a file, at most `max_parallel`), `waiting` and `human`. A task is ready only when everything it `needs` is merged.

## 2. Build

- Set every task you start to `doing` (`orch status <ID> doing`).
- **Workers:** Agent tool, `subagent_type` = the task's agent, prompt `TASK <ID>` plus one or two lines only if you know something the task doesn't. Never pass `model`. Never paste docs or code. Workers run in their own worktree, make their own branch, and don't push.
- **Your own (`lead`) tasks, one at a time:** in a worktree, so `dev` stays checked out here:
  ```bash
  git worktree add .claude/worktrees/<ID> -b feat/<ID>-<slug> dev
  ```
  Work and commit there, then follow the same steps below.
- **`human` tasks:** list them for the user at the end.

## 3. Check a finished task

1. The worker's REPORT, then `.claude/state/results/<ID>.json` (`status`, `failing`, `warnings`, `skipped`).
2. The diff, **only** if: the status isn't `pass`, there are warnings, steps were skipped, or it touches a `core_paths` entry.
3. **Pre-PR reviews.** Find the task's worktree and branch with `git worktree list`. From that folder, `python3 .claude/orch.py reviews` lists what's owed. Send `architecture-auditor` (always) with the branch name and task id, and `design-reviewer` (UI changed) with the branch name, the component and its Figma ids. They name the branch in their REVIEW block, and a hook records the verdict against it. Their `CHANGES` findings: resume the same worker with the list (once), or fix them yourself as commits. Disagree with one: log why in STATE.md and `orch accept-review <agent> --reason "…"` (it asks the user).
4. A bug fix in the task: send `test-planner` with the commit and the worktree folder, before opening the PR. Its tests land on the same branch.

## 4. Open the pull request

From the task's worktree, following `opening-a-pull-request`: commit `orch status <ID> done` on the branch, `git push -u origin HEAD`, `gh pr create --base dev …`, then `orch status <ID> review`. The commit guard checks the base, the text and the pre-PR reviews. Then remove the worker's worktree so `pr-fixer` can check the branch out: `git worktree remove <path>`.

## 5. Review loop and merge

Follow `merging-a-pull-request`: `pr-reviewer` → (`CHANGES`) `pr-fixer` → `pr-reviewer` again, at most `max_review_rounds`, then `gh pr merge <N> --squash --delete-branch`. The merge gate checks GitHub itself: the base is `dev`, no conflicts, checks green, approved on the current head.

Run several PRs' loops side by side when they don't touch the same files.

## 6. Close the wave

1. `git switch dev && git pull --ff-only`, then run `full_verify` on `dev`. Anything a combination of PRs broke gets its own `fix/` branch and PR.
2. Remove finished worktrees (`git worktree list`, `git worktree prune`).
3. Delete `.claude/state/attempts/` so retry counts restart.
4. End of a phase: `architecture-auditor` on `dev` as a whole. Findings become tasks.
5. Back to step 1.

## 7. Stop and report when

- every task in the current phase is `done`, or
- a decision belongs to the user: an open item in STATE.md, a design change, a package the docs don't list, a PR still not approved after `max_review_rounds`.

The report is short: what merged (PR numbers), what's blocked and why, the `human` tasks, and whether `dev` is ready for the user to open `dev → main`.

## Running unattended

```
/goal `python3 .claude/orch.py next` shows no lead, worker, running or in-review tasks for phase P2, and full_verify passed on dev last, or stop after 60 turns
```
