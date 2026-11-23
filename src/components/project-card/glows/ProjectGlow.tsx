import Image from "next/image";

import blueBase1 from "@/assets/glows/blue-base-1.svg";
import blueBase2 from "@/assets/glows/blue-base-2.svg";
import top from "@/assets/glows/top.svg";
import warmLeft1 from "@/assets/glows/warm-left-1.svg";
import warmLeft2 from "@/assets/glows/warm-left-2.svg";
import warmRight1 from "@/assets/glows/warm-right-1.svg";
import warmRight2 from "@/assets/glows/warm-right-2.svg";

import type { ProjectGlow as GlowName } from "../ProjectCard.types";
import type { ProjectGlowProps } from "./ProjectGlow.types";

// Figma 251:3608: the "Gradient artwork" frame is 636x522 and sits 18px left of and 11px above the
// mat. It holds three blurred layers; each SVG carries its 150px blur margin, so the offsets below
// are the Figma layer position minus that margin (STATE D-17, D-50). It grows on card hover.

const layers: Record<GlowName, [typeof top, typeof blueBase1, typeof blueBase2]> = {
  "blue-base": [top, blueBase1, blueBase2],
  "warm-right": [top, warmRight1, warmRight2],
  "warm-left": [top, warmLeft1, warmLeft2],
};

const positions = [
  "left-[-235px] top-[-212px]",
  "left-[-253px] top-[-28px]",
  "left-[-178px] top-[72px]",
];

export function ProjectGlow({ glow }: ProjectGlowProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-11 flex justify-center"
    >
      <div className="relative h-522 w-636 shrink-0 transition-transform duration-300 ease-soft group-hover:scale-[1.04] motion-reduce:transition-none">
        {layers[glow].map((src, index) => (
          <Image
            key={positions[index]}
            src={src}
            alt=""
            unoptimized
            className={`absolute max-w-none ${positions[index]}`}
          />
        ))}
      </div>
    </div>
  );
}
