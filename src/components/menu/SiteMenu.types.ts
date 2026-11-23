import type { ReactNode } from "react";

export interface SiteMenuLink {
  /** The section id, without the `#`. */
  id: string;
  label: string;
}

export interface SiteMenuProps {
  /** The links, in page order. */
  links: SiteMenuLink[];
  /** The tablet and phone menu (P2-03). It sits beside the side panel and shows below `desktop:`. */
  phoneMenu?: ReactNode;
}
