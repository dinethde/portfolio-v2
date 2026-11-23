import Image from "next/image";

import heroLine from "@/assets/hero-line.svg";
import underlineArt from "@/assets/story-underline.svg";

import type { SectionHeaderProps } from "./SectionHeader.types";

// Figma 92:2296. Hero is used once at the top; Section opens every other section (DESIGN.md).

export function SectionHeader({
  variant,
  eyebrow,
  title,
  description,
  divider,
  underline,
  icons,
  className,
}: SectionHeaderProps) {
  const isHero = variant === "hero";
  const classes = ["relative flex flex-col gap-32", className].filter(Boolean).join(" ");

  return (
    <header className={classes}>
      <div className="flex flex-col gap-24">
        {isHero ? (
          <div className="flex items-center gap-20">
            <div className="flex flex-col gap-2">
              <p className="font-rounded text-p1 font-medium text-txt-neutral-p2-active">
                {eyebrow}
              </p>
              <Image src={heroLine} alt="" unoptimized aria-hidden="true" />
            </div>
            {icons ? <span aria-hidden="true">{icons}</span> : null}
          </div>
        ) : (
          <p className="font-rounded text-p2 text-section_header-default-eyebrow">{eyebrow}</p>
        )}
        <h2 className="whitespace-pre-line font-serif text-title-one text-txt-neutral-p1-active">
          {title}
        </h2>
      </div>
      {!isHero && description ? (
        <p className="font-rounded text-p2 text-txt-neutral-p2-active">{description}</p>
      ) : null}
      {divider ? <hr className="border-0 border-t border-section_header-default-divider" /> : null}
      {underline ? (
        <Image
          src={underlineArt}
          alt=""
          unoptimized
          aria-hidden="true"
          className="pointer-events-none absolute -left-14 top-110 max-w-none rotate-[4.79deg]"
        />
      ) : null}
    </header>
  );
}
