import { MenuPanel } from "@/components/menu/MenuPanel";
import { MenuPill } from "@/components/menu/MenuPill";
import type { MenuContactRow } from "@/components/menu/MenuPill.types";
import { nav } from "@/content/nav";
import { site } from "@/content/site";

// The tablet and phone menu (Figma 276:3868, open states 277:6320 and 277:7638). The pill is fixed
// to the viewport, so it sits in a transformed box that becomes its containing block. It is hidden
// from 1100px up, where the side menu takes over. Below the live pill is the open panel, static.

export const title = "Menu (tablet and phone)";

const contacts: MenuContactRow[] = [
  { label: "Send an email", value: site.email, href: `mailto:${site.email}` },
  { label: "X or Twitter", value: site.twitter.handle, href: site.twitter.href, external: true },
];

export function Lab() {
  return (
    <div className="flex flex-col gap-24">
      <div data-testid="menu-stage" className="relative h-420 transform-[translateZ(0)]">
        <MenuPill links={nav} contacts={contacts} />
      </div>
      <div className="max-w-358">
        <MenuPanel id="lab-menu-panel" links={nav} contacts={contacts} active="achievements" />
      </div>
      {nav.map(({ id, label }) => (
        <section key={id} id={id} className="h-120 text-p2 text-txt-neutral-p3-active">
          {label}
        </section>
      ))}
    </div>
  );
}
