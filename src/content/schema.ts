import type { StaticImageData } from "next/image";
import { z } from "zod";

// The shapes of every word and picture on the page (TECH_SPEC §11, ARCHITECTURE §5). Each content
// module calls Schema.parse() on its data, so a typo or a missing field fails the build. Objects are
// strict: an unknown key is a typo, not extra data.

const Text = z.string().trim().min(1);

/** A link on this site (`/`, `#`), or https, mailto or tel. */
const Href = z.string().regex(/^(https:\/\/|mailto:|tel:|\/|#)/, "Use https, mailto, tel, / or #");

// ── Rich text ─────────────────────────────────────────────────────────

/** The colour signals in DESIGN.md "Colors". No tone means the paragraph's own colour. */
export const Tone = z.enum(["strong", "brand", "secondary", "error"]);
export type Tone = z.infer<typeof Tone>;

/** 400, 500 and 600 (DESIGN.md "Typography"). */
export const Weight = z.enum(["regular", "medium", "semibold"]);
export type Weight = z.infer<typeof Weight>;

/** A piece of text with one look. Rich text is a list of runs, never HTML. */
export const Run = z.strictObject({
  text: z.string().min(1),
  weight: Weight.optional(),
  tone: Tone.optional(),
});
export type Run = z.infer<typeof Run>;

export const RichParagraph = z.array(Run).min(1);
export type RichParagraph = z.infer<typeof RichParagraph>;

// ── Pictures ──────────────────────────────────────────────────────────

/** An image imported from src/assets/, so next/image knows its size at build time. */
export const Image = z.custom<StaticImageData>(
  (value) =>
    z
      .object({ src: z.string(), width: z.number().positive(), height: z.number().positive() })
      .safeParse(value).success,
  "Import the image from src/assets/ instead of writing a path",
);

/** An image and its alt text. Use an empty alt for pictures that only decorate. */
export const Picture = z.strictObject({ image: Image, alt: z.string() });
export type Picture = z.infer<typeof Picture>;

// ── Shared pieces ─────────────────────────────────────────────────────

/** The blue eyebrow, serif title and optional line of a section header (Figma 92:2296). */
export const SectionHeading = z.strictObject({
  eyebrow: Text,
  title: Text,
  description: Text.optional(),
});
export type SectionHeading = z.infer<typeof SectionHeading>;

// ── Site facts ────────────────────────────────────────────────────────

export const Site = z.strictObject({
  name: Text,
  title: Text,
  email: z.email(),
  phone: Text,
  resume: Href,
  github: z.strictObject({ handle: Text, href: Href }),
  twitter: z.strictObject({ handle: Text, href: Href, label: Text }),
  /** "TODO" until the URL is known (STATE.md O1). */
  linkedin: z.strictObject({ href: z.union([Href, z.literal("TODO")]) }),
});
export type Site = z.infer<typeof Site>;

/** The menu: one label per section anchor, in page order. */
export const Nav = z.array(z.strictObject({ id: Text, label: Text })).min(1);
export type Nav = z.infer<typeof Nav>;

// ── ① Intro ───────────────────────────────────────────────────────────

export const Intro = z.strictObject({
  greeting: Text,
  paragraphs: z.array(RichParagraph).min(1),
  cta: RichParagraph,
});
export type Intro = z.infer<typeof Intro>;

// ── ② Story ───────────────────────────────────────────────────────────

/** A small project under a timeline stop, with up to three thumbnails that fan out on hover. */
export const ProjectRow = z.strictObject({
  title: Text,
  description: Text,
  thumbs: z.array(Picture).min(1).max(3),
  href: Href.optional(),
});
export type ProjectRow = z.infer<typeof ProjectRow>;

export const TimelineEntry = z.strictObject({
  org: Text,
  logo: Picture,
  /** Shows the CURRENT tag. */
  current: z.boolean().default(false),
  role: Text,
  description: Text,
  /** "COLOMBO", "REMOTE". Some stops have no place or dates. */
  place: Text.optional(),
  period: Text.optional(),
  projects: z.array(ProjectRow).max(3),
});
export type TimelineEntry = z.infer<typeof TimelineEntry>;

export const Story = z.strictObject({
  header: SectionHeading,
  intro: z.strictObject({ title: Text, subtitle: Text }),
  entries: z.array(TimelineEntry).min(1),
  signOff: z.strictObject({ title: Text, subtitle: Text }),
  photos: z.array(Picture).min(1),
});
export type Story = z.infer<typeof Story>;

// ── ③ Projects ────────────────────────────────────────────────────────

/** The three glow styles on the project card board (Figma 251:3651). */
export const Glow = z.enum(["blue-base", "warm-right", "warm-left"]);
export type Glow = z.infer<typeof Glow>;

export const Project = z.strictObject({
  title: Text,
  description: Text,
  icon: Picture,
  image: Picture,
  glow: Glow,
  /** The small label at the top right of the card, like "FYP". */
  tag: Text.optional(),
  href: Href.optional(),
});
export type Project = z.infer<typeof Project>;

export const Projects = z
  .strictObject({ header: SectionHeading, items: z.array(Project).min(1) })
  .refine(
    (projects) =>
      projects.items.every((item, i) => i === 0 || item.glow !== projects.items[i - 1]?.glow),
    {
      message: "Neighbouring project cards need different glows (DESIGN.md Components)",
      path: ["items"],
    },
  );
export type Projects = z.infer<typeof Projects>;

// ── ④ About ───────────────────────────────────────────────────────────

/** "Tools I use?" written as a sentence with pills in it. */
export const ToolSentence = z
  .array(
    z.discriminatedUnion("kind", [
      z.strictObject({ kind: z.literal("text"), text: z.string().min(1) }),
      z.strictObject({ kind: z.literal("pill"), label: Text }),
    ]),
  )
  .refine(
    (parts) => parts.some((part) => part.kind === "pill"),
    "A tool sentence needs at least one pill",
  );
export type ToolSentence = z.infer<typeof ToolSentence>;

export const About = z.strictObject({
  header: SectionHeading,
  bio: z.array(RichParagraph).min(1),
  tools: z.strictObject({ title: Text, sentence: ToolSentence }),
  interests: z.strictObject({ title: Text, text: RichParagraph }),
  photos: z.array(Picture),
});
export type About = z.infer<typeof About>;

// ── ⑤ Contact ─────────────────────────────────────────────────────────

/** The centred sign-off line, with its one italic serif word. */
export const Contact = z.strictObject({
  line: z.strictObject({ before: z.string(), accent: Text, after: z.string() }),
});
export type Contact = z.infer<typeof Contact>;
