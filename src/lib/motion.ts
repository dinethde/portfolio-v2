import type { Variants } from "motion/react";

// Timing for every animation on the page (DESIGN.md "Motion"). Values are in seconds, as motion
// expects. The same curve is the `ease-soft` token in CSS.

export const ease = [0.22, 1, 0.36, 1] as const;

export const duration = {
  /** Hover on a pill, the menu closing. */
  fast: 0.15,
  /** The menu opening. */
  quick: 0.2,
  /** Hover lift on a project. */
  medium: 0.25,
  /** Hover fan on the photo stack. */
  slow: 0.3,
  /** Content appearing for the first time. */
  entrance: 0.5,
  /** A timeline dot turning on. */
  ping: 0.6,
} as const;

/** Delay between children of one entrance. */
export const stagger = 0.06;

/** The parent of a staggered entrance. */
export const entranceGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
};

/** Fade in and rise 12px. Shown once; it never replays. */
export const entrance: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.entrance, ease } },
};
