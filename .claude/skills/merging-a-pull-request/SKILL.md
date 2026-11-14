---
name: merging-a-pull-request
description: "The lead's loop for an open pull request into the PR base (dev): send pr-reviewer, send pr-fixer for its comments or for conflicts, review again, and merge when the gate allows. Use for every open PR an agent made. Never for a PR into main."
---

# Merging a pull request (lead only)

A PR merges into `dev` only when a fresh reviewer approved its current head commit, GitHub reports no conflicts and no failing checks, and it targets `dev`. The commit guard checks all of that with GitHub when you run `gh pr merge`. **`main` is never yours:** a person opens and merges `dev → main`.

## The loop

```
pr-reviewer N ──APPROVE──────────────────────────────► merge
     │
  CHANGES ─► pr-fixer N ─► pr-reviewer N (second pass) ─► …   at most max_review_rounds rounds of CHANGES
```

1. **Review.** Agent tool, `subagent_type: pr-reviewer`, prompt `PR <N>`. It comments on GitHub and ends with a PR block. Its hook records the verdict and the head it saw.
2. **`APPROVE`:** go to Merge.
3. **`CHANGES`:** Agent tool, `subagent_type: pr-fixer`, prompt `PR <N>`. It fixes or answers each comment, commits, pushes and replies. Then back to step 1: the reviewer checks only the fixes and the new commits.
4. **Rounds used up** (`python3 .claude/orch.py pr <N>` says so, and a hook refuses another `pr-fixer`): read the open threads yourself. Fix it in a worktree on the PR branch, or decide the comment is wrong and say so on the thread, then send the reviewer once more. Still stuck: stop and ask the user.

Disagreements between reviewer and fixer are settled by the docs and Figma, not by who argues longer. If the docs don't settle it, you decide, and log it in STATE.md.

## Merge

```bash
python3 .claude/orch.py pr <N>               # ready to merge?
gh pr merge <N> --squash --delete-branch      # the method is pull_request.merge_method
```

If the gate says:

| Says | Do |
|---|---|
| has conflicts | `pr-fixer` with `PR <N>, update with dev`. Then `pr-reviewer` again: the head changed |
| changed after approval | `pr-reviewer` again (second pass, only the new commits) |
| pre-PR review needed again | a fix touched files the auditor or design reviewer check: send it again with the PR's branch, then `pr-reviewer` if anything changed |
| checks running | wait, then try again |
| failing checks | read the failing run (`gh pr checks <N>`, `gh run view --log-failed`), then `pr-fixer` with the failure |
| couldn't read the PR | `gh auth status`; fix the connection, never work around the gate |

GitHub doesn't need the branch to be up to date with `dev` to squash it, so only real conflicts send a PR back.

## After the merge

1. `git switch dev && git pull --ff-only`. The task file now says `done`: it was set on the branch.
2. Clear its run state: `python3 .claude/orch.py status <ID> done` (nothing to commit; it only drops `review`).
3. Tasks that needed this one are now ready: `python3 .claude/orch.py next`.

## Never

- Merge a PR into `main`, push to `dev` or `main`, or use `--admin`.
- Merge through the API instead of `gh pr merge`.
- Approve on GitHub on the reviewer's behalf, or resolve the reviewer's threads yourself to get past it.
