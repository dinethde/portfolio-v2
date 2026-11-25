import type { Story } from "@/content/schema";

export interface StorySectionProps {
  /** Defaults to the Story copy in src/content/timeline.ts; the lab passes its own. */
  content?: Story;
}
