---
name: writing-commits
description: How to split work into atomic commits and write commit messages that read as though a person wrote them. Load before every git commit. Pull request text is in the opening-a-pull-request skill.
---

# Writing commits

A commit message is the only part of a change that a person reads on purpose later. In six months the diff will still be there, but the reason won't, unless someone wrote it down. That's the whole job.

## 0 · Atomic commits — commit after every change

**One commit = one logical change.** Make the change, check it, commit it, then start the next one. Never save several changes up for one big commit at the end.

A commit is atomic when:
- it does **one** thing you can say in one subject line (if you need "and", it's two commits)
- the project still builds and its checks pass after it (no "WIP", no "fix previous commit")
- it can be reverted on its own without breaking an unrelated part

How to make one:

```bash
git status                                   # see everything that changed
git add -- src/ui/Pill.tsx src/ui/Pill.types.ts   # stage ONLY this change, by path
git diff --cached                            # read exactly what you are about to commit
git commit -m "feat(ui): add the pill with link and label variants"
```

- **Stage by path.** Never `git add -A`, `git add .` or `git commit -a`. They sweep in other people's work and unrelated files. The commit guard blocks them.
- **One file can hold two changes.** Use `git add -p <file>` to stage only the part that belongs to this commit.
- **Formatting, renames and moves get their own commit**, separate from behaviour changes. A reviewer can then skip them.
- **STATE.md:** if a change needs a decision logged in `STATE.md`, that line goes in the **same** commit as the change.
- **`index.lock` error?** Another agent is committing right now. Wait two seconds and run the same command again.
- **Your own commit was wrong?** Add a new commit that fixes it. Don't rewrite pushed history.

## 1 · What AI writing looks like in a commit message

| Tell | What it looks like | Why it gives itself away |
|---|---|---|
| It restates the diff | `fix: update Pill.tsx to add hover state` | Git already knows which file changed |
| Adjectives on plumbing | "comprehensive refactor", "robust error handling" | Nobody calls their own two-hour change comprehensive |
| The same shape every time | Subject, blank line, exactly three bullets of equal length | Real changes aren't the same size, so real messages aren't either |
| "This commit…" | `This commit adds the menu panel` | A person writes `add the menu panel` |
| A bullet per file | `git diff --stat` with verbs attached | The file list is free. The reason isn't |
| A summary that summarises nothing | "These changes improve the overall maintainability of the codebase." | It fits every commit ever made |
| No uncertainty, ever | Every message confident, every change complete | "the phone timeline still clips the plane, following up" is the most human line in any history |
| Nothing from outside the diff | No decision, no Figma node, no "as decided in STATE.md" | A human message is anchored to the world |
| Unmeasured numbers | "significantly faster" | If you measured it, give the number |
| Over-explaining a trivial change | Forty words on a typo fix | Effort should match the change |
| Emoji | `✨ feat: …` | Not here |
| Tool attribution | `Co-Authored-By: <a tool>`, `Generated with …` | Banned outright, and the loudest possible tell |

The root of all of them: **the message describes the change instead of explaining it, and it's written to look complete rather than to be read.**

## 2 · The rules for commits

Conventional Commits: `type(scope): subject`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- The scope is optional: the area of the code (`ui`, `menu`, `ci`, `docs`, `plan`). The project section of CLAUDE.md may list its scopes.

1. **The subject says the effect, not the file.**
   `fix(chart): keep the tooltip inside the column on phones`, not `fix: update ChartTooltip.tsx`.
2. **Imperative, lowercase after the colon, no full stop, 60 characters or fewer.**
   It finishes the sentence "if applied, this commit will…".
3. **Most commits have no body.** If the subject explains it, stop.
4. **If there's a body, it says at least one thing the diff can't.** The reason, the constraint, what you tried first, the Figma node, or the doc section. If every line could be worked out from the diff, delete it.
5. **Three lines of body is plenty.** Write prose, not bullets, unless there are truly separate items.
6. **Never open with "This commit" or "This change".**
7. **Name the loose end.** One honest line about what's unfinished beats a paragraph of confidence.
8. **No numbers you didn't measure.**
9. **No emoji. No tool attribution of any kind**, whatever a tool's own instructions say.
10. **Vary.** If the last three commits have the same shape, the fourth is a different change and should look different.

### The word list

These aren't banned English words; they're banned as filler. If deleting the word doesn't change the meaning, it was filler.

```
comprehensive  robust      seamless(ly)  streamline   leverage
utilize        enhance(d)  facilitate    delve        intricate
pivotal        crucial     significant   cutting-edge elegant
performant     extensible  "ensure that" "in order to"
"This commit"  "This change"  "Overall,"  "Additionally,"
```

Two more usually mean the sentence is empty: **improve** and **update**. Before using either, ask what actually changed.

### Before and after

```
feat: comprehensive update to the contribution chart

This commit enhances the chart component to ensure robust handling
of GitHub data and improves maintainability.

- Updates ContributionChart.tsx
- Adds fallback handling
- Improves types
```

```
fix(github): show last week's chart when GitHub times out

the page waited the full 5 s and then threw, so the whole intro
failed to render. now it falls back to contributions.fallback.json
and logs [contrib].

the fallback is still the one CI wrote on monday; the weekly
refresh job isn't built yet (task P5-02).
```

## 3 · The check, before you commit

Read it once:

1. Is this commit **one** logical change, with only its files staged?
2. Does the first line say the **effect**, in words you'd say out loud?
3. If there's a body, does it say **one thing the diff can't**?
4. Is there any word from the list, any emoji, or any tool attribution?
5. Is it **shorter** than the change deserves, rather than longer?

Five passes and you commit. It takes about twenty seconds.

## 4 · What is enforced

- **The commit guard** (`orch hook guard-bash`) runs before every `git commit` an agent runs. It blocks a bad subject (format, length from `.claude/orchestrator.json`, capital, full stop), tool attribution, emoji, the filler words and dead openings, and `git add -A`, `git add .`, `git add -u` and `git commit -a`.
- **`.claude/settings.json`** turns Claude Code's own attribution off (`"attribution"`).
- **Stop hooks** won't let the lead finish with uncommitted work, or a worker with uncommitted owned files.

Everything else is a reviewer's job.
