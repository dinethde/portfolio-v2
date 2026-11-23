import type { TimelineDotProps } from "./TimelineDot.types";

// Figma 350:7563. Inactive is a grey ring. ProgressPath (a client component that wraps the
// timeline) sets data-active="true" on the circle when the line reaches it, and data-ping="true"
// once for the ripple, so those states are CSS and need no props. The circle carries
// data-timeline-dot so ProgressPath can find its centre.

const circle =
  "absolute inset-3 rounded-full border-[1.5px] border-solid border-fill-neutral-strong-active bg-surface-neutral-light-active transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none " +
  "data-[active=true]:border-fill-secondary-main-active data-[active=true]:bg-fill-secondary-main-active data-[active=true]:shadow-[0_0_8px_2px_var(--color-fill-secondary-light-active)] " +
  "before:pointer-events-none before:absolute before:-inset-8 before:rounded-full before:bg-fill-secondary-main-active before:opacity-0 before:content-[''] " +
  "data-[ping=true]:before:opacity-75 data-[ping=true]:before:animate-[ping_600ms_ease-out_1_forwards] motion-reduce:before:hidden";

export function TimelineDot({ className }: TimelineDotProps) {
  return (
    <span
      aria-hidden="true"
      className={["relative block size-14 shrink-0", className].filter(Boolean).join(" ")}
    >
      <span data-timeline-dot className={circle} />
    </span>
  );
}
