import type { ReactNode } from "react";

export interface ProgressPathProps {
  /** The timeline: a `data-timeline-start` element (the plane) and the entries with their dots. */
  children: ReactNode;
  className?: string;
}
