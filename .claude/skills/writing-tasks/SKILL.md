---
name: writing-tasks
description: How the lead writes and changes the task files in plan/ (fields, sizing, who gets what, verify commands). Use when creating a plan, adding or splitting a task, or rewriting one that a worker got stuck on.
---

# Writing tasks

A task file is a worker's whole brief. A worker that has to guess will guess wrong, so write the task so it doesn't have to.

## The file

`plan/<ID>.md`, where the file name is the id:

```markdown
---
id: P1-04
title: Pill
agent: builder
status: todo
needs: [P1-01, P1-02]
owns:
  - src/components/ui/Pill.tsx
  - src/components/ui/Pill.types.ts
  - tests/unit/pill.test.tsx
read:
  - docs/TECH_SPEC.md §5
  - src/components/ui/Button.tsx (copy its pattern)
figma: [111:4625]
verify:
  - bun run test tests/unit/pill.test.tsx
---

Build the social pill as a link that opens in a new tab, and the tool pill as plain text with no hover.
```

| Field | Rule |
|---|---|
| `id` | Phase and number, `P<phase>-<nn>`. Never reuse or renumber an id |
| `agent` | `lead` (the main session), a worker (`builder`, `mechanic`) or `human` |
| `status` | `todo`, `doing`, `done`, `blocked`. Change it with `orch status`, not by hand |
| `needs` | Ids that must be `done` first. Only real dependencies: every extra one slows the plan |
| `owns` | The only files the task may create or change. `dir/**` owns a folder. Two tasks that could run together must not share a file |
| `read` | The exact doc sections and example files. Nothing "for context" |
| `figma` | Node ids for anything visible. Empty for non-visual work |
| `verify` | Commands that must all exit 0. Every non-human task has at least one |
| body | What to build, in a few plain sentences. Decisions already made, not options |

Front matter is a strict YAML subset: `key: value`, `key: [a, b]`, or a `key:` line followed by `  - item` lines. Comments only on their own line. `python3 .claude/orch.py check-plan` catches mistakes, missing dependencies and cycles.

## Who gets what

| Agent | Give it |
|---|---|
| `lead` | Foundations, anything later tasks copy (the first component of a kind), the hardest logic or motion, reviews |
| `builder` | Normal components, sections, server code, CI. Work that needs judgement inside clear limits |
| `mechanic` | Work with one right answer: converting files, copying text word for word, meta tags, wiring |
| `human` | Accounts, secrets, purchases, decisions only the user can make |

## Size

- One task is one reviewable change: usually one component with its types and test, one script, or one section.
- A worker should finish in about 20 turns. If a task needs "and also", split it.
- If two tasks would share a file, either merge them or add a `needs` between them.

## Verify commands

- Prefer a specific test file over the whole suite: `bun run test tests/unit/pill.test.tsx`.
- Visible work also gets the project's screenshot command, if it has one.
- The config's `checks` (lint, typecheck, token and code-rule scripts) already run on the owned files. Don't repeat them here.

## Changing the plan

- Fix a task that blocked a worker before resending it. Add what was missing to the body.
- Adding a task: next free number in its phase. Splitting: keep the old id for the first part.
- Commit plan changes on their own: `chore(plan): split P2-04 into chart grid and tooltip`.
