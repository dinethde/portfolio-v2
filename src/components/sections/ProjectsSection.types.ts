import type { Projects } from "@/content/schema";

export interface ProjectsSectionProps {
  /** Defaults to the Projects copy in src/content/projects.ts; the lab passes its own. */
  content?: Projects;
}
