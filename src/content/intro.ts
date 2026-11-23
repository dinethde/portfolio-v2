import { Intro } from "./schema";

// ① Intro (copy/desktop.md). Highlighted words are runs with the tone and weight the design shows.
export const intro: Intro = Intro.parse({
  greeting: "Hi, I'm Dineth De Silva",
  paragraphs: [
    [
      { text: "I'm a creative " },
      { text: "product designer and product engineer", tone: "secondary", weight: "semibold" },
      {
        text: " who builds full-stack products from end to end. I do the user research, design the UI, plan the architecture, write the code, and keep it ",
      },
      { text: "running in production", tone: "strong", weight: "medium" },
      { text: ".", weight: "semibold" },
    ],
    [
      { text: "I spent a year as a Software Engineering intern on " },
      { text: "WSO2's", tone: "brand", weight: "semibold" },
      { text: " Internal Engineering team, building apps used across the " },
      { text: "whole company", tone: "strong", weight: "medium" },
      { text: ".", weight: "semibold" },
      {
        text: " These included the WSO2 People App, a central Master Data app, and the ",
      },
      { text: "design system", tone: "strong", weight: "medium" },
      { text: " ", tone: "strong" },
      { text: "that keeps them all consistent." },
    ],
    [
      { text: "Today I'm a " },
      { text: "final-year", tone: "strong", weight: "medium" },
      { text: " Computer Science student at " },
      { text: "IIT", tone: "error", weight: "medium" },
      { text: " and one of the " },
      { text: "top 10 open-source ", tone: "strong", weight: "semibold" },
      {
        text: "contributors in Sri Lanka. For my final-year project I'm building ",
      },
      { text: "Kenhold", tone: "secondary", weight: "semibold" },
      {
        text: ", an MCP server that gives AI coding agents the right company knowledge for each team and role.",
      },
    ],
  ],
  cta: [
    { text: "Got a project in mind? Let's bring it to life!", tone: "strong", weight: "medium" },
  ],
});
