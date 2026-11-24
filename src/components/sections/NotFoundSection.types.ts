import type { NotFound } from "@/content/schema";

export interface NotFoundSectionProps {
  /** Defaults to the 404 copy in src/content/not-found.ts; the lab passes its own. */
  content?: NotFound;
}
