import type { SiteMenuLink } from "./SiteMenu.types";

export interface MenuContactRow {
  label: string;
  value: string;
  href: string;
  /** Opens in a new tab, with the hidden "(opens in new tab)" text. */
  external?: boolean;
}

export interface MenuPillProps {
  /** The section links, in page order. */
  links: SiteMenuLink[];
  /** The contact rows under the divider. */
  contacts: MenuContactRow[];
}
