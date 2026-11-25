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

// Percentages of the 636x522 artwork frame, so the glow scales with the mat.
const positions = [
  "left-[-36.95%] top-[-40.61%] h-[121.07%] w-[168.08%]",
  "left-[-39.78%] top-[-5.36%] h-[113.98%] w-[186.48%]",
  "left-[-27.99%] top-[13.83%] h-[136.1%] w-[159.12%]",
];

export function ProjectGlow({ glow }: ProjectGlowProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -z-10 -top-[2.2%] -left-[3%] h-[104.4%] w-[106%]"
    >
      <div className="size-full transition-transform duration-300 ease-soft group-hover:scale-[1.04] in-data-[force-state~=hover]:scale-[1.04] motion-reduce:transition-none">
        {/* Figma blurs the clipped frame as one piece (~22.5px), so the edge stays soft. */}
        <div className="size-full blur-[22.5px]">
          <div className="relative size-full overflow-hidden rounded-20">
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
      </div>
    </div>
  );
}
