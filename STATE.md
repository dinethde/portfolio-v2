# STATE.md

Where the project is right now, and every decision that **Figma, `docs/TECH_SPEC.md` and `docs/ARCHITECTURE.md` don't spell out**.

**How to use this file**
- Read it at the start of a session. It's short on purpose.
- Update it **in the same commit** as the change that needs it.
- Keep "Now" to a few lines. Add each new decision to the bottom of the decisions table, with the next number. Never delete a row: if a decision changes, add a new row that replaces the old one.
- If a decision contradicts Figma or the docs, **don't make it**. Flag it under "Open" and ask.

## Now

_Updated 2026-11-13_

- **Done:** the docs (`docs/DESIGN.md`, `ARCHITECTURE.md`, `TECH_SPEC.md`), the Figma → Tailwind token pipeline (`src/styles/design-tokens.css`), `src/app/globals.css`, the orchestrator kit (installed with `orch sync`) and the plan for the Next.js stack (`plan/`, 34 tasks).
- **Next:** `/run-plan`, starting with P0-01. There's no `package.json` yet.

## Decisions not covered by Figma or the docs

| # | Date | Decision | Why | Affects |
|---|---|---|---|---|
| D-01 | 11-13 | Host the Docker image on **Cloudflare Containers** behind Cloudflare's edge cache | The brief said "Cloudflare and Docker". Containers runs a Docker image directly | TECH_SPEC §8 |
| D-02 | 11-13 | **Bun** installs and builds; the container runs **Node 22** (`node server.js`) | Next's standalone server is built for Node; Bun still has gaps there | Dockerfile |
| D-03 | 11-13 | CSP allows `'unsafe-inline'` scripts, with no nonce | A nonce forces every request to render fresh, which kills the edge cache and brings back cold starts. The page has no input and no third-party scripts | TECH_SPEC §9 |
| D-04 | 11-13 | The page is static and refreshed every 6 h (`revalidate = 21600`). GitHub fetch times out after 5 s, then falls back to JSON | It keeps the page fast and the chart fresh enough | TECH_SPEC §3 |
| D-05 | 11-13 | Edge caching needs a custom domain, because it does nothing on `*.workers.dev` | Cloudflare platform limit | TECH_SPEC §8, O2 |
| D-06 | 11-13 | Tokens: `--spacing: 1px`, so `p-16` = 16px | Class numbers then match the Figma `space/*` names | TECH_SPEC §2.1 |
| D-07 | 11-13 | Tailwind's default colours, font sizes, radii and breakpoints are cleared | Only Figma values can be used | `design-tokens.css` |
| D-08 | 11-13 | Token names: Figma `text/` → `txt-`; `bg/` and `components/` are dropped | Same scheme as apps-store; avoids `text-text-…` | TECH_SPEC §2.1 |
| D-09 | 11-13 | Only the serif font is in `@theme inline` (it points at the `next/font` variable on `<html>`). Rounded and sans are normal theme values | With `inline`, the page default font didn't resolve. Found in testing | `design-tokens.css` |
| D-10 | 11-13 | Breakpoints `tablet:` 600px and `desktop:` 1100px (written in rem), shadows `shadow-pill` / `shadow-card`, easing `ease-soft` | They're not Figma variables, but they live in the token file so it stays the only file with raw values | `build_tokens.py` EXTRA |
| D-11 | 11-13 | The chart green is called `info` | That's its name in Figma | tokens |
| D-12 | 11-13 | Border 1.5px is `border-[1.5px]` | Tailwind has no border-width theme namespace, and `border-1.5` doesn't compile | TECH_SPEC §2.1 |
| D-13 | 11-13 | Kept `motion`, Biome, Vitest, Playwright and Lighthouse CI, though they're not in the stack list | Needed for the timeline, linting and tests | TECH_SPEC §1 |
| D-14 | 11-13 | The Sonnet builder may **read** Figma. The Haiku mechanic doesn't use Figma. Nobody edits Figma | "Figma is the source of truth" means agents must read it. Mechanic tasks don't need design | `.claude/agents/` |
| D-15 | 11-13 | **Every agent, workers included, commits atomically** after each change, staging by path | Dineth's atomic-commit rule. Replaces the old "the main session commits each wave" | CLAUDE.md, hooks |
| D-16 | 11-13 | `git push` and `gh pr create` need the user's approval (the "ask" list). PRs only when asked. The base branch is `main` | The PR skill came from Vows (`dev-v2`); this repo's flow is `feat/*` → `main` | settings, PR skill |
| D-17 | 11-13 | Raw colours inside **SVG assets** exported from Figma (brand mark gradient, project glows) are allowed | They're artwork, not styling. `check_tokens.py` scans `.ts/.tsx/.css` only | check_tokens |
| D-18 | 11-13 | `useEffect` must have a `// subscription:` comment on the line above | That's how the "only for a real subscription" rule can be checked | check_code_rules |
| D-19 | 11-13 | `DESIGN.md` front matter uses short token names; code uses the full Figma path names | DESIGN.md is a summary; TECH_SPEC §2.1 has the real mapping | DESIGN.md |
| D-20 | 11-13 | The Claude setup is the generic **orchestrator kit** (`agentic-setups/orchestrator`), copied in by `orch sync`. Kit files are never edited here; project settings are `.claude/orchestrator.json` and `.claude/settings.json` | One setup for every project, updated with `git pull` + `sync`. Not a plugin: plugin agents ignore the `hooks` and `permissionMode` the worker loop needs | `.claude/`, `CLAUDE.md` first part |
| D-21 | 11-13 | The plan is **one file per task in `plan/`**, with status in the file. Claude Code's native Tasks only show the current wave's progress | Files are versioned and reviewable, and the hooks can read them. Native Tasks live outside the repo. One file per task lets a worker read only its own brief | `plan/`, replaces `PLAN.md` |
| D-22 | 11-13 | Task agents are `lead`, `builder`, `mechanic` and `human` (were `opus` and `you`) | The kit names roles, not models, so it works whatever model the lead runs | `plan/` |
| D-23 | 11-13 | Figma files are exported once by the lead (P0-05) into `src/assets/` and `copy/desktop.md` | The mechanic has no Figma access, and one export keeps every task working from the same files | P0-05 |
| D-24 | 11-13 | The component lab is `src/app/(dev)/lab/`, with one `entries/<id>.lab.tsx` per component and no shared registry | Parallel tasks never edit the same file | P0-03 |
| D-25 | 11-13 | Three review agents from the kit: `architecture-auditor`, `design-reviewer`, `test-planner`. A PR is blocked until the auditor passed, and the design reviewer too when `src/app`, `src/components` or `src/styles` UI files changed. Running them during the build is a `run-plan` rule, not a hook | A hook can only block, not start an agent. Gating every edit would cost more than it finds; the PR is the moment that matters | `.claude/orchestrator.json` `reviews` |

## Open (needs Dineth)

- **O1** LinkedIn URL.
- **O2** Domain (needed for D-05).
- **O3** Analytics: Cloudflare Web Analytics, or none.
- **O4** The `resume.pdf` file.
- **O5** Fonts off Apple devices: accept `system-ui`, or self-host a rounded fallback.
- **O6** Check that Cloudflare Containers is out of beta and the plan fits before launch.
