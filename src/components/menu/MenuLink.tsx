import type { MenuLinkProps } from "./MenuLink.types";

// Figma 347:9267. Muted at rest, dark on hover, blue when it is the section in view.
// Focus is its own style here (Figma 347:9273): a 2px outline at the box edge, no gap.
// Hover and focus are CSS states, so the lab can force them with data-force-state.

const base =
  "inline-flex items-center justify-center rounded-4 px-4 font-rounded text-p1 whitespace-nowrap transition-colors focus-visible:text-menu-link-default focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-outline-secondary-main-active";

export function MenuLink({ id, label, active = false, className, ...props }: MenuLinkProps) {
  const tone = active
    ? "text-menu-link-active"
    : "text-menu-link-muted hover:text-menu-link-default";
  const classes = [base, tone, className].filter(Boolean).join(" ");

  return (
    <a {...props} href={`#${id}`} aria-current={active ? "true" : undefined} className={classes}>
      {label}
    </a>
  );
}
