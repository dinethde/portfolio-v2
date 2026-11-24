import { StorySection } from "@/components/sections/StorySection";

// Figma 93:2106 (desktop) and 277:4760 (phone): the Story section with the real copy. Scroll to
// watch the line draw through the dots.

export const title = "Story section";

export function Lab() {
  return (
    <div className="max-w-600 pb-600">
      <StorySection />
    </div>
  );
}
