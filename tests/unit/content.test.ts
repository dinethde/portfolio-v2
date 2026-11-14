import { describe, expect, it } from "vitest";

import { Image, Projects, Run, Site, TimelineEntry, ToolSentence } from "@/content/schema";

// Every content module validates itself with Schema.parse() when it's imported, so a typo fails the
// build. Importing each one here is the check; a new content file is picked up without editing this.
const modules = import.meta.glob(["../../src/content/*.ts", "!../../src/content/schema.ts"]);

describe("content modules", () => {
  it("finds the content files", () => {
    expect(Object.keys(modules).length).toBeGreaterThan(0);
  });

  for (const [path, load] of Object.entries(modules)) {
    it(`${path.split("/").pop()} parses and exports its content`, async () => {
      const module = (await load()) as Record<string, unknown>;
      expect(Object.keys(module).length).toBeGreaterThan(0);
    });
  }
});

const image = { src: "/a.png", width: 10, height: 10 };
const picture = { image, alt: "" };

describe("Run", () => {
  it("accepts plain text and the design's tones and weights", () => {
    expect(Run.parse({ text: "WSO2's", tone: "brand", weight: "medium" })).toEqual({
      text: "WSO2's",
      tone: "brand",
      weight: "medium",
    });
  });

  it("rejects a tone the design doesn't have, and stray keys like html", () => {
    expect(Run.safeParse({ text: "a", tone: "green" }).success).toBe(false);
    expect(Run.safeParse({ text: "a", html: "<b>a</b>" }).success).toBe(false);
  });
});

describe("Image", () => {
  it("needs an imported image, so its size is known at build time", () => {
    expect(Image.safeParse(image).success).toBe(true);
    expect(Image.safeParse("/a.png").success).toBe(false);
  });
});

describe("Site", () => {
  const site = {
    name: "Dineth De Silva",
    title: "Artistic Designer & Software Engineer",
    email: "dev.dinethde@gmail.com",
    phone: "+94 70 324 2772",
    resume: "/resume.pdf",
    github: { handle: "dinethde", href: "https://github.com/dinethde" },
    twitter: { handle: "@dinethr_de", href: "https://x.com/dinethr_de", label: "Twitter" },
    linkedin: { href: "TODO" },
  };

  it("lets LinkedIn stay TODO until the URL is known", () => {
    expect(Site.safeParse(site).success).toBe(true);
  });

  it("rejects a link that isn't https, mailto, tel or on this site", () => {
    expect(
      Site.safeParse({ ...site, github: { handle: "x", href: "javascript:alert(1)" } }).success,
    ).toBe(false);
  });
});

describe("TimelineEntry", () => {
  const row = { title: "Kenhold", description: "An MCP server.", thumbs: [picture] };
  const entry = {
    org: "IIT",
    role: "BSc (Hons) Computer Science · Final Year",
    description: "Started BSc Computer Science from foundation",
    logo: picture,
    projects: [row],
  };

  it("allows an entry without a place or dates, like Open Source", () => {
    expect(TimelineEntry.parse(entry).current).toBe(false);
  });

  it("allows at most three project rows and three thumbnails each", () => {
    expect(TimelineEntry.safeParse({ ...entry, projects: [row, row, row, row] }).success).toBe(
      false,
    );
    expect(
      TimelineEntry.safeParse({
        ...entry,
        projects: [{ ...row, thumbs: [picture, picture, picture, picture] }],
      }).success,
    ).toBe(false);
  });
});

describe("Projects", () => {
  const card = (glow: string) => ({
    title: "Kenhold - Research Project",
    description: "My final-year research project.",
    icon: picture,
    image: { image, alt: "A graph of how the company is organised" },
    glow,
  });
  const header = { eyebrow: "Projects", title: "Things I've built" };

  it("needs neighbouring cards to use different glows", () => {
    expect(
      Projects.safeParse({ header, items: [card("blue-base"), card("warm-right")] }).success,
    ).toBe(true);
    expect(
      Projects.safeParse({ header, items: [card("warm-left"), card("warm-left")] }).success,
    ).toBe(false);
  });
});

describe("ToolSentence", () => {
  it("mixes words and pills, and needs at least one pill", () => {
    expect(
      ToolSentence.safeParse([
        { kind: "text", text: "I build with " },
        { kind: "pill", label: "React" },
      ]).success,
    ).toBe(true);
    expect(ToolSentence.safeParse([{ kind: "text", text: "Nothing" }]).success).toBe(false);
  });
});
