# TECH_SPEC.md

How the portfolio is built. **How it looks** is in `DESIGN.md` and Figma. **How the parts fit together** is in `ARCHITECTURE.md`. This file covers the tools, the folders and the rules for each technical area.

Sections are numbered so a task can point straight at one (for example "TECH_SPEC §3").

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, React 19.2, TypeScript `strict`) | Server Components keep the page almost free of JavaScript, and it has built-in SEO tools |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) | Figma variables become Tailwind theme variables and utility classes (§2.1) |
| Icons | **lucide-react**, plus monochrome SVGs exported from Figma where Lucide has no match | One icon style; the brand and tech logos come from Figma |
| Motion | **motion** (`motion/react`) | Scroll progress, entrances and reduced-motion support |
| Validation | **zod** | Checks the content files and the GitHub response |
| Package manager and scripts | **Bun** (`bun install`, `bun run …`) | Fast installs and one tool for scripts. The production server still runs on Node (see §8) |
| Lint and format | **Biome** | One fast tool for both |
| Tests | **Vitest** + Testing Library · **Playwright** + axe · **Lighthouse CI** | Unit, browser, accessibility and speed checks |
| Hosting | **Docker** image on **Cloudflare Containers**, behind Cloudflare's edge cache | See §8 |
| Code, CI and data | **GitHub**: the repo, GitHub Actions, and the GitHub GraphQL API for the chart | |
| Helper scripts | **Python 3.9+**, standard library, typed, linted with ruff | `scripts/`, tested in `scripts/tests/` |

**Not used:** a CMS, a component library, a database, client-side data fetching, or cookies.

---

## 2. Folder structure

```
portfolio-v2/
├─ src/
│  ├─ app/                         Next.js App Router: routes and route files only
│  │  ├─ layout.tsx                <html lang="en">, fonts, metadata, skip link, the menu
│  │  ├─ page.tsx                  The one page: gets the chart data, renders the 5 sections in order
│  │  ├─ not-found.tsx             A small 404 in the same style
│  │  ├─ globals.css               @import "tailwindcss" → @import design-tokens.css → breakpoints, shadows, easing, base styles
│  │  ├─ icon.svg                  Favicon (the "dr" mark)
│  │  ├─ opengraph-image.png       1200×630 share image
│  │  ├─ robots.ts
│  │  ├─ sitemap.ts
│  │  └─ (dev)/lab/                Component lab: page.tsx, fixtures.ts, entries/<id>.lab.tsx. 404 in production
│  ├─ components/
│  │  ├─ ui/                       Small building blocks: Button, Pill, SectionHeader, RichText, Reveal, BrandMark, icons/
│  │  ├─ menu/                     SiteMenu, MenuPill, MenuPanel, MenuLink
│  │  ├─ contribution-chart/       ContributionChart, ChartTooltip, format.ts
│  │  ├─ timeline/                 TimelineEntry, TimelineDot, ProjectRow, ThumbStack, ProgressPath
│  │  ├─ project-card/             ProjectCard, glows/
│  │  ├─ footer/                   FooterCta, FooterCard
│  │  └─ sections/                 IntroSection, StorySection, ProjectsSection, AboutSection, ContactSection
│  ├─ content/                     All words and project data: site, intro, timeline, projects, about,
│  │                               schema.ts (zod), contributions.fallback.json
│  ├─ lib/
│  │  ├─ github/                   contributions.ts (server only) · map.ts (pure mapping, unit-tested)
│  │  ├─ motion.ts                 Easing, durations, entrance variants
│  │  └─ seo.ts                    JSON-LD builder
│  ├─ hooks/                       use-active-section.ts · use-timeline-progress.ts
│  ├─ styles/                      design-tokens.css (generated from Figma) · figma-variables.json (the Figma export)
│  └─ assets/                      Project and About images (imported, so sizes are known at build)
├─ public/                         resume.pdf
├─ tests/
│  ├─ unit/                        Vitest
│  └─ e2e/                         Playwright + axe
├─ worker/                         Cloudflare Worker that starts and routes to the container (index.ts)
├─ scripts/                        Python helpers: build_tokens.py, check_tokens.py, check_code_rules.py, lab_shot.py,
│                                  fallback refresh, budget checks · figma/export-variables.js · tests/
├─ copy/desktop.md                 Every word of the Figma desktop frame, exported once (STATE.md D-23)
├─ plan/                           One file per task (the orchestrator kit)
├─ .claude/                        The orchestrator kit (managed by `orch sync`) + settings.json, orchestrator.json
├─ .github/workflows/              ci.yml · deploy.yml · refresh-fallback.yml
├─ Dockerfile · .dockerignore · compose.yaml
├─ next.config.ts · postcss.config.mjs · tsconfig.json · biome.json
├─ vitest.config.ts · playwright.config.ts · lighthouserc.json · wrangler.jsonc
└─ package.json · bun.lock · .env.example · ruff.toml
```

### 2.1 Design tokens: Figma → Tailwind

```
Figma variables + text styles
   │  scripts/figma/export-variables.js   (run with the Figma MCP `use_figma`; read-only)
   ▼
src/styles/figma-variables.json           (the export, committed)
   │  python3 scripts/build_tokens.py
   ▼
src/styles/design-tokens.css              (@theme — generated, never edit)
   │  imported by
   ▼
src/app/globals.css                       (@import "tailwindcss"; @import "../styles/design-tokens.css"; …)
```

- **Order matters:** `@import "tailwindcss"` first, then the token file. That's Tailwind's documented way to share a theme file.
- **Only Figma values exist.** The token file clears Tailwind's default colours, font sizes and radii (`--color-*: initial` and so on), so `bg-red-500` or `text-sm` don't compile. `globals.css` also clears the default breakpoints and adds `tablet:` (600px) and `desktop:` (1100px).
- **Names follow the Figma path** (same scheme as apps-store):

  | Figma | Theme variable | Utility |
  |---|---|---|
  | `neutral/1100` | `--color-neutral-1100` | `bg-neutral-1100` |
  | `bg/surface/page/active` | `--color-surface-page-active` | `bg-surface-page-active` |
  | `text/neutral/p1/active` | `--color-txt-neutral-p1-active` | `text-txt-neutral-p1-active` |
  | `components/pill/modern/border` | `--color-pill-modern-border` | `border-pill-modern-border` |
  | `radius/8` | `--radius-8` | `rounded-8` |
  | `space/16` | `--spacing: 1px` | `p-16`, `gap-16`, `w-600` |
  | `p/text/p2/500` | `--text-p2` (+ line height) | `text-p2 font-rounded font-medium` |

- **Links are kept:** semantic colours point at their palette colour (`--color-pill-modern-border: var(--color-outline-neutral-main-active)`), so a palette change flows through.
- **Spacing:** `--spacing: 1px` makes the number in a class equal its pixel value. Stick to the Figma scale: 4, 8, 12, 16, 20, 24, 32, 36, 40, 44, 48, 64, 80, 96, 100, 128.
- **Hover, pressed and focus** use their own tokens: `hover:bg-btn-primary-light-hover-bg`, never `hover:opacity-…`.
- **Border widths** aren't a Tailwind theme namespace: use `border`, `border-2`, `border-4`, `border-[1.5px]`.
- **Fonts:** the serif points at the `next/font` variable, which is set on `<html>`, so it lives in an `@theme inline` block. Tailwind's docs say to use `inline` whenever a theme variable references another variable that might not be on `:root`.
- **To change a token:** change it in Figma, re-run the export script, save the JSON, then run `python3 scripts/build_tokens.py`. CI runs `python3 scripts/build_tokens.py --check`, so a hand-edited token file fails the build.

**Naming:** component files are `PascalCase.tsx`, with props in `PascalCase.types.ts` beside them. Everything else is `kebab-case.ts`. Use named exports, one component per file, and the `@/` import alias for `src/`. The code rules (gap not margins, ≤ 250 lines per component, no `useEffect` without a subscription, import order) are in `CLAUDE.md`.

---

## 3. GitHub contribution chart

**What it shows:** the last 52 weeks of contributions for `dinethde`, with the newest week on the right.

**Where the data comes from:** `src/lib/github/contributions.ts` (marked `import "server-only"`) calls `POST https://api.github.com/graphql` with `Authorization: Bearer ${GITHUB_TOKEN}`. The browser never talks to GitHub.

```graphql
query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}
```

- `from` is now minus 52 weeks, moved back to that Sunday. `to` is now.
- **Level mapping:** `NONE` → 0, `FIRST_QUARTILE` → 1, `SECOND_QUARTILE` → 2, `THIRD_QUARTILE` → 3, `FOURTH_QUARTILE` → 4. Colour cells with the `chart-level-N` tokens, never GitHub's own colours.
- **Shape returned to the page:** `{ total: number; weeks: { date: string; count: number; level: 0|1|2|3|4 }[][]; fetchedAt: string; source: "live" | "fallback" }`.

**Freshness:** `page.tsx` sets `export const revalidate = 21600` (6 hours). The fetch uses `next: { revalidate: 21600 }` and `signal: AbortSignal.timeout(5000)`. The page is built ahead of time and quietly rebuilt in the background at most every 6 hours.

**When GitHub fails:** return `src/content/contributions.fallback.json` with `source: "fallback"`, and log `[contrib]` with the error. **Never throw to the page.** A weekly GitHub Action refreshes the fallback file.

**Display rules:**
- Header: `${total.toLocaleString("en-US")} contributions in ${year}`.
- Tooltip text: "4 contributions on 12 March", "1 contribution on 3 May", "No contributions on 9 June". Format the date with `Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" })`.
- Desktop and tablet show the newest weeks that fit the 600px column (about 40). Phone (< 600px) shows the newest 24.
- The grid is server-rendered. Only the tooltip is a small client component.

---

## 4. SEO and sharing

- **Metadata API** in `layout.tsx`:
  - `metadataBase` comes from `SITE_URL`.
  - Title: "Dineth De Silva — Artistic Designer & Software Engineer".
  - Description: from the first intro paragraph, at most 155 characters.
  - A canonical link to `/`.
  - Open Graph and Twitter `summary_large_image` tags using `opengraph-image.png`.
- **JSON-LD** `Person` with `name`, `jobTitle`, `url` and `sameAs` (GitHub, X, and LinkedIn once it's known), from `lib/seo.ts`.
- `robots.ts` allows everything and points to `sitemap.ts`, which lists one URL.
- Every word is in the server HTML, so nothing important depends on JavaScript.

---

## 5. Accessibility (must pass)

- WCAG 2.2 AA, and axe reports zero violations at 390, 834 and 1440.
- A "Skip to content" link comes first. There's one `<h1>`, and the headings follow the section order.
- **Menu:**
  - Links are real `<a href="#…">`, and the active one has `aria-current="true"`.
  - On phone, the trigger is a `<button aria-expanded aria-controls>`.
  - The open panel traps focus. Esc, an outside click or a link click closes it, and focus goes back to the trigger.
- **Chart:** a `<figure>` with the total as its `<figcaption>`, and `role="img"` with an `aria-label` on the grid. The tooltip is a pointer extra; it's never the only way to get the information.
- **Timeline:** an `<ol>`. Decorative SVG (the rail, plane, glow and photo fan) gets `aria-hidden="true"`.
- **External links:** `target="_blank" rel="noopener noreferrer"`, plus hidden "(opens in new tab)" text.
- Keyboard focus is always visible, using the focus tokens from Figma.
- Section anchors get `scroll-margin-top` (the menu pill height + 16px) on tablet and phone.

---

## 6. Motion

- **Library:** `motion/react`. The timing values live in `src/lib/motion.ts` and follow DESIGN.md "Motion".
- **Server first:** only the parts that move are client components (`"use client"`): `Reveal`, `ProgressPath`, the menu and the chart tooltip.
- **Only animate** `transform`, `opacity` and SVG `stroke-dashoffset`. Never animate layout properties.
- **Entrances:** use `useInView({ once: true, amount: 0.15 })` inside `Reveal`.
- **Timeline progress** (`ProgressPath` + `useTimelineProgress`):
  1. Build one SVG path from the DOM positions of the plane and the dots. Rebuild it when a `ResizeObserver` fires.
  2. Draw it twice: a grey dashed base, and a blue copy with `pathLength="1"`, `stroke-dasharray: 1` and `stroke-dashoffset: 1 − progress`.
  3. `progress = clamp((0.6 × innerHeight − pathTop) / pathHeight, 0, 1)`. Update it in `requestAnimationFrame`, with no spring or smoothing.
  4. Place the "you are here" marker with `getPointAtLength`.
  5. Each dot knows its own position along the path. It's active once progress passes it, and pings once each time it turns on.
- **Reduced motion:** check both `useReducedMotion()` and `@media (prefers-reduced-motion: reduce)`. Show final states only: no entrances, the line fully drawn, every dot active, no ping and no marker. Turn smooth scrolling off.

---

## 7. CI/CD (GitHub Actions)

**Branches:** `main` is production: only a person merges into it, through a PR from `dev` with a merge commit. `dev` is the integration branch: every task is its own `feat/*` or `fix/*` branch and a small PR into `dev`, squash-merged after review and green CI (STATE.md D-26). Commits are **atomic** and follow Conventional Commits; the message rules are in the `writing-commits` skill, and CI checks the PR title and body with the same rules as the commit guard (`python3 .claude/orch.py check-pr`). Configure Biome's import sorting for the order third-party → react → aliases → relative.

| Workflow | When | Steps |
|---|---|---|
| `ci.yml` | Every PR, and every push to `dev` and `main` | `bun install --frozen-lockfile` → `bun run lint` (Biome + `python3 scripts/check_tokens.py` + `python3 scripts/check_code_rules.py` + `python3 scripts/build_tokens.py --check`) → `python3 -m unittest discover scripts/tests` → `bun run typecheck` → `bun run test` → `bun run build` → Playwright (Chromium + WebKit at 390/834/1440, with axe) → Lighthouse CI → `docker build` (proves the image builds) |
| `deploy.yml` | Push to `main`, after CI | `bunx wrangler deploy`, which builds the Dockerfile, pushes the image to Cloudflare and rolls out the Worker and container |
| `refresh-fallback.yml` | Weekly | Fetches fresh contributions into `contributions.fallback.json` and opens a PR if it changed |

`bun run verify` runs lint → typecheck → test → build locally. That's the same as the first half of CI.

**Secrets:** `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (deploy), and `GH_CONTRIB_TOKEN` (chart data for build and fallback refresh).

---

## 8. Hosting

**How it runs:**

```
Visitor → Cloudflare edge cache ──hit──→ cached page (most visits stop here)
                 │ miss
                 ▼
          Worker (worker/index.ts) → Container (Docker image: Next.js standalone server on :3000)
```

- **The Docker image** uses a multi-stage `Dockerfile`:
  - A `oven/bun:1` stage installs dependencies and runs `next build`, with `output: "standalone"` in `next.config.ts`.
  - The final `node:22-slim` stage copies `.next/standalone`, `.next/static` and `public/`, runs as a non-root user and starts `node server.js`.
  - Why Node and not Bun at runtime: Next's standalone server is built for Node, and Bun still has gaps there.
- **Cloudflare Containers:**
  - The Worker uses the `Container` class from `@cloudflare/containers`, with `defaultPort = 3000` and `sleepAfter = "30m"`, and sends every request to one instance (type `basic`).
  - A container that's asleep takes about 1–3 seconds to start. The edge cache hides this for almost every visitor.
  - It needs the Workers Paid plan ($5 a month). A site this small should stay inside the included usage.
- **Edge cache:**
  - Next sends `s-maxage` for the page (from `revalidate`), and Cloudflare caches the HTML.
  - `/_next/static/*` is cached for good, because the file names change on every build.
  - Edge caching needs a **custom domain**. It does nothing on `*.workers.dev`.
- **Locally:** `bun run dev` for development, and `docker compose up` to run the production image on `localhost:3000`.
- **Fallback:** the same image runs on any container host. Put Cloudflare's proxy in front, and nothing else changes.

**Environment variables**

| Name | Where | Secret |
|---|---|---|
| `GITHUB_TOKEN` | Container runtime env (set in the Worker), Docker build secret | Yes |
| `GITHUB_LOGIN` = `dinethde` | `wrangler.jsonc` vars | No |
| `SITE_URL` | `wrangler.jsonc` vars + build arg | No |
| `NEXT_TELEMETRY_DISABLED` = `1` | Dockerfile | No |

Ship a `.env.example`. CI fails if `GITHUB_TOKEN` appears outside `src/lib/github/`.

---

## 9. Security

- **Small attack surface:** there are no forms, logins, cookies, user input, database or third-party scripts.
- **GitHub token:**
  - A fine-grained token that can only read.
  - Used only in `src/lib/github/` (`import "server-only"`).
  - Never logged and never sent to the browser.
- **Headers** are set in `next.config.ts` → `headers()` for every route:
  - `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`
  - `Referrer-Policy: strict-origin-when-cross-origin` · `X-Content-Type-Options: nosniff` · `Permissions-Policy: camera=(), microphone=(), geolocation=()` · `poweredByHeader: false`
  - HSTS is turned on in Cloudflare.
- **Why `'unsafe-inline'` for scripts:**
  - Next.js adds small inline scripts to start React.
  - A per-request nonce would allow a stricter CSP, but it forces every request to render fresh, which stops the edge cache and brings back cold starts.
  - For a static page with no user input and no third-party scripts, that trade isn't worth it.
  - Revisit this if the site ever takes input or adds third-party scripts.
- **Container:** a slim base image, a non-root user, and nothing installed that the server doesn't need.
- **Dependencies:** Dependabot runs weekly, and installs use a frozen lockfile.

---

## 10. Performance

| Budget (mobile)   | Target                                                               |
| ----------------- | -------------------------------------------------------------------- |
| Lighthouse        | Performance ≥ 95 · Accessibility 100 · Best Practices ≥ 95 · SEO 100 |
| LCP / CLS / INP   | < 1.8s / < 0.02 / < 100ms                                            |
| Client JavaScript | ≤ 120 KB gzip                                                        |
| Project image     | ≤ 180 KB at 1200px wide                                              |

- **Server Components by default.** Client components are only the parts listed in §6.
- **Images:**
  - Use `next/image` with `sizes` set, AVIF then WebP.
  - Every image has a width and height. Load lazily below the fold, and eagerly only for what the first screen shows.
  - Add `sharp` so the standalone server can optimise images.
- **Fonts:**
  - Instrument Serif comes from `next/font/google`, which self-hosts it and preloads it. Only the 400 and Italic weights.
  - The SF fonts are never downloaded. Use system stacks instead:
    - Rounded: `ui-rounded, "SF Compact Rounded", "SF Pro Rounded", system-ui, sans-serif`
    - SF Pro: `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif`
- **Requests:** no requests from the browser after the page loads.

---

## 11. Content

- **Where the words live:** every word lives in typed modules in `src/content/`, checked by zod at build time. **Copy text word for word from the Figma desktop frame (93:2106).**
- **No HTML in content:** rich text is stored as runs (`{ text, weight?, tone? }[]`), never as HTML. The tones match the colour signals in DESIGN.md.
- **Site facts** (`site.ts`):
  - Name "Dineth De Silva" and title "Artistic Designer & Software Engineer".
  - GitHub `dinethde`, X `@dinethr_de` (labelled "Twitter").
  - Email `dev.dinethde@gmail.com`, phone `+94 70 324 2772`.
  - Resume at `/resume.pdf`.
  - LinkedIn is still `TODO`.

---

## 12. Open decisions

| #   | Decision                                                                                              | Status       |
| --- | ----------------------------------------------------------------------------------------------------- | ------------ |
| O1  | LinkedIn URL                                                                                          | To come      |
| O2  | Domain (needed for the edge cache, §8)                                                                | Not chosen   |
| O3  | Analytics: Cloudflare Web Analytics (no cookies, needs a CSP host added) or none                      | Open         |
| O4  | `resume.pdf` file                                                                                     | Still needed |
| O5  | Fonts off Apple devices: accept `system-ui`, or self-host a rounded fallback such as Nunito (≈ 25 KB) | Open         |
| O6  | Cloudflare Containers: check that it's out of beta and that the plan limits fit, before launch        | Check        |
