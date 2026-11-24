import { AboutSection } from "@/components/sections/AboutSection";

// Figma 93:2181 (desktop) and 277:4760 (phone): the About section with the real copy.

export const title = "About section";

export function Lab() {
  return (
    <div className="max-w-600">
      <AboutSection />
    </div>
  );
}
