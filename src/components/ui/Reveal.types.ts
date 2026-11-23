import type { ReactNode } from "react";

/** The elements an entrance can render as, so lists keep their `<ol>` and `<li>`. */
export type RevealElement = "div" | "section" | "ol" | "ul" | "li";

export interface RevealProps {
  children: ReactNode;
  as?: RevealElement;
  className?: string;
}
