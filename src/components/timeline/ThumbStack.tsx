import Image from "next/image";

import type { ThumbStackProps } from "./ThumbStack.types";

// Figma 350:7582. Cards fan out when the parent `group/row` is hovered; the lab forces that with
// data-force-state on an ancestor. The 3px radius and the fan offsets are Figma's own numbers
// for this artwork (STATE D-50).

const card =
  "absolute overflow-hidden rounded-[3px] border-[1.5px] border-solid border-surface-neutral-light-active bg-fill-neutral-main-hover transition-[rotate,translate,scale] duration-300 ease-soft motion-reduce:transition-none";

const front =
  "left-[21px] top-2 h-44 w-30 bg-fill-neutral-strong-hover group-hover/row:scale-105 in-data-[force-state~=hover]:scale-105";
const backLeft =
  "left-[6px] top-[10px] h-36 w-26 -rotate-6 group-hover/row:-translate-x-[4px] group-hover/row:-rotate-12 in-data-[force-state~=hover]:-translate-x-[4px] in-data-[force-state~=hover]:-rotate-12";
const backRight =
  "left-[38px] top-[9px] h-36 w-26 rotate-6 group-hover/row:translate-x-[4px] group-hover/row:-translate-y-1 group-hover/row:rotate-12 in-data-[force-state~=hover]:translate-x-[4px] in-data-[force-state~=hover]:-translate-y-1 in-data-[force-state~=hover]:rotate-12";

export function ThumbStack({ thumbs, className }: ThumbStackProps) {
  const [first, second, third] = thumbs;
  // Paint order: back cards first, front card last.
  const cards = [
    { thumb: second, position: backLeft },
    { thumb: third, position: backRight },
    { thumb: first, position: front },
  ];

  return (
    <div className={["relative h-50 w-72 shrink-0", className].filter(Boolean).join(" ")}>
      {cards.map(({ thumb, position }) =>
        thumb === undefined ? null : (
          <div key={position} className={`${card} ${position}`}>
            <Image
              src={thumb.image}
              alt={thumb.alt}
              sizes="30px"
              className="size-full object-cover"
            />
          </div>
        ),
      )}
    </div>
  );
}
