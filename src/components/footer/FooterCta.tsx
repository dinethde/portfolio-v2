import type { FooterCtaProps } from "./FooterCta.types";

// ⑤ Contact (DESIGN.md "The page flow"): one centred sentence with one italic serif word.

export function FooterCta({ line }: FooterCtaProps) {
  return (
    <p className="text-center font-sans text-h2 text-txt-neutral-p2-active">
      {line.before}
      <em className="font-serif text-title-accent text-txt-brand-p1-active italic">
        {line.accent}
      </em>
      {line.after}
    </p>
  );
}
