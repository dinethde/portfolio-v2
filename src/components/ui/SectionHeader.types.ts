import type { ReactNode } from "react";

export type SectionHeaderVariant = "hero" | "section";

export interface SectionHeaderProps {
  variant: SectionHeaderVariant;
  /** The line above the title: the hello line on the hero, the blue eyebrow on a section. */
  eyebrow: string;
  /** Use a line break to split the title over two lines. */
  title: string;
  description?: string;
  /** The grey line under the header (projects only). */
  divider?: boolean;
  /** The hand-drawn underline (Story only). */
  underline?: boolean;
  /** Hero only: the emoji beside the hello line. */
  icons?: ReactNode;
  className?: string;
}
