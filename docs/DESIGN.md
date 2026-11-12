---
version: 1
name: Dineth De Silva — Portfolio (High-fi V1)
description: A quiet, single-column portfolio that reads like a letter, not a dashboard. Warm off-white paper, a thin serif for the big titles, a soft rounded sans for everything else. Colour is used only as a signal, so the project images bring the colour. Motion only shows progress, invites a click, or welcomes content once.
figma: https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=318-7563

colors:
  surface-page: "#fcf8f8"
  surface-light: "#ffffff"
  text-p1: "#151e28"
  text-p2: "#253241"
  text-p3: "#5c718a"
  text-secondary: "#006ee5"
  text-brand: "#ec5504"
  text-error: "#e51a1a"
  fill-secondary: "#1a87ff"
  fill-neutral-strong: "#c1ccd7"
  fill-neutral-dark: "#253241"
  outline-main: "#d7dfe5"
  outline-light: "#e0e7eb"
  outline-strong: "#253241"
  timeline-line: "#92a6b9"
  chart-level-0: "#f0f3f4"
  chart-level-1: "#bbf7d0"
  chart-level-2: "#22c55e"
  chart-level-3: "#15803d"
  chart-level-4: "#14532d"
  chart-cell-border: "#e0e7eb"
  btn-primary-light-bg: "#fff1e5"
  btn-primary-light-text: "#ec5504"
  btn-secondary-light-bg: "#edf8ff"
  btn-secondary-light-text: "#3481d9"

typography:
  title-one:      { fontFamily: "Instrument Serif", fontSize: 32px, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.5px }
  title-accent:   { fontFamily: "Instrument Serif Italic", fontSize: 20px, fontWeight: 400, lineHeight: 1.2 }
  heading-h1:     { fontFamily: "SF Pro", fontSize: 20px, fontWeight: 400 | 510 | 590, lineHeight: 1.2 }
  heading-h2:     { fontFamily: "SF Pro", fontSize: 18px, fontWeight: 400 | 510 | 590, lineHeight: 1.2 }
  text-p1:        { fontFamily: "SF Compact Rounded", fontSize: 16px, fontWeight: 400 | 500 | 600, lineHeight: 1.3 }
  text-p2:        { fontFamily: "SF Compact Rounded", fontSize: 14px, fontWeight: 400 | 500 | 600, lineHeight: 1.4 }
  text-p3:        { fontFamily: "SF Compact Rounded", fontSize: 12px, fontWeight: 400 | 500 | 600, lineHeight: 1.4 }

spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 44, 48, 64, 80, 96, 100, 128]
rounded: { none: 0, xs: 4px, sm: 8px, card: 20px, lg: 28px, xl: 32px, pill: 500px }
borders: [1px, 1.5px, 2px]

components:
  section-header:  { eyebrow: "{colors.text-secondary}", title: "{typography.title-one}", divider: "{colors.outline-light}" }
  pill:            { background: "{colors.surface-light}", border: "{colors.outline-main}", text: "{colors.text-p1}", icon: "{colors.text-p2}", typography: "{typography.text-p2}", rounded: "{rounded.sm}" }
  button-primary-light: { background: "{colors.btn-primary-light-bg}", text: "{colors.btn-primary-light-text}", typography: "{typography.text-p2}", rounded: "{rounded.sm}", padding: 4px 16px }
  button-secondary:     { background: "{colors.btn-secondary-light-bg}", text: "{colors.btn-secondary-light-text}", typography: "{typography.text-p2}", rounded: "{rounded.sm}", padding: 4px 16px }
  menu-link:       { default: "{colors.text-p3}", active: "{colors.text-secondary}", typography: "{typography.text-p1}" }
  contribution-chart: { cell: 12px, gap: 3px, rounded: 2px, levels: "{colors.chart-level-0..4}" }
  timeline:        { line: "{colors.timeline-line}", dot-active: "{colors.fill-secondary}", dot-inactive: "{colors.fill-neutral-strong}", status: "{colors.text-brand}" }
  project-card:    { mat: "{colors.surface-light}", rounded: "{rounded.card}", media-ratio: "600 / 500" }
  footer-card:     { background: "{colors.surface-light}", rounded: "{rounded.xl}", padding: 32px, width: 750px }
---

# DESIGN.md

## Figma is the source of truth

The design is finished and lives in Figma. **This file is the short version. Figma has the rest.**

- Before you build or change anything you can see, open its Figma node and read it: its layout, its variables and the note cards beside it.
- If this file and Figma disagree, **Figma wins**. Then fix this file.
- Every colour and text style in Figma is a variable or a style. Use the same names in code, and never type a raw hex.
- The white cards with a tag next to each frame are the designer's notes: why it looks that way, how it moves, and what to do when content doesn't fit. Read them. They aren't repeated here.

| What                                                     | Link                                                                                                                                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The whole handover                                       | [High fidelity](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=318-7563)                                                                                                |
| 01 Brief: the idea, how to read the file, decisions made | [322:7510](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=322-7510)                                                                                                     |
| 02 Foundations: colour, type, spacing, motion rules      | [322:7511](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=322-7511)                                                                                                     |
| 03 Components: one board per component, with every state | [322:7512](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=322-7512)                                                                                                     |
| 04 Pages: the full page at 3 sizes, plus the open menus  | [322:7513](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=322-7513)                                                                                                     |
| Desktop 1440 (copy source for every word)                | [93:2106](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=93-2106)                                                                                                       |
| Tablet 834 · Phone 390                                   | [276:3871](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=276-3871) · [277:4760](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=277-4760) |
| Menu open: tablet · phone                                | [277:6320](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=277-6320) · [277:7638](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=277-7638) |

**In code** every Figma variable is a Tailwind class with the same path, for example `text/neutral/p1/active` → `text-txt-neutral-p1-active`, `radius/8` → `rounded-8`, `space/16` → `p-16`. The full mapping is in TECH_SPEC §2.1.

## Overview

The site is **one long page that reads like a letter**. It's written for design-minded product and engineering teams, who read carefully. A calm page holds them better than a loud one.

There are two kinds of reader:
- **Skimmers** get the whole story in five seconds, from a few coloured words and the project pictures.
- **Readers** who dig in get the timeline, the descriptions and a real GitHub chart.

The feeling is warm, a little nostalgic, a little romantic, and precise: *"Designed to the last pixel, engineered to the last semicolon."*

**Key characteristics:**
- One narrow column (600px) on a warm off-white page (`{colors.surface-page}`).
- Two voices: a thin serif for the big titles, and a soft rounded sans for everything else.
- Colour is a signal, never decoration. Orange means me or a status. Blue means "you can go here" or "you are here". Green is only for the GitHub chart.
- The page is flat. Only three things lift off it: the project pictures, the pills and the footer card.
- Motion only shows progress, invites a click, or welcomes content the first time it appears.

## The page flow

The sections always come in this order. **The order is the argument, so don't change it.**

| # | Section | Anchor | What it does |
|---|---|---|---|
| ① | **Intro** | `#achievements` | Hero header: "Hi, I'm Dineth De Silva" + title. Three short paragraphs where only the key words are darker or coloured. A call to action, four social pills (Twitter, GitHub, Resume, LinkedIn) and the GitHub contribution chart. |
| ② | **Story so far** | `#story` | A timeline that reads like a route on a map. A little plane starts the route. As you scroll, a blue line draws down past each stop, and each stop lights up with a small ping. Each stop has an organisation, a role, a short description and up to three small projects. It ends with a sign-off and a fan of photos. |
| ③ | **Projects** | `#projects` | Six project cards: Kenhold → People App → Master Data → Enterprise Design System → Apps Store → Vows. Each picture sits on a white mat over a soft cloud of orange and blue light, like a framed print. |
| ④ | **About** | `#about` | Who I am outside work. A short bio, "Tools I use?" written as a sentence with pills in it, and "Things I'm interested in". |
| ⑤ | **Contact** | `#contact` | One centred sentence with one italic word, then the footer card closes the page like an envelope, marked with the "dr" brand mark. |

A fixed side menu (desktop) or a small top pill (tablet and phone) always shows where you are on the page.

## Colors

### Signals
- **Brand orange** (`{colors.text-brand}` #ec5504): me, or a status. Used for "WSO2's", the CURRENT tag and the Say hi button text.
- **Secondary blue** (`{colors.text-secondary}` #006ee5): "you can go here" or "you are here". Used for highlighted links in the intro, section eyebrows and the active menu link. The fill version (`{colors.fill-secondary}` #1a87ff) draws the timeline line and the active dots.
- **Error red** (`{colors.text-error}` #e51a1a): used for one word only, "IIT".
- **Chart green** (`{colors.chart-level-0}` to `{colors.chart-level-4}`): only inside the contribution chart.

### Surfaces
- **Page** (`{colors.surface-page}` #fcf8f8): a warm off-white, like paper. Also the desktop menu panel.
- **Light** (`{colors.surface-light}` #ffffff): the project mat, the footer card and the pills.

### Text
- **P1** (`{colors.text-p1}` #151e28): the strongest text. Titles, pill labels.
- **P2** (`{colors.text-p2}` #253241): body text, and the darker key words inside muted paragraphs.
- **P3** (`{colors.text-p3}` #5c718a): muted body and menu links at rest.

### Lines
- **Outline main** (`{colors.outline-main}`): pill borders. **Outline light** (`{colors.outline-light}`): dividers, chart cell borders.
- **Timeline line** (`{colors.timeline-line}`): the grey dashed route, 0.5px.

**Hover, pressed, focus and visited colours are their own variables in Figma** (`…/hover`, `…/clicked`, `…/active`). Never darken or lighten a colour by hand.

### Contrast (decided: keep as is)
Body text passes WCAG AA easily (P2 is 12.4:1). Two highlight colours are below AA on the page colour: red "IIT" (4.4:1) and brand orange (3.4:1). They are kept on purpose, because they are short highlight words next to readable text. Don't use them for longer text.

## Typography

| Token | Font | Size / line height | Use |
|---|---|---|---|
| `{typography.title-one}` | Instrument Serif | 32 / 1.4, +0.5px | Section titles, the footer name |
| `{typography.title-accent}` | Instrument Serif Italic | 20 / 1.2 | The one accent word in the footer line ("hiii") |
| `{typography.heading-h1}` | SF Pro | 20 / 1.2 | Project card titles (510) |
| `{typography.heading-h2}` | SF Pro | 18 / 1.2 | The footer sentence |
| `{typography.text-p1}` | SF Compact Rounded | 16 / 1.3 | Menu links, the menu pill label, the hero eyebrow, organisation names (500) |
| `{typography.text-p2}` | SF Compact Rounded | 14 / 1.4 | **Default body**, buttons, pills |
| `{typography.text-p3}` | SF Compact Rounded | 12 / 1.4 | Chart labels, the legend, the tooltip |

Each of the three body sizes comes in 400, 500 and 600.

**Principles**
- **Hierarchy comes from colour and weight, not from big jumps in size.** The body is 14px. Making a word darker or bolder is the main tool.
- **The serif is my voice.** It's only for big titles and the one accent word.
- **SF Pro's 510 and 590 weights** become 500 and 600 on the web.
- Chart month labels never wrap.

## Layout

- **One column:** 600px wide and centred. The footer area is 750px. The About section sits in a full-width wrapper.
- **The gap between sections is always 96px.** Top padding: 128 (desktop), 120 (tablet), 96 (phone).
- **Rhythm:** a few spacing values do almost all the work: 8, 16, 24, 32. The full scale is in the tokens above.
- **The timeline breaks the column on purpose.** On tablet and desktop, the dates hang in the left margin, so the entry text lines up with the column.
- **Figma uses only padding and gap.** There are no spacer frames, so don't render empty divs.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | Nothing | Almost everything |
| Pill lift | `0 0 1px rgba(0,0,0,.08)` | Pills |
| Card lift | `0 1px 2px rgba(0,0,0,.12)` | Footer card |
| Framed print | White mat + soft orange/blue glow behind | Project pictures |
| Frosted | Translucent fill + `blur(12–16px)` | The menu pill and the open menu panel |

Depth is rare on purpose. If you want emphasis, use colour or weight first.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Chart tooltip |
| `{rounded.sm}` | 8px | Buttons, pills, the project-row hover box |
| `{rounded.card}` | 20px | Project card media |
| `{rounded.xl}` | 32px | Footer card |
| `{rounded.pill}` | 500px | The menu pill |
| — | 2px | Chart cells |

## Components

Every component has its own board in [03 Components](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=322-7512). All its states are variants on that board. Hover, Pressed, Focus and Visited are browser states, not options you pass in.

| Component | Figma set | What to know |
|---|---|---|
| **Brand mark** | [357:7331](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=357-7331) | The "dr" logo, with a black → brown → orange gradient. It's a logo, not text, so never recolour it. |
| **Menu** | [276:3868](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=276-3868) | Desktop: a fixed side panel with the brand mark on top. Tablet and phone: a frosted pill showing the current section, which opens a frosted panel with the links and contact rows. |
| **Menu link** | [347:9267](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=347-9267) | Muted at rest, dark on hover, blue when it's the section in view. |
| **Section header** | [92:2296](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=92-2296) | `Hero` is used once, at the top. `Section` has a blue eyebrow, a serif title, an optional line and divider. The hand-drawn underline is used only on Story. |
| **Pill** | [111:4625](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=111-4625) | Social pills are links: they lift 1px on hover. Tool pills in About are plain labels with no hover. |
| **Button** | [92:2148](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=92-2148) | Two styles only. *Primary light* (orange) is "Say hi". *Secondary* (blue) is "Resume". Only the colour changes on hover; nothing moves. |
| **Contribution chart** | [351:8638](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=351-8638) | Week columns of small green cells, a "Less → More" legend and one shared dark tooltip. Phone shows fewer weeks. |
| **Timeline entry · dot · project row** | [350:7686](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=350-7686) · [350:7563](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=350-7563) · [350:7582](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=350-7582) | Dots are Inactive, Active or Ping. On hover, a project row gets a soft box and its three thumbnails fan out. |
| **Project card** | [251:3651](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=251-3651) | Three glow styles (blue base, warm right, warm left). Neighbouring cards use different glows. On hover the image rises a little and the glow grows. |
| **Footer card** | [351:8691](https://www.figma.com/design/op5jPr3yqBUUTyi2CJGQI3/Portfolio-Rewamp?node-id=351-8691) | Desktop: side by side. Phone: stacked, with the mark and © at the bottom. |

**Icons:** use `lucide-react` when it has the icon. Use the monochrome SVGs from Figma when it doesn't (the brand mark, the plane, the X logo and tech logos). Icons are 14px and take the text colour.

## Motion

Motion has a job, or it doesn't happen. **Nothing bounces, flashes or spins.**

| Moment | Feel | Timing |
|---|---|---|
| Content appears for the first time | Fades in and rises 12px, children one after another. It never replays. | 500ms, 60ms stagger |
| Timeline progress | The blue line draws down as you scroll. A "you are here" dot rides at 60% of the screen height. Each stop pings once when the line reaches it. | Follows the scroll exactly, ping 600ms |
| Hover on a pill or project | A small lift or a gentle fan | 150–300ms |
| Menu opens / closes | Fades in, drops 8px and grows from 98% | 200ms open, 150ms close |
| The chart appears | Columns fill in from left to right | about 11ms per column |

Easing everywhere: `cubic-bezier(0.22, 1, 0.36, 1)`. With reduced motion, everything shows its final state: the line is fully drawn and every dot is lit.

## Do's and Don'ts

### Do
- Open the Figma node before building, every time.
- Use the variables for every colour, including hover and pressed.
- Keep the section order, and keep one column.
- Let the coloured key words do the highlighting. The rest of the paragraph stays muted.
- Keep the page flat. Use colour or weight for emphasis before adding a shadow.

### Don't
- Don't add a new colour, or use green outside the chart.
- Don't put orange or red on long text (contrast).
- Don't add motion that doesn't show progress, invite a click or welcome content.
- Don't build what V1 leaves out: the moodboard (it's hidden in Figma), dark mode, a blog, project detail pages, Discord, or the old Muted / Neutral / Filled buttons.

## Responsive Behavior

| Name | Width | What changes |
|---|---|---|
| Phone | < 600 | The column is the screen minus 32px. Top menu pill. Pills wrap. The chart shows 24 weeks. The timeline dates move inline and the rail sits on the left edge. About stacks. The footer card stacks. |
| Tablet | 600–1099 | The 600 column, centred. Top menu pill. |
| Desktop | ≥ 1100 | The 600 column, centred. Fixed side menu. |

**The content and its order never change between sizes.** Only the menu and a few layouts do. Between the three designed widths, everything scales with the column, with no extra breakpoints.

## Iteration Guide (for agents)

1. **One component at a time.** Open its board in 03 Components with the Figma MCP. Read the design context, the variables and the note cards, and look at the screenshot.
2. Use the tokens in this file only as a quick check. The numbers come from Figma.
3. Copy text word for word from the desktop frame (93:2106).
4. When a note card says what to do when content doesn't fit, do exactly that.
5. When you're done, compare your screenshot with the Figma frame at 390, 834 and 1440.