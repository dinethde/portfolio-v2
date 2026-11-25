import { Reveal } from "@/components/ui/Reveal";
import { RevealGroup } from "@/components/ui/RevealGroup";

import { sampleText } from "../fixtures";

// The entrance plays once when the block scrolls into view; reload to see it again. With reduced
// motion on, everything is already in place.

export const title = "Reveal";

const lines = [sampleText.short, sampleText.sentence, sampleText.long];

export function Lab() {
  return (
    <div className="flex flex-col gap-24">
      <Reveal className="text-p1 text-txt-neutral-p1-active">{sampleText.short}</Reveal>
      <RevealGroup as="ol" className="flex flex-col gap-8">
        {lines.map((line) => (
          <Reveal
            key={line}
            as="li"
            className="rounded-8 bg-surface-neutral-light-active p-12 text-txt-neutral-p2-active"
          >
            {line}
          </Reveal>
        ))}
      </RevealGroup>
    </div>
  );
}
