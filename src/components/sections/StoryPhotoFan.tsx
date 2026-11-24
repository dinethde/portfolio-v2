import Image from "next/image";

import type { StoryPhotoFanProps } from "./StoryPhotoFan.types";

// The fan of snapshots at the end of the story (Figma 145:5235). Each card is where its top left
// sits in the 114px by 54px stack, with its tilt, from the rightmost card (at the back) to the
// leftmost (on top).
const fan = [
  { left: 99, top: 6, tilt: "rotate-8" },
  { left: 74, top: 3, tilt: "rotate-4" },
  { left: 51, top: 2, tilt: "" },
  { left: 29, top: 3, tilt: "-rotate-4" },
  { left: 3, top: 5, tilt: "-rotate-8" },
] as const;

export function StoryPhotoFan({ photos }: StoryPhotoFanProps) {
  return (
    <div aria-hidden="true" className="relative h-54 w-114 shrink-0">
      {fan.map((slot, index) => {
        const photo = photos[index];
        if (!photo) return null;
        return (
          <Image
            key={slot.left}
            src={photo.image}
            alt=""
            sizes="32px"
            style={{ left: slot.left, top: slot.top }}
            className={`absolute h-48 w-32 rounded-4 border-[1.5px] border-solid border-surface-neutral-light-active object-cover shadow-card ${slot.tilt}`}
          />
        );
      })}
    </div>
  );
}
