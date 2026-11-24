import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";

import type { FooterCardProps, FooterLink } from "./FooterCard.types";

// Figma 351:8691. Desktop and tablet put the mark and © on the left; phones stack everything with
// the mark and © last. Off-scale gaps (100, 44) are Figma's own numbers for this card (STATE D-50).

const linkClasses =
  "rounded-4 font-rounded text-p2 text-txt-neutral-p2-active transition-colors hover:text-txt-secondary-p1-active focus-visible:focus-ring";

function isExternal(href: string) {
  return href.startsWith("http");
}

function FooterColumnLink({ label, href }: FooterLink) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClasses}>
        {label}
        <span className="sr-only">(opens in new tab)</span>
      </a>
    );
  }
  return (
    <a href={href} className={linkClasses}>
      {label}
    </a>
  );
}

export function FooterCard({ name, primaryAction, secondaryAction, columns }: FooterCardProps) {
  const year = new Date().getFullYear();
  const visibleColumns = columns
    .map((column) => column.filter((link) => link.href !== "TODO"))
    .filter((column) => column.length > 0);

  return (
    <footer className="flex w-full max-w-750 flex-col gap-32 rounded-32 bg-footer_card-default-bg p-24 shadow-card tablet:flex-row tablet:gap-100 tablet:p-32">
      <div className="order-last flex items-center justify-between tablet:order-first tablet:shrink-0 tablet:flex-col tablet:items-start">
        <BrandMark />
        <p className="whitespace-nowrap font-rounded text-p2 text-txt-neutral-p2-active">
          © {year} {name}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-44 pb-32 tablet:flex-none tablet:shrink-0">
        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:gap-40">
          <p className="font-serif text-title-one text-txt-neutral-p2-active">{name}</p>
          <div className="flex justify-between tablet:justify-start tablet:gap-12">
            <Button variant="primary-light" href={primaryAction.href}>
              {primaryAction.label}
            </Button>
            <Button variant="secondary" href={secondaryAction.href}>
              {secondaryAction.label}
            </Button>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap justify-between gap-y-24">
          {visibleColumns.map((column) => (
            <ul key={column[0]?.label} className="flex flex-col gap-12">
              {column.map((link) => (
                <li key={link.label} className="flex">
                  <FooterColumnLink {...link} />
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </div>
    </footer>
  );
}
