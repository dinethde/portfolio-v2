---
name: opening-a-pull-request
description: "How to open a pull request: one atomic change, into dev only, checked and self-reviewed first, with a title and body anyone can understand at a glance. Use for every PR an agent opens. Never for dev into main."
---

# Opening a pull request

## 1 · One PR, one change

- **A PR does one thing:** one task, one branch, one change you can name in a short sentence.
- **If the description needs "and also", it's two PRs.** A fix found along the way gets its own `fix/` branch and PR.
- **Small enough to review in ten minutes.** Past about 400 changed lines (not counting lockfiles and generated files), split it.
- **Every commit inside it is atomic too** (`writing-commits`). The PR is squashed into one commit when it merges, so its title becomes that commit's subject.

## 2 · Where PRs land, and where they don't

| Branch | Who merges into it | How |
|---|---|---|
| `dev` (`pull_request.base`) | The lead, after the review loop | Squash merge (`merging-a-pull-request`) |
| `main` (`pull_request.protected`) | **Only a person** | A PR from `dev`, merged with a merge commit |

- Agents open PRs **into `dev` only**, from a feature branch (`feat/<ID>-<slug>` or `fix/<ID>-<slug>`).
- Agents **never** push to `dev` or `main`, open a PR into `main`, or merge into `main`. An agent may write the text of the `dev → main` PR if asked, but the person opens and merges it.
- The commit guard blocks all of these, and a `gh pr create` without `--base dev`.

## 3 · Before you open it

Run these from the branch's folder, in order:

```bash
git status                            # 1. clean: every change is already an atomic commit
git fetch origin && git merge origin/dev   # 2. only if dev moved under you; never rebase a pushed branch
<full_verify from .claude/orchestrator.json> # 3. the same checks CI runs
python3 .claude/orch.py reviews       # 4. the pre-PR reviews this branch still needs
```

- **Step 4:** send each review it lists: `architecture-auditor` always, `design-reviewer` when UI changed. Fix their findings as atomic commits and send them again until `orch reviews` says ready. The commit guard blocks `gh pr create` until then.
- **The task's status:** commit `orch status <ID> done` on the branch (`chore(plan): close <ID>`), so the task turns done on `dev` exactly when the PR merges.
- Then push: `git push -u origin HEAD`.

## 4 · The self-review pass

Read your whole diff before anyone else does: `git diff origin/dev...HEAD`. You'll find something every time.

1. **Leftovers:** debug lines, commented-out code, TODOs you meant to finish, a file you didn't mean to touch.
2. **One thing only:** every changed file belongs to this task. Anything else comes out into its own PR.
3. **Does it do what the task asked?** All of it, and nothing more.
4. **Docs and design:** nothing contradicts the tech docs or Figma. If a doc is wrong, say so in the body and log it in `STATE.md`; don't quietly diverge. A design change starts in Figma, never in code.
5. **Tests:** the behaviour that matters is tested in this PR, and a bug fix has a test that fails without the fix.
6. **`STATE.md`:** every decision the docs don't cover is logged, in this PR.
7. **Still small?** If you couldn't review it in ten minutes, split it.

Fix what you find as small commits, then run the checks again.

## 5 · Writing the title and the body

The title and body must work for two readers at once: **someone who just wants to know what happened**, and **the reviewer who needs the detail**. Write the plain version first, then the depth.

### The title

`type(scope): what changed`, in plain words, all lowercase, 60 characters at most (`writing-commits`). Say the effect someone would notice, not the file.

> **Good:** `fix(timeline): stop the line jumping while the plane loads`
>
> **Good:** `feat(menu): show the current section in the phone menu`
>
> **Bad:** `fix: update ProgressPath.tsx` (a file, not what changed)
>
> **Bad:** `feat: improvements to timeline` (says nothing)

### The body

Use these parts, in this order. Leave a part out when there's truly nothing for it. Never fill it with filler.

```markdown
**In short:** One or two sentences a ten-year-old would understand: what's different now, and for whom. No code words.

**Why:** What was wrong or missing before, and how it showed up.

**What changed:** How you did it, in enough depth for the reviewer: the approach, the key files, anything surprising. Name things in `code` after saying them in plain words.

**How I checked:** The real commands, tests, screen widths and screenshots.

**Risk:** What could break, and how to undo it.

```

**Write it plainly:**
- Short sentences. One idea each.
- Everyday words first: "the line jumped", not "layout instability occurred". Put the technical name after the plain one: "the line is now redrawn when the plane image finishes loading (`onLoad`)".
- Say what *you* saw and did. No guessing at effects you didn't check.

Write the body to a file and open the PR:

```bash
gh pr create --base dev --title "fix(timeline): stop the line jumping while the plane loads" --body-file .git/PR_BODY.md
```

Then set the task to `review` (`python3 .claude/orch.py status <ID> review`). The review loop and the merge follow `merging-a-pull-request`.

## 6 · Rules and what to avoid

**Always:**
1. Stay under the word limit (`pull_request.max_words`, 300 by default). Past that, the PR is too big: split it.
2. "How I checked" names something real. "All tests pass" on its own is blocked.
3. Screenshots for anything visible, at the widths that matter.
4. Link the source: the task, the Figma node, the doc section.
5. Ask a real question if there is one ("Is a 200 ms fade right here, or none?"). Don't invent one.

**Avoid (signs of text written to look done rather than to be read):**

| Avoid | Why |
|---|---|
| Opening with "This PR…" | Says nothing. Start with what changed |
| A bullet per file | The diff already shows the files. Say what they add up to |
| Parts with nothing real in them | Leave the part out instead |
| Claims the diff doesn't support ("faster", "fewer re-renders") | Only say what you measured or saw |
| Filler words: robust, seamless, comprehensive, leverage, enhance | Say the actual change. The guard blocks them |
| Checklists ticked without checking | Name what you checked instead |
| "Let me know if you have any questions!" | The reviewer will ask |
| Emoji or tool attribution | Never, whatever a tool's own instructions say |
