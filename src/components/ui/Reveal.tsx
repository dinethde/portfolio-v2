"use client";

import { motion, useInView, useReducedMotion } from "motion/react";

import { use, useRef } from "react";

import { entrance } from "@/lib/motion";

import type { RevealProps } from "./Reveal.types";
import { InRevealGroup } from "./RevealGroup";

// Fades content in and lifts it 12px the first time it scrolls into view; it never replays
// (DESIGN.md "Motion"). Inside a RevealGroup it waits for the group and staggers with its siblings.
// With reduced motion it renders the plain element, and the motion-reduce classes cover the first
// paint, before React knows the preference.

const reducedFallback = "motion-reduce:opacity-100! motion-reduce:transform-none!";

export function Reveal({ children, as = "div", className }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inGroup = use(InRevealGroup);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Element = as;
    return <Element className={className}>{children}</Element>;
  }

  const MotionElement = motion[as];
  const classes = [reducedFallback, className].filter(Boolean).join(" ");
  if (inGroup) {
    return (
      <MotionElement className={classes} variants={entrance}>
        {children}
      </MotionElement>
    );
  }
  return (
    <MotionElement
      // biome-ignore lint/suspicious/noExplicitAny: motion types each tag's ref separately.
      ref={ref as any}
      className={classes}
      variants={entrance}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </MotionElement>
  );
}
