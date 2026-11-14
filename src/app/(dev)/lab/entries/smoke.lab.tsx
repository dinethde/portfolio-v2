import { sampleText } from "../fixtures";

// Proves the lab works: an entry is found without a registry, and data-force-state shows every
// state at once. Copy a real entry from this one.

export const title = "Lab smoke test";

const states = ["default", "hover", "focus", "pressed"] as const;

export function Lab() {
  return (
    <div className="flex flex-wrap gap-16">
      {states.map((state) => (
        <div
          key={state}
          data-force-state={state === "default" ? undefined : state}
          className="flex flex-col gap-8"
        >
          <span className="text-p3 text-txt-neutral-p3-active">{state}</span>
          <a
            href="#lab-smoke"
            className="rounded-8 border border-outline-neutral-light-active bg-surface-neutral-light-active px-12 py-8 text-txt-neutral-p1-active hover:border-outline-neutral-light-hover hover:bg-surface-neutral-light-hover focus-visible:outline-2 focus-visible:outline-outline-secondary-main-active focus-visible:outline-offset-2 active:bg-surface-neutral-light-clicked"
          >
            {sampleText.short}
          </a>
        </div>
      ))}
    </div>
  );
}
