import type { ProjectRowProps } from "./ProjectRow.types";
import type { ThumbImage } from "./ThumbStack.types";

export interface TimelineEntryProps {
  org: string;
  logo: ThumbImage;
  /** Shows the CURRENT tag. */
  current?: boolean;
  /** Label for the tag. Comes from the section's content. */
  currentLabel?: string;
  jobTitle: string;
  description: string;
  /** "COLOMBO", "REMOTE". */
  place?: string;
  period?: string;
  projects: Omit<ProjectRowProps, "className">[];
  className?: string;
}
