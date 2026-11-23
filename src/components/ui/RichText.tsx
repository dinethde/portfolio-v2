import type { RichTextProps, RunTone, RunWeight } from "./RichText.types";

// Renders content runs as spans (TECH_SPEC §11, STATE D-36). A run with no tone inherits the
// paragraph's colour; a run with no weight inherits its weight.

const tones: Record<RunTone, string> = {
  strong: "text-txt-neutral-p2-active",
  brand: "text-txt-brand-p1-active",
  secondary: "text-txt-secondary-p1-active",
  error: "text-txt-error-p1-active",
};

const weights: Record<RunWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
};

export function RichText({ runs }: RichTextProps) {
  return (
    <>
      {runs.map((run, index) => {
        const classes = [
          run.tone ? tones[run.tone] : undefined,
          run.weight ? weights[run.weight] : undefined,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          // Runs are a fixed list from content, never reordered.
          // biome-ignore lint/suspicious/noArrayIndexKey: static list
          <span key={index} className={classes || undefined}>
            {run.text}
          </span>
        );
      })}
    </>
  );
}
