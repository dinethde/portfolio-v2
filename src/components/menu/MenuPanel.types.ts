import type { MenuContactRow } from "./MenuPill.types";
import type { SiteMenuLink } from "./SiteMenu.types";

export interface MenuPanelProps {
  id: string;
  links: SiteMenuLink[];
  contacts: MenuContactRow[];
  /** The id of the section in view. */
  active: string;
  /** Called when a link is chosen, so the pill can close the panel. */
  onNavigate?: () => void;
}
