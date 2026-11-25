# portfolio-v2

The new portfolio site of **Mine**: *"An artistic designer and engineer"*

One quiet page that reads like a letter: who I am → where I've been → what I've made → who I am outside work → say hi.

## For everyone

- **Design:** Figma file [Portfolio Rewamp](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=318-7563), High-fi V1. The short version is in `docs/DESIGN.md`.
- **Build:** Next.js and Tailwind CSS, built with Bun, packed in Docker and hosted on Cloudflare. The GitHub chart shows real data, refreshed every 6 hours.
- **Status:** design done. The code is built step by step from the tasks in `plan/`.

## Docs

| File | What it is |
|---|---|
| `docs/DESIGN.md` | The design in short, with links to every Figma frame. Figma is the source of truth |
| `docs/ARCHITECTURE.md` | How the parts fit together |
| `docs/TECH_SPEC.md` | The stack, the folders and the technical rules (open decisions in §12) |
| `STATE.md` | Where the build is, and decisions the docs don't cover |
| `plan/` | The build order, one file per task |
| `CLAUDE.md` | Rules for every Claude Code session |

## Developer instructions

### Building with Claude Code

1. Open the repo in Claude Code and trust the folder. The workers' check hooks only run in a trusted folder.
2. Connect the Figma MCP. Agents read the design from Figma.
3. Type `/run-plan`. The lead (Opus) does the core tasks itself, sends `builder` (Sonnet) and `mechanic` (Haiku) workers the rest, and checks each result.

See where the plan stands with `python3 .claude/orch.py list`, or check one task by hand with `python3 .claude/orch.py verify P2-04`.

The Claude setup is the orchestrator kit from `~/Developer/personal/agentic-setups/orchestrator`, copied in with `orch sync`. Don't edit its files here. This repo's own settings are `.claude/orchestrator.json` and `.claude/settings.json`. To update the kit: `git pull` in `agentic-setups`, then `python3 ../agentic-setups/orchestrator/orch.py sync .`

### Commands

```
bun install
bun run dev          # local site, plus /lab for components
bun run verify       # lint → typecheck → test → build
bun run e2e          # Playwright
python3 -m unittest discover scripts/tests   # the Python helper scripts
docker compose up    # the production image on localhost:3000
```

### Secrets

`GITHUB_TOKEN` (fine-grained, read-only) goes in `.env.local` for local work. For deploys it goes in Cloudflare and the GitHub Actions secrets. See `.env.example` and TECH_SPEC §8.
