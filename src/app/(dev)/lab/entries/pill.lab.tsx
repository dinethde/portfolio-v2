import { SocialIcon, TechIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/Pill";

import { sampleLinks } from "../fixtures";

// Figma 111:4625: the social pill in each state, then the tool pill.

export const title = "Pill";

const states = ["default", "hover", "focus"] as const;

export function Lab() {
  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-wrap gap-24">
        {states.map((state) => (
          <div
            key={state}
            data-force-state={state === "default" ? undefined : state}
            className="flex flex-col items-start gap-8"
          >
            <span className="text-p3 text-txt-neutral-p3-active">social · {state}</span>
            <Pill href={sampleLinks.external} icon={<SocialIcon name="github" />}>
              GitHub
            </Pill>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-start gap-8">
        <span className="text-p3 text-txt-neutral-p3-active">tool</span>
        <Pill icon={<TechIcon name="react" />}>React</Pill>
      </div>
    </div>
  );
}
