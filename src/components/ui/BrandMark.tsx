import Image from "next/image";

import brandMark from "@/assets/brand-mark.svg";

import type { BrandMarkProps } from "./BrandMark.types";

// The "dr" mark from Figma 357:7331 (DESIGN.md "Brand mark"). It is a logo, so its colour is never
// set from a token: the gradient stays raw inside the SVG asset (STATE D-43, D-17).

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <Image
      src={brandMark}
      alt="Dineth De Silva"
      width={36}
      height={40}
      unoptimized
      className={className}
    />
  );
}
