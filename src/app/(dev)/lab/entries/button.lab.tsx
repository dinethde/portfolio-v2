import { Button } from "@/components/ui/Button";
import type { ButtonVariant } from "@/components/ui/Button.types";

import { sampleLinks } from "../fixtures";

// Every Figma state of both styles (92:2148), one row per style.

export const title = "Button";

const variants: { variant: ButtonVariant; label: string }[] = [
  { variant: "primary-light", label: "Say hi" },
  { variant: "secondary", label: "Resume" },
];
const states = ["default", "hover", "pressed", "focus"] as const;

export function Lab() {
  return (
    <div className="flex flex-col gap-24">
      {variants.map(({ variant, label }) => (
        <div key={variant} className="flex flex-wrap gap-24">
          {states.map((state) => (
            <div
              key={state}
              data-force-state={state === "default" ? undefined : state}
              className="flex flex-col items-start gap-8"
            >
              <span className="text-p3 text-txt-neutral-p3-active">
                {variant} · {state}
              </span>
              <Button variant={variant} href={sampleLinks.internal}>
                {label}
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
