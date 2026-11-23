import appsStoreImage from "@/assets/projects/apps-store.png";
import designSystemImage from "@/assets/projects/design-system.png";
import kenholdImage from "@/assets/projects/kenhold.jpg";
import masterDataImage from "@/assets/projects/master-data.jpg";
import peopleAppImage from "@/assets/projects/people-app.jpg";
import vowsImage from "@/assets/projects/vows.jpg";

import { Projects } from "./schema";

// ③ Projects (copy/desktop.md). Neighbouring cards use different glows (DESIGN.md Components).
// Apps Store is warm-left, not warm-right, so it doesn't clash with the Design System card before it.
export const projects: Projects = Projects.parse({
  header: {
    eyebrow: "Selected Work",
    title: "Things I've designed, built and shipped",
    description: "Fun things I'm working on when it's not client work.",
  },
  items: [
    {
      title: "Kenhold - Research Project",
      description:
        "My final-year research project. An MCP server that gives AI coding agents the right company knowledge for each team and role, based on how the company is organised.",
      image: { image: kenholdImage, alt: "" },
      glow: "warm-left",
      tag: "FYP",
    },
    {
      title: "People App",
      description:
        "An internal HR app at WSO2 that runs onboarding and offboarding in one place, from sending offers and employee letters to tracking contracts.",
      image: { image: peopleAppImage, alt: "" },
      glow: "blue-base",
      tag: "WSO2",
    },
    {
      title: "Master Data",
      description:
        "The org-structure tool inside the People App. It maps WSO2's business units, teams, sub-teams and units side by side, with each group's leads and headcount.",
      image: { image: masterDataImage, alt: "" },
      glow: "warm-left",
      tag: "WSO2",
    },
    {
      title: "Enterprise Design System",
      description:
        "A token-based design system for WSO2's internal apps, with light and dark themes. It gives every internal tool the same colors, type and components.",
      image: { image: designSystemImage, alt: "" },
      glow: "warm-right",
      tag: "WSO2",
    },
    {
      title: "Apps Store",
      description:
        "An open-source catalog where a company can find, manage and launch all its internal web apps from one dashboard. Built with a fully tokenised design system.",
      image: { image: appsStoreImage, alt: "" },
      glow: "warm-left",
      tag: "Open source",
    },
    {
      title: "Vows",
      description:
        "Website and CMS for Vows Weddings, a wedding photography studio in Colombo. An infinite-scroll photo gallery, with every album managed through the CMS.",
      image: { image: vowsImage, alt: "" },
      glow: "blue-base",
      tag: "Client",
    },
  ],
});
