# Copy: Desktop 1440 (Figma 93:2106)

Every visible word of the desktop frame, in page order, exported once (STATE.md D-23). Copy it word for word.

**Rich text:** a run with its own look is written `[tone/weight: text]`. Tones: `strong` (text/neutral/p2, the darker key words), `brand`, `secondary`, `error`. Weights: `medium` (500), `semibold` (600). Text outside brackets uses the paragraph's own colour. Spaces at the edges of a run are part of it.

**Hidden in Figma (not on the page):** the Moodboard collage under About (93:2213) and a second footer line (93:2332). They aren't listed here.

---

## Menu (desktop side panel, 296:7565)

Brand mark "dr", then the page links:

- Achievements
- Story so far
- Projects
- About
- Contact

---

## ① Intro (`#achievements`, 93:2110)

**Hero header**

- Greeting: Hi, I'm Dineth De Silva
- Emoji after the greeting: ✌🏻 👀
- Title (serif, two lines): Artistic Designer & / Software Engineer

**Paragraphs** (paragraph colour: text/neutral/p3)

1. I'm a creative [secondary/semibold: product designer and product engineer] who builds full-stack products from end to end. I do the user research, design the UI, plan the architecture, write the code, and keep it [strong/medium: running in production][semibold: .]
2. I spent a year as a Software Engineering intern on [brand/semibold: WSO2's] Internal Engineering team, building apps used across the [strong/medium: whole company][semibold: .] These included the WSO2 People App, a central Master Data app, and the [strong/medium: design system][strong:  ]that keeps them all consistent.
3. Today I'm a [strong/medium: final-year] Computer Science student at [error/medium: IIT] and one of the [strong/semibold: top 10 open-source ]contributors in Sri Lanka. For my final-year project I'm building [secondary/semibold: Kenhold], an MCP server that gives AI coding agents the right company knowledge for each team and role.

(In Figma the "r" of "final-year" is a separate span in regular weight; it reads as one word, so it's one run here.)

**Call to action** (text/neutral/p2, medium): Got a project in mind? Let's bring it to life!

**Social pills:** Twitter · GitHub · Resume · LinkedIn

**Contribution chart**

- Title: My Contribution to the Tech and Designs
- Header: 1,599 contributions in 2026 (sample number; the real one comes from GitHub, TECH_SPEC §3)
- Month labels: Nov Dec Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov
- Legend: Less … More

---

## ② Story (`#story`, 93:2126)

**Section header**

- Eyebrow: Timeline
- Title (two lines): My Journey in / Design & Engineering
- Hand-drawn underline under the title (`src/assets/story-underline.svg`)

**Intro**

- Plane label: Flight plan
- Title: Computer Science Student & Design Engineer
- Subtitle: Building thoughtful software with an engineering mindset, obsessing over the details and the why behind great products.

**Entries** (place · dates on the left; logo, organisation, tag, role, description; then project rows)

1. COLOMBO · 2026 — **IIT** · CURRENT
   - Role: BSc (Hons) Computer Science · Final Year
   - Description: Started BSc Computer Science from foundation
   - Project: **Kenhold** — An MCP server that gives AI coding agents the right company knowledge for each team and role. Still in the research phase.
2. COLOMBO · 2025 - 2026 — **WSO2**
   - Role: Software Engineer Intern · Internal Engineering
   - Description: Worked with the Internal Engineering team, building and shipping tools used across the company.
   - Project: **Company-wide internal apps** — Built a few technically heavy apps used across the whole company.
3. (no place or dates) — **Open Source**
   - Role: Open-Source Contributor
   - Description: Contributed to open-source projects and ranked among the top 10 open-source contributors in Sri Lanka.
   - Project: **apps-store** — Open-source enterprise app catalog
4. REMOTE · 2022 - 2024 — **Freelancing**
   - Role: Designer & Developer · Enthusiastic Studio
   - Description: Designed and built websites and web apps for small businesses, taking each one from the first sketch to launch.
   - Project: **Kithulgoda Travels** — Website for a travel and tour company
   - Project: **Vows** — Website and CMS for a wedding photography studio in Colombo
5. COLOMBO · 2022 — **IIT**
   - Role: Started BSc Computer Science from foundation
   - Description: Started computer science foundation in IIT.
   - Project: **POS SYSTEM** — An early project worth showing
6. COLOMBO · 2022 — **IJSE**
   - Role: CMJD program
   - Description: Completed comprehensive master java developer program in IJSE
   - Project: **POS SYSTEM** — An early project worth showing

**Sign-off**

- That's the story so far. Thanks for reading.
- A few snapshots from the journey.

**Assets for this section:** logos `src/assets/timeline/logo-{iit,wso2,open-source,freelancing,ijse}`; thumbnails `kenhold-1..3`, `wso2-apps-1..3`, `apps-store-1..3`, `kithulgoda-1..3`, `vows-1` (used three times), `pos-1..3` (IIT 2022), `pos-3, pos-4, pos-1` (IJSE); snapshots `src/assets/story/snapshot-1..3` (snapshot-3 is used three times in Figma).

---

## ③ Projects (`#projects`, 93:2166)

**Section header**

- Eyebrow: Selected Work
- Title: Things I've designed, built and shipped
- Description: Fun things I'm working on when it's not client work.
- Divider under the header

**Cards** (title · label · glow · description · image)

1. **Kenhold - Research Project** · FYP · Warm left — My final-year research project. An MCP server that gives AI coding agents the right company knowledge for each team and role, based on how the company is organised. (`projects/kenhold.jpg`)
2. **People App** · WSO2 · Blue base — An internal HR app at WSO2 that runs onboarding and offboarding in one place, from sending offers and employee letters to tracking contracts. (`projects/people-app.jpg`)
3. **Master Data** · WSO2 · Warm left — The org-structure tool inside the People App. It maps WSO2's business units, teams, sub-teams and units side by side, with each group's leads and headcount. (`projects/master-data.jpg`)
4. **Enterprise Design System** · WSO2 · Warm right — A token-based design system for WSO2's internal apps, with light and dark themes. It gives every internal tool the same colors, type and components. (`projects/design-system.png`)
5. **Apps Store** · Open source · Warm right — An open-source catalog where a company can find, manage and launch all its internal web apps from one dashboard. Built with a fully tokenised design system. (`projects/apps-store.png`)
6. **Vows** · Client · Blue base — Website and CMS for Vows Weddings, a wedding photography studio in Colombo. An infinite-scroll photo gallery, with every album managed through the CMS. (`projects/vows.jpg`)

Cards 4 and 5 both use Warm right in Figma, though the card's note says neighbours should differ (STATE.md Open).

---

## ④ About (`#about`, 93:2181)

**Section header**

- Eyebrow: About
- Title: The person behind the pixels
- Description: I'm a product designer and full stack product engineer, doing my final year at IIT while building my own apps and products.

**Bio** (paragraph colour: text/neutral/p3)

1. You already know my name (it's [medium: Dineth]). I'm a product designer and engineer from Sri Lanka, and I've never been able to pick just one. I care about how things look and feel, and I'm drawn to things with a bit of nostalgia in them: quiet, warm, and a little romantic.
2. I have two wonderful siblings, Aiya and Akka, and I would have achieved nothing without them. Most of my days start under a barbell. I lift six days a week, and I'm working toward my first powerlifting meet, just for the love of it. When I'm not lifting, you'll find me on a badminton court, out on a run, or watching UFC. Music means a lot to me too. One day I'd like to learn the saxophone, and maybe play a DJ set or two.
3. I'm also curious about how things work under the hood, so I spend late nights on WebAssembly, low-level code, and how trading systems move so fast. That curiosity follows me into my work. My terminal and Neovim setup are a project of their own, and almost everything I make starts as a rough sketch in Figma.
4. [strong: I genuinely am a mosaic of everyone I’ve ever loved 💞]

**Tools I use?**

My main stack is [pill React], [pill TanStack Start] with [pill TypeScript], backend in [pill Go] or [pill Rust], data in [pill PostgreSQL], shipped with [pill Docker] and designed in [pill Figma]. For agentic and machine learning tasks, I use [pill Python].

Pill icons: `src/assets/icons/tech/{react,tanstack,typescript,go,rust,postgresql,docker,figma,python}.svg`.

**Things I'm interested in** (a bulleted list)

- Agentic Software Engineering
- Fintech
- AI agents & Machine learning
- Low-level computing & WASM
- HFT

---

## ⑤ Contact (`#contact`, 165:3032 and 351:8753)

**Sign-off line** (centred, SF Pro 18, text/neutral/p2; the accent is Instrument Serif Italic 20 in text/brand/p2)

I design what I build down to the last pixel, and engineer it to the last semicolon.
If something here sparked an idea or a question, come say [accent: hiii][medium: .]

(The line break after "semicolon." is in Figma.)

**Footer card**

- Left: brand mark "dr", then © 2026 Dineth De Silva
- Name (serif): Dineth De Silva
- Buttons: Say hi (primary light) · Resume (secondary)
- Link column 1: Achievements · Story so far · Projects · About
- Link column 2: X (Twitter) · GitHub · LinkedIn · Figma
- Link column 3: Email · Mobile
