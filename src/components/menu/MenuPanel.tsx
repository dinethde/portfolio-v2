import { MenuLink } from "./MenuLink";
import type { MenuPanelProps } from "./MenuPanel.types";

// Figma 276:3853. The frosted panel under the pill: the five page links, a divider and the contact
// rows. It is only mounted while open, so MenuPill owns the motion and the focus handling.

const row =
  "flex w-full items-center justify-between gap-16 rounded-4 whitespace-nowrap text-menu-meta-text transition-colors hover:text-menu-link-default focus-visible:focus-ring";

export function MenuPanel({ id, links, contacts, active, onNavigate }: MenuPanelProps) {
  return (
    <div
      id={id}
      className="flex w-full flex-col gap-16 rounded-16 bg-menu-panel-bg p-24 backdrop-blur-[16px]"
    >
      <ul className="flex flex-col gap-16">
        {links.map(({ id: linkId, label }) => (
          <li key={linkId} className="flex">
            <MenuLink id={linkId} label={label} active={active === linkId} onClick={onNavigate} />
          </li>
        ))}
      </ul>
      <hr className="h-px border-0 bg-menu-divider" />
      <ul className="flex flex-col gap-12 font-rounded text-p2">
        {contacts.map(({ label, value, href, external }) => (
          <li key={label} className="flex">
            <a
              href={href}
              className={row}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <span>{label}</span>
              <span>{value}</span>
              {external && <span className="sr-only">(opens in new tab)</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
