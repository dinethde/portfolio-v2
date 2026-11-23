import type { MenuContactRow } from "./MenuPill.types";

export interface SiteMenuLink {
  /** The section id, without the `#`. */
  id: string;
  label: string;
}

export interface SiteMenuProps {
  /** The links, in page order. */
  links: SiteMenuLink[];
  /** The contact rows in the tablet and phone panel. */
  contacts: MenuContactRow[];
}
