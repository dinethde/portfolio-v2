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
            {icons ? (
              <span aria-hidden="true" className="flex items-end gap-4">
                {icons}
              </span>
            ) : null}
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
        // Figma's box is the rotated bounding box (92:2316), so the image is centred inside it.
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-14 top-110 flex h-61 w-313 items-center justify-center"
        >
          <Image
            src={underlineArt}
            alt=""
            unoptimized
            className="h-[35.49px] w-[310.784px] max-w-none flex-none rotate-[4.79deg]"
          />
        </div>
      ) : null}
    </header>
  );
}
