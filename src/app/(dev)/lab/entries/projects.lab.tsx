import { ProjectsSection } from "@/components/sections/ProjectsSection";

// Figma 93:2166 (desktop): the Projects section with the real copy and six cards.

export const title = "Projects section";

export function Lab() {
  return (
    <div className="max-w-600">
      <ProjectsSection />
    </div>
  );
}
