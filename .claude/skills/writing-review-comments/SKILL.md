---
name: writing-review-comments
description: How to write and answer pull request review comments so the author knows at a glance what blocks the merge and what to do next. Load before commenting on a PR, replying to a review thread, or summing up a review.
---

# Writing review comments

A review comment interrupts someone in the middle of their work. It lands when they can tell in one read **how much it matters** and **what to do next**. Comments that hide a blocker among nitpicks, or dress a firm objection up as a shy question, waste both sides' time and stall the merge.

## 1 · Label every comment

Start each comment with one label (from Conventional Comments):

| Label | Blocks the merge? | Use it for |
|---|---|---|
| `issue:` | **Yes** | Something wrong: a bug, a broken rule from the docs or CLAUDE.md, a missing test, a security hole, work outside the task |
| `question:` | **Yes, until answered** | You might be missing context. A reply that explains is enough; it doesn't need a code change |
| `suggestion:` | No | A better way you'd consider worth it, with the reason |
| `nit:` | No | Small polish the author may ignore: a name, a clearer line |
| `praise:` | No | Something done well, named specifically |

- **If it must be fixed before the merge, it's an `issue:`**, not a nit. Say why it blocks.
- **Never hide an objection in a question.** "Did you consider X?" when you mean "X is required" is an `issue:`.
- **Style that a linter or formatter can check is never a comment.** Tools handle it.

## 2 · What every comment says

1. **What's wrong**, on the exact line.
2. **Why it matters**: the bug it causes, the rule it breaks, the user it hurts.
3. **What it should be**: the fix, or the direction if there are several.
4. **The proof**, when there is one: the doc section, the Figma node, the input that breaks it, the failing command.

Two or three sentences. If it needs more, the problem is probably the design: say that once, in the summary.

> **Bad:** This is wrong.
>
> **Bad:** Hmm, maybe we could think about whether this handles all the cases?
>
> **Good:** `issue:` An empty `weeks` array reaches `weeks[0].date` here and throws, so the chart crashes for a new GitHub account. Return the empty state first (TECH_SPEC §3, "Display rules"). A test with `[]` would catch it.
>
> **Good:** `nit:` `data` → `contributions` would say what this holds.
>
> **Good:** `praise:` Mapping the levels in one pure function makes the fallback path trivial to test.

## 3 · Tone

- **About the code, never the person.** "This function…", not "You forgot…". Use "we" for shared work: "we should guard this".
- **Plain and direct.** No "just", "simply", "obviously" or "clearly": what's obvious to you wasn't to the author.
- **No sarcasm and no rhetorical questions.**
- **Your taste isn't a blocker.** Code written differently from how you'd write it is fine if it's correct and follows the rules. At most it's a `suggestion:`.
- **Praise only what's real**, and name it. One or two per review, when earned. Never filler like "Great work!".

## 4 · How many

- **Lead with what matters.** Correctness, design and rules first. If those are wrong, skip the nits: they'll change anyway.
- **A few nits at most.** The same small problem in many places gets one comment that names the pattern, not ten.
- **One comment per problem.** Don't repeat a point in the summary and on the line.

## 5 · The summary

The review body (the comment that holds the inline ones):

```
CHANGES: 2 issues, 1 question. Everything else looks right.
- The empty-data crash in ContributionChart (see the line comment).
- No test for the fallback path.
Not blocking: 2 nits, 1 suggestion.
```

Verdict first, then the one to three things that decide it. Don't retell the diff.

## 6 · Replying to a comment

- **Fixed:** `Fixed in 3f2a1c9: guard the empty array and add a test with [].` Name the commit and what changed.
- **Not fixing a suggestion or nit:** one line on why. That's enough; it doesn't block.
- **Disagreeing with an issue:** the reason and the proof (the doc section, the Figma node, a test), and what you'd do instead. Then leave it to the reviewer.
- **Don't argue twice.** If the second reply doesn't settle it, the lead decides from the docs and Figma, not from who argues longer.
- **Never resolve a thread someone else opened.** The person who raised it resolves it.

## 7 · The second pass

- Reply on every thread you opened: resolve it if fixed, or say what's still missing.
- Review the new commits as carefully as the first time. "Approve because they changed something" lets bugs through.
- Don't raise new nits on lines that didn't change.

## Never

- Emoji, tool attribution, or "As an AI…". The same rules as `writing-commits`.
- Retelling the diff ("This PR changes X to Y").
- Comments on generated files or lockfiles, unless they shouldn't be in the PR at all.
