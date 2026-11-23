"use client";

import { motion, useInView, useReducedMotion } from "motion/react";

import { createContext, useRef, useSyncExternalStore } from "react";

import { entranceGroup } from "@/lib/motion";

import type { RevealGroupProps } from "./RevealGroup.types";

// Plays its Reveal children once, 60ms apart, when 15% of the group is in view (TECH_SPEC §6).
// The children read this context and follow the group instead of watching the viewport themselves.

export const InRevealGroup = createContext(false);

const noSubscribe = () => () => {};

export function RevealGroup({ children, as = "div", className }: RevealGroupProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  // The server can't know the preference, so honour it only after hydration; the first client render
  // must match the server HTML.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const reduceMotion = useReducedMotion() && hydrated;

  if (reduceMotion) {
    const Element = as;
    return <Element className={className}>{children}</Element>;
  }

  const MotionElement = motion[as];
  return (
    <InRevealGroup value={true}>
      <MotionElement
        // biome-ignore lint/suspicious/noExplicitAny: motion types each tag's ref separately.
        ref={ref as any}
        className={className}
        variants={entranceGroup}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {children}
      </MotionElement>
    </InRevealGroup>
  );
}
