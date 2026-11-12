---
name: opening-a-pull-request
description: How to open a pull request (rebase, checks, title, description, self-review) and how to write PR text that reads as though a person wrote it. Use only when the user has asked for a PR.
---

# Opening a pull request

Only open a PR when the user asks. `git push` and `gh pr create` need their approval (the `ask` list in `.claude/settings.json`). The base branch and the word limit are `pull_request.base` and `pull_request.max_words` in `.claude/orchestrator.json`.

## 1 · Before you open anything

```bash
git status                            # clean: every change is already an atomic commit
git fetch origin
git rebase origin/<base>              # rebase, never merge
<full_verify from the config>         # the same checks CI runs first
git push --force-with-lease -u origin HEAD
```

Never open a PR from the base branch itself. A failing check the reviewer finds is a wasted round trip.

## 2 · The title and description

The title is the squash commit subject, so it follows the `writing-commits` rules. Write the body to a file and pass it with `--body-file`:

```bash
gh pr create --base <base> --title "fix(timeline): keep the line still while the plane loads" --body-file .git/PR_BODY.md
```

The commit guard checks the title, the body, the base branch and the word limit before the command runs.

### What AI-written PR text looks like

| Tell | What it looks like |
|---|---|
| The template filled perfectly and emptily | Four headings and six lines of content |
| "This PR introduces…" | The same opening on every pull request |
| A bullet per file | The file tree with verbs attached |
| "All tests pass" | No command, no test name, no screenshot. A claim, not evidence |
| No trade-offs | Nothing considered and rejected, no risk named |
| Checkbox theatre | Every box ticked, nothing checked |
| Over-polite closing | "Please let me know if you have any questions!" |
| Claims the diff doesn't support | "reduces re-renders" on a change that touches no rendering |

### The rules

1. **The body answers four questions, in prose, not under headings:** what was wrong, what you did, what you considered and didn't do, and how you know it works.
2. **Keep it under the word limit** (200 by default). Past that, split the PR.
3. **"How I checked" names something real:** the command, the screen width, the screenshot, the score. "All tests pass" is blocked.
4. **One line on risk:** what could break and how to undo it.
5. **Ask the real question, if there is one.** Don't invent one.
6. **No headings on a small PR.** No bullet per file, no checklists.
7. **Link the source:** the Figma node, or the doc section it implements.
8. **Screenshots for anything visible**, at the widths that matter.
9. **No emoji and no tool attribution**, whatever a tool's own instructions say.

### A description that works

> The timeline line jumped on phones when the plane image loaded late, because the path was measured before the image had a height. The path is now rebuilt on the plane's `load` event as well as on resize.
>
> I tried reserving the plane's height in CSS first. That fixed the jump but broke the curve on tablet, where the plane sits in the margin.
>
> Checked at 390 and 834 with the network throttled to Slow 4G, scrolling the timeline up and down about twenty times. Desktop unchanged.
>
> Low risk: one component, no data touched. Revert the commit if it misbehaves.
>
> Implements the progress line from TECH_SPEC §6 and Figma node 353:7369.

## 3 · The self-review pass

Read your own diff on the PR page before asking anyone else to. You'll find three things every time: a leftover debug line, a file you didn't mean to touch, and one function that made sense an hour ago. Fix them before the review, each as its own small commit.

Then check what CI can't:

1. Does the description explain *why*, not *what*?
2. Does anything in the diff contradict the tech docs? If the docs are wrong, say so in the description and log it in `STATE.md`. Don't quietly diverge.
3. Did a design change land without Figma changing first? Figma is the source of truth.
4. Is there a test for the thing that was broken?
5. Is `STATE.md` updated for every decision the docs don't cover?
6. Could someone review it in ten minutes? If not, split it.

## 4 · After the merge

Check that the deploy run on the base branch went green, then look at what you changed on the live site.
