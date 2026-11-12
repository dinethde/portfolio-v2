# ARCHITECTURE.md

How the parts of the portfolio fit together. It's a small site, so this is a short file.

- **The look** is in `DESIGN.md` and Figma.
- **Tools, folders and the exact rules** for each area are in `TECH_SPEC.md`.

## 1. The big picture

The portfolio is **one page, built ahead of time, and refreshed in the background every 6 hours.** The browser gets finished HTML and a small amount of JavaScript for the parts that move. Nothing is fetched from the browser.

```
              build time                                   request time
┌───────────────────────────────┐        ┌──────────────────────────────────────────────┐
│ next build                    │        │ Visitor                                      │
│  ├─ content/*.ts  (zod check) │        │   └─▶ Cloudflare edge cache ──hit──▶ HTML   │
│  ├─ getContributions()        │        │            │ miss / stale                    │
│  │    └─ GitHub GraphQL       │        │            ▼                                 │
│  └─ renders page → HTML       │        │        Worker ─▶ Container (Next.js server)  │
└───────────────────────────────┘        │                    └─ re-renders the page    │
                                         │                       every 6 h at most      │
                                         └──────────────────────────────────────────────┘
```

## 2. One page, five sections

`app/page.tsx` is the only real page. It does two things:

1. It gets the chart data, `await getContributions()`, which never throws.
2. It renders the sections in order: `IntroSection` → `StorySection` → `ProjectsSection` → `AboutSection` → `ContactSection`.

`app/layout.tsx` wraps every page with the fonts, the metadata, the skip link and `SiteMenu`.

## 3. The layers

Each layer only uses the layers below it.

| Layer          | Folder                    | May use                                                 | Must not use                           |
| -------------- | ------------------------- | ------------------------------------------------------- | -------------------------------------- |
| Route          | `app/`                    | sections, menu, `lib/github`, `lib/seo`, `content/site` | —                                      |
| Section        | `components/sections/`    | components, hooks, `content/`                           | `lib/github`                           |
| Component      | `components/<group>/`     | `components/ui`, hooks, `lib/motion`                    | other groups, `content/`, `lib/github` |
| Building block | `components/ui/`          | `lib/motion`                                            | everything above it                    |
| Hook           | `hooks/`                  | `lib/`                                                  | components                             |
| Data           | `content/`, `lib/github/` | `zod`                                                   | React, components                      |

- **Sections are the only place where content meets components.** Components get everything through props, so they can be shown in the lab with sample data.
- **If a task seems to need a forbidden import, the task is wrong.** Stop and ask; don't work around it.

## 4. Server and client

Everything is a Server Component unless it has to react to the browser.

| Client component                          | Why                                                       |
| ----------------------------------------- | --------------------------------------------------------- |
| `SiteMenu` (with `MenuPill`, `MenuPanel`) | Knows which section is in view, opens and closes          |
| `ProgressPath`                            | Follows the scroll and draws the timeline line            |
| `Reveal`                                  | Plays the entrance once, when the content comes into view |
| `ChartTooltip`                            | Follows the pointer over the chart                        |

Keep the `"use client"` line on these leaf files only, never on a section or on the page.

## 5. Data

**Content** sits in `content/*.ts`. `content/schema.ts` defines the shapes with zod, and the types come from those shapes. A typo in content fails the build.

**The GitHub chart** goes through these steps, and each one can be tested on its own:

```
getContributions()                        lib/github/contributions.ts  (server only)
  ├─ fetchCalendar(login, token)            GraphQL call, 5 s timeout
  ├─ toContributions(raw, now)              lib/github/map.ts — pure: levels, week trimming, shape
  └─ on any error → fallback JSON           content/contributions.fallback.json, logged as [contrib]
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
| GitHub is down or slow          | The fallback data is shown. The page still renders, and the next rebuild tries again |
| Content doesn't fit a component | Follow that component's "content doesn't fit" card in Figma                          |
| An image is missing             | The build fails. Images are imported, not linked by string                           |
| JavaScript fails to load        | All text, links and the chart grid still work. Only motion and the tooltip are lost  |
| The container is asleep         | The edge cache serves the page. The first uncached visit waits about 1–3 s           |

## 8. The lab (development only)

`app/(dev)/lab/` shows every component on its own, in every Figma variant and state, using sample data. Each component has its own entry file in `entries/`, so parallel work never touches the same file. In production it returns 404.

Use it to build a component without the rest of the page. Screenshot it at 390, 834 and 1440, and compare with the Figma board.
