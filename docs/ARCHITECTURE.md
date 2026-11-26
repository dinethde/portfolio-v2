# ARCHITECTURE.md

How the parts of the portfolio fit together. It's a small site, so this is a short file.

- **The look** is in `DESIGN.md` and Figma.
- **Tools, folders and the exact rules** for each area are in `TECH_SPEC.md`.

## 1. The big picture

The portfolio is **one page, built ahead of time as plain files, and rebuilt every 6 hours** (STATE D-86, D-87). The browser gets finished HTML and a small amount of JavaScript for the parts that move. Nothing is fetched from the browser.

```
         build (deploy.yml: merge to main, every 6 h)              request time
┌───────────────────────────────────────────┐        ┌──────────────────────────────────────┐
│ next build  (output: "export")            │        │ Visitor                              │
│  ├─ content/*.ts  (zod check)             │        │   └─▶ Cloudflare Worker static       │
│  ├─ getContributions() ─▶ GitHub GraphQL  │──out/─▶│       assets ─▶ the built files      │
│  └─ renders page → out/index.html         │        │       (no server, nothing to wake)   │
└───────────────────────────────────────────┘        └──────────────────────────────────────┘
```

## 2. One page, five sections

`app/page.tsx` is the only real page. It does two things:

1. It gets the chart data, `await getContributions(login)`, with the login from `GITHUB_LOGIN`, which never throws.
2. It renders the sections in order: `IntroSection` → `StorySection` → `ProjectsSection` → `AboutSection` → `ContactSection`.

`app/layout.tsx` wraps every page with the fonts, the metadata and the skip link. `app/page.tsx` renders `SiteMenu` above the sections, so the dev lab and the 404 page have no site menu.

## 3. The layers

Each layer only uses the layers below it.

| Layer          | Folder                    | May use                                                 | Must not use                           |
| -------------- | ------------------------- | ------------------------------------------------------- | -------------------------------------- |
| Route          | `app/`                    | sections, menu, `lib/github`, `lib/seo`, `content/site` and `content/nav` (the menu's links and contact rows); the dev-only `(dev)/lab` may import any component and read `content/` and `assets/` (§8) | —                                      |
| Section        | `components/sections/`    | components, hooks, `content/`                           | `lib/github`                           |
| Component      | `components/<group>/`     | `components/ui`, hooks, `lib/motion`, `assets/` (decorative art) | other groups, `content/`, `lib/github` |
| Building block | `components/ui/`          | `lib/motion`, `assets/` (decorative art)                | everything above it                    |
| Hook           | `hooks/`                  | `lib/`                                                  | components                             |
| Data           | `content/`, `lib/github/`, `lib/seo.ts` | `zod`; `content/` also imports `assets/` and the `next/image` types; `lib/github` reads `content/contributions.fallback.json`; `lib/seo` reads `content/site` | React, components                      |

- **Sections are the only place where content meets components.** Components get everything through props, so they can be shown in the lab with sample data.
- **If a task seems to need a forbidden import, the task is wrong.** Stop and ask; don't work around it.

## 4. Server and client

Everything is a Server Component unless it has to react to the browser.

| Client component                          | Why                                                       |
| ----------------------------------------- | --------------------------------------------------------- |
| `SiteMenu` (with `MenuPill`, `MenuPanel`) | Knows which section is in view, opens and closes          |
| `ProgressPath`                            | Follows the scroll and draws the timeline line            |
| `Reveal`                                  | Plays the entrance once, when the content comes into view (not the intro: it uses the CSS `animate-entrance`, STATE D-77) |
| `RevealGroup`                             | Staggers the entrances of the `Reveal`s inside it         |
| `ChartTooltip`                            | Follows the pointer over the chart                        |

Keep the `"use client"` line on these leaf files only, never on a section or on the page.

## 5. Data

**Content** sits in `content/*.ts`. `content/schema.ts` defines the shapes with zod, and the types come from those shapes. A typo in content fails the build.

**The GitHub chart** goes through these steps, and each one can be tested on its own:

```
getContributions(login)                   lib/github/contributions.ts  (server only)
  ├─ fetchCalendar(login, token, now)       GraphQL call, 5 s timeout (`now` makes the date range testable)
  ├─ toContributions(raw, now)              lib/github/map.ts — pure: levels, week trimming, shape
  ├─ on any error, CONTRIBUTIONS_STRICT=1 → throw (the build fails; the last deploy stays live, STATE D-87)
  └─ on any error otherwise → fallback JSON content/contributions.fallback.json, logged as [contrib]
```

The chart component only receives the final shape. It never knows whether the data is live or from the fallback.

## 6. Browser state

There's no global store. There are two hooks, and both read the page:

- **`useActiveSection()`**: one `IntersectionObserver` on the five anchors. It's provided once by `SiteMenu`, so the desktop menu and the phone pill always agree.
- **`useTimelineProgress()`**: turns the scroll position into a number from 0 to 1, plus which dots are lit. It's used only inside `ProgressPath`.

Everything else is local state: whether the menu is open, and which chart cell is under the pointer.

## 7. When things go wrong

| Situation                       | What happens                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| GitHub is down or slow          | The scheduled build fails, so the last deploy and its data stay live. The next rebuild tries again |
| Content doesn't fit a component | Follow that component's "content doesn't fit" card in Figma                          |
| An image is missing             | The build fails. Images are imported, not linked by string                           |
| JavaScript fails to load        | All text, links and the chart grid still work. Only motion and the tooltip are lost  |

## 8. The lab (development only)

`app/(dev)/lab/` shows every component on its own, in every Figma variant and state, using sample data. Each component has its own entry file in `entries/`, so parallel work never touches the same file. Its page is `page.dev.tsx`, which only `next dev` picks up, so the static export has no `/lab` (STATE D-89).

Lab entries may read `content/` for sample data, and may be `"use client"` when they need to drive a component's state (as the timeline entry sets its dots' data attributes).

Use it to build a component without the rest of the page. Screenshot it at 390, 834 and 1440, and compare with the Figma board.
