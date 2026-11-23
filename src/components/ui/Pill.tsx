import type { PillProps } from "./Pill.types";

// Figma 111:4625. Social pills are external links that lift 1px and darken their edge on hover;
// tool pills are plain spans. Hover and focus are CSS states (DESIGN.md "Pill").

const base =
  "inline-flex items-center gap-6 rounded-8 border-[1.5px] border-solid border-pill-modern-border bg-pill-modern-bg px-12 py-4 font-rounded text-p2 font-medium whitespace-nowrap text-pill-modern-text shadow-pill";

const interactive =
  "transition-[transform,border-color] duration-150 hover:-translate-y-1 hover:border-outline-neutral-main-hover focus-visible:focus-ring";

export function Pill({ icon, children, className, href }: PillProps) {
  const content = (
    <>
      {icon !== undefined && (
        <span aria-hidden="true" className="flex text-pill-modern-icon">
          {icon}
        </span>
      )}
      {children}
    </>
  );

  if (href !== undefined) {
    const classes = [base, interactive, className].filter(Boolean).join(" ");
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
        <span className="sr-only">(opens in new tab)</span>
      </a>
    );
  }
  return <span className={[base, className].filter(Boolean).join(" ")}>{content}</span>;
}
