import { BrandMark } from "@/components/ui/BrandMark";

// The brand mark (DESIGN.md "Brand mark", Figma 357:7331). It is a logo, so it is shown once, unchanged.

export const title = "Brand mark";

export function Lab() {
  return (
    <div className="flex flex-col items-start gap-16">
      <BrandMark />
    </div>
  );
}
