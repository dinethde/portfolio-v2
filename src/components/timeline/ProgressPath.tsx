"use client";

import { useRef } from "react";

import { useTimelineProgress } from "@/hooks/use-timeline-progress";

import type { ProgressPathProps } from "./ProgressPath.types";

// Draws the Story timeline's line behind its children (TECH_SPEC §6, Figma 277:4798): a grey dashed
// base through the plane and every dot, and a blue copy that draws down as you scroll, with a
// "you are here" marker at its tip. Under reduced motion the line is fully drawn and the marker is
// gone. The SVG is decorative; the timeline itself is the <ol> inside.

export function ProgressPath({ children, className }: ProgressPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { d, width, height, progress, marker } = useTimelineProgress(containerRef, pathRef);

  return (
    <div ref={containerRef} className={["relative", className].filter(Boolean).join(" ")}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={width}
        height={height}
      >
        <path
          d={d}
          fill="none"
          strokeWidth={1}
          strokeDasharray="3 3"
          className="stroke-timeline-default-line"
        />
        <path
          ref={pathRef}
          d={d}
          fill="none"
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          className="stroke-fill-secondary-main-active"
        />
        {marker && (
          <circle
            cx={marker.x}
            cy={marker.y}
            r={4}
            strokeWidth={2}
            className="fill-fill-secondary-main-active stroke-surface-neutral-light-active"
          />
        )}
      </svg>
      {children}
    </div>
  );
}
