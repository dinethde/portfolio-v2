import { IntroSection } from "@/components/sections/IntroSection";

import { sampleContributions } from "../fixtures";

// Figma 93:2106 (desktop) and 277:4760 (phone): the Intro section with the real copy.

export const title = "Intro section";

export function Lab() {
  return (
    <div className="max-w-600">
      <IntroSection contributions={sampleContributions} />
    </div>
  );
}
