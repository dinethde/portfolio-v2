import { About } from "./schema";

// ④ About (copy/desktop.md). The moodboard collage is hidden in Figma, so there are no photos.
export const about: About = About.parse({
  header: {
    eyebrow: "About",
    title: "The person behind the pixels",
    description:
      "I'm a product designer and full stack product engineer, doing my final year at IIT while building my own apps and products.",
  },
  bio: [
    [
      { text: "You already know my name (it's " },
      { text: "Dineth", weight: "medium" },
      {
        text: "). I'm a product designer and engineer from Sri Lanka, and I've never been able to pick just one. I care about how things look and feel, and I'm drawn to things with a bit of nostalgia in them: quiet, warm, and a little romantic.",
      },
    ],
    [
      {
        text: "I have two wonderful siblings, Aiya and Akka, and I would have achieved nothing without them. Most of my days start under a barbell. I lift six days a week, and I'm working toward my first powerlifting meet, just for the love of it. When I'm not lifting, you'll find me on a badminton court, out on a run, or watching UFC. Music means a lot to me too. One day I'd like to learn the saxophone, and maybe play a DJ set or two.",
      },
    ],
    [
      {
        text: "I'm also curious about how things work under the hood, so I spend late nights on WebAssembly, low-level code, and how trading systems move so fast. That curiosity follows me into my work. My terminal and Neovim setup are a project of their own, and almost everything I make starts as a rough sketch in Figma.",
      },
    ],
    [{ text: "I genuinely am a mosaic of everyone I’ve ever loved 💞", tone: "strong" }],
  ],
  tools: {
    title: "Tools I use?",
    sentence: [
      { kind: "text", text: "My main stack is " },
      { kind: "pill", label: "React" },
      { kind: "text", text: ", " },
      { kind: "pill", label: "TanStack Start" },
      { kind: "text", text: " with " },
      { kind: "pill", label: "TypeScript" },
      { kind: "text", text: ", backend in " },
      { kind: "pill", label: "Go" },
      { kind: "text", text: " or " },
      { kind: "pill", label: "Rust" },
      { kind: "text", text: ", data in " },
      { kind: "pill", label: "PostgreSQL" },
      { kind: "text", text: ", shipped with " },
      { kind: "pill", label: "Docker" },
      { kind: "text", text: " and designed in " },
      { kind: "pill", label: "Figma" },
      { kind: "text", text: ". For agentic and machine learning tasks, I use " },
      { kind: "pill", label: "Python" },
      { kind: "text", text: "." },
    ],
  },
  interests: {
    title: "Things I'm interested in",
    items: [
      "Agentic Software Engineering",
      "Fintech",
      "AI agents & Machine learning",
      "Low-level computing & WASM",
      "HFT",
    ],
  },
  photos: [],
});
