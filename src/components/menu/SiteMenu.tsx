"use client";

import { BrandMark } from "@/components/ui/BrandMark";
import { useActiveSection } from "@/hooks/use-active-section";

import { MenuLink } from "./MenuLink";
import type { SiteMenuProps } from "./SiteMenu.types";

// Figma 296:7564. The one place that calls useActiveSection, so the side panel and the phone
// pill always agree (ARCHITECTURE §6). The panel is fixed in the left margin at desktop: (1100px+).

export function SiteMenu({ links, phoneMenu }: SiteMenuProps) {
  const active = useActiveSection();

  return (
    <>
      <nav
        aria-label="Page sections"
        className="fixed top-80 left-32 hidden flex-col gap-20 rounded-12 bg-surface-page-active p-16 desktop:flex"
      >
        <BrandMark />
        <ul className="flex flex-col gap-16">
          {links.map(({ id, label }) => (
            <li key={id} className="flex">
              <MenuLink id={id} label={label} active={active === id} />
            </li>
          ))}
        </ul>
      </nav>
      {phoneMenu}
    </>
  );
}
