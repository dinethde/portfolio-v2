import { ProjectCard } from "@/components/project-card/ProjectCard";
import type { ProjectGlow } from "@/components/project-card/ProjectCard.types";

import { sampleLinks } from "../fixtures";

// Figma 251:3651: the three glow styles in Default and Hover. Hover is forced with
// data-force-state. The picture is a plain inline SVG, so no real artwork is needed.

export const title = "Project card";

const picture = {
  src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='544' height='380'><rect width='544' height='380' fill='white'/><rect x='24' y='24' width='200' height='16' fill='lightgray'/><rect x='24' y='64' width='496' height='120' fill='whitesmoke'/><rect x='24' y='208' width='240' height='148' fill='gainsboro'/></svg>",
  alt: "A sample project screenshot",
};

const glows: ProjectGlow[] = ["blue-base", "warm-right", "warm-left"];
const states = ["default", "hover"] as const;

export function Lab() {
  return (
    <div className="flex flex-col gap-32">
      {states.map((state) => (
        <div
          key={state}
          data-force-state={state === "default" ? undefined : state}
          className="flex flex-col gap-24"
        >
          {glows.map((glow) => (
            <ProjectCard
              key={glow}
              title="Enterprise Design System"
              tag="WSO2"
              description="A token-based design system for WSO2's internal apps, with light and dark themes."
              image={picture}
              glow={glow}
              href={sampleLinks.internal}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
