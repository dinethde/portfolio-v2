import { Nav } from "./schema";

// The side menu, one label per section anchor, in page order (copy/desktop.md, DESIGN.md "The page flow").
export const nav: Nav = Nav.parse([
  { id: "achievements", label: "Achievements" },
  { id: "story", label: "Story so far" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
]);
