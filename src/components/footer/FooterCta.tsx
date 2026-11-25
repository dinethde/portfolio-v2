import type { FooterCtaProps } from "./FooterCta.types";

// ⑤ Contact (DESIGN.md "The page flow"): one centred sentence with one italic serif word.
// Figma pads it 40px all round; the lead sentence ends the first line from tablet up.

export function FooterCta({ line }: FooterCtaProps) {
  return (
    <p className="py-40 text-center font-sans text-h2 text-txt-neutral-p2-active">
      {line.lead ? (
        <>
          {line.lead}
          <br className="hidden tablet:block" />{" "}
        </>
      ) : null}
      {line.before}
      <em className="font-serif text-title-accent text-txt-brand-p2-active italic">
        {line.accent}
      </em>
      {line.after}
    </p>
  );
}
