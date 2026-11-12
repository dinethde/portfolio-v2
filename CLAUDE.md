<!-- orchestrator:begin — managed by `orch sync`, edit the kit instead -->
# How work runs here

A lead session plans and reviews, worker agents write the code, and scripts check every task. This part is the same in every project. The project's own rules follow in the second part.

## Source of truth, whatever happens

- **Design: Figma.** Read the Figma node before you build or change anything visible. If code, docs or a task disagree with Figma, Figma wins. Figma is read-only for agents.
- **Technology: the tech docs named in the project part.** Don't swap a tool, add a pattern or change a folder layout they don't describe.
- **Anything they don't cover: decide, then log it in `STATE.md`** in the same commit as the change. If it would contradict Figma or the docs, don't do it: add it under "Open" in `STATE.md` and ask.
- **Read `STATE.md` at the start of every session.**

## Roles

- **Lead (the main session):** runs the plan with `/run-plan`, does the `lead` tasks and checks every worker's result. Only the lead edits `plan/`, `STATE.md`, the docs and `CLAUDE.md`, and adds packages.
- **Workers:** `builder` (Sonnet, reads Figma) and `mechanic` (Haiku). One task each. They edit only the files the task owns and read only what it lists. They report decisions in NOTES and never plan or redesign. Anything unclear, or a file they don't own: `STATUS: BLOCKED`.
- **Reviewers** (Sonnet, sent by the lead): `architecture-auditor` checks code against the tech docs, `design-reviewer` checks built UI against Figma in a real browser, both read-only. `test-planner` writes the smallest set of tests that finds bugs, and may only write test files. When to send each is in `run-plan`.

## The plan

One file per task in `plan/`, with its status in the file. `.claude/orch.py` reads it:

`python3 .claude/orch.py next` (the next wave) · `show <ID>` · `verify <ID>` · `status <ID> <todo|doing|done|blocked>` · `list` · `check-plan` · `changes` · `reviews` · `doctor`

Hooks do the policing. A worker can't finish until its checks pass and its files are committed. The lead can't finish with uncommitted work. Bad commit messages and `git add -A` are blocked. A PR is blocked until the required reviews passed on the current commit (`orch reviews`). Edited files are formatted.

## Commits: atomic, after every change

Load `writing-commits` before every commit.

- One commit is one logical change that builds and passes on its own. Commit it as soon as it passes.
- Stage by path. Never `git add -A`, `git add .` or `git commit -a`.
- `type(scope): subject`, the effect not the file. No tool attribution, no emoji, no filler.
- `index.lock` error: another agent is committing. Wait two seconds and retry.
- Never push or deploy unless the user asks. PRs follow `opening-a-pull-request`.

## Skills

| Skill | When |
|---|---|
| `run-plan` | Building from the plan (lead only) |
| `writing-tasks` | Writing or changing task files (lead only) |
| `writing-commits` | Before every commit |
| `opening-a-pull-request` | When the user asks for a PR |

## REPORT block (workers end every task with exactly this)

```
TASK: P2-04
STATUS: DONE            (or BLOCKED)
FILES: the files you changed
COMMITS: 3f2a1c9 feat(chart): …, 8b1d0e2 test(chart): …
CHECKS: orch verify PASS · screenshot compared with Figma at the widths that matter
NOTES: anything the lead should look at, decisions to log; for BLOCKED, the one question or the error
```
<!-- orchestrator:end -->

# Project: portfolio-v2

Dineth De Silva's portfolio: one quiet, single-column page. Next.js 16 (App Router), Tailwind v4 and `motion`, built with Bun, shipped as a Docker image on Cloudflare. The design is final: Figma "Portfolio Rewamp", High-fi V1.

## Docs (read only the part your task needs)

| File | Use it for |
|---|---|
| `docs/DESIGN.md` | The design in short, with a link to every Figma node |
| `docs/ARCHITECTURE.md` | How the parts fit: layers and import rules, server vs client, data flow |
| `docs/TECH_SPEC.md` | The tech docs: stack, folders, tokens (§2.1) and the rules for each area. Sections are numbered |
| `STATE.md` | Where the project is, and every decision the docs don't cover |
| `plan/` | The tasks |

## Commands

`bun install` · `bun run dev` · `bun run verify` (lint → typecheck → test → build) · `bun run test <file>` · `bun run e2e <spec>` · `bun run lab:shot <id>` (screenshots at 390, 834 and 1440) · `docker compose up` · `python3 scripts/build_tokens.py`

**For reviewers:** `bun run dev`, then a component at `http://localhost:3000/lab?only=<id>` and the page at `http://localhost:3000`. Breakpoints are 390 (phone), 834 (tablet) and 1440 (desktop).

## Code rules

- **Spacing between siblings is flex or grid `gap`**, never margins and never `space-x/y-*`.
- **A component file stays under 250 lines.** Split it before it grows past that.
- **Props are a named, exported interface in `<Name>.types.ts`** beside the component, never inline.
- **Avoid `useEffect`.** Only for a real subscription to something outside React, with `// subscription: <what>` on the line above.
- **Import order:** third-party → react → aliases (`@/…`) → relative.
- **No hex, `rgb()`, `hsl()` or `oklch()` outside `src/styles/design-tokens.css`.** Colour, spacing and radius come from the tokens (TECH_SPEC §2.1); Tailwind's defaults are off. A new colour starts in Figma: change Figma, re-export, run `python3 scripts/build_tokens.py`. Never edit the token file.
- TypeScript strict, named exports, one component per file, the layers in ARCHITECTURE §3.
- Server Components by default; `"use client"` only on the leaves in ARCHITECTURE §4.
- Figma states (Hover, Focus, Pressed, Visited) are CSS states, not props.
- Copy lives in `src/content/` (zod), never in components. `GITHUB_TOKEN` stays in `src/lib/github/`.
- Accessibility (TECH_SPEC §5) is a requirement.
- Helper scripts in `scripts/` are typed Python 3.9+, standard library only, formatted and linted with ruff (`ruff.toml`), with tests in `scripts/tests/`.

`scripts/check_tokens.py` and `scripts/check_code_rules.py` check what a script can; `orch verify` runs them on every task. A reviewer checks the rest.

Commit scopes: `ui`, `menu`, `chart`, `timeline`, `project-card`, `footer`, `sections`, `content`, `github`, `tokens`, `seo`, `a11y`, `motion`, `docker`, `worker`, `ci`, `docs`, `plan`, `claude`.
