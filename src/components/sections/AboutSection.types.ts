import type { About } from "@/content/schema";

export interface AboutSectionProps {
  /** Defaults to the About copy in src/content/about.ts; the lab passes its own. */
  content?: About;
}
