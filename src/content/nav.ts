import { MenuContacts, Nav } from "./schema";
import { site } from "./site";

// The side menu, one label per section anchor, in page order (copy/desktop.md, DESIGN.md "The page flow").
export const nav: Nav = Nav.parse([
  { id: "achievements", label: "Achievements" },
  { id: "story", label: "Story so far" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
]);

// The contact rows in the tablet and phone menu panel, under the links (Figma 276:3847).
export const menuContacts: MenuContacts = MenuContacts.parse([
  { label: "Send an email", value: site.email, href: `mailto:${site.email}` },
  { label: "X or Twitter", value: site.twitter.handle, href: site.twitter.href, external: true },
]);
