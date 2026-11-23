"use client";

import { type PointerEvent, useState } from "react";

import type { ChartTooltipProps } from "./ContributionChart.types";

// The one shared dark tooltip (Figma 351:7602). The grid stays server-rendered: each cell carries
// a data-tip string and this wrapper finds it by event delegation. It is a pointer extra only;
// the grid's aria-label carries the information for everyone else.

interface Tip {
  text: string;
  left: number;
  top: number;
}

export function ChartTooltip({ children }: ChartTooltipProps) {
  const [tip, setTip] = useState<Tip | null>(null);

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-tip]");
    const text = cell?.dataset.tip;
    if (!cell || text === undefined) {
      setTip(null);
      return;
    }
    const box = cell.getBoundingClientRect();
    const frame = event.currentTarget.getBoundingClientRect();
    setTip({ text, left: box.left - frame.left + box.width / 2, top: box.top - frame.top });
  }

  return (
    <div className="relative" onPointerMove={onMove} onPointerLeave={() => setTip(null)}>
      {children}
      <div
        aria-hidden="true"
        style={tip ? { left: tip.left, top: tip.top - 8 } : undefined}
        className={`pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full rounded-4 bg-fill-neutral-dark-active px-8 py-4 font-rounded text-p3 font-medium whitespace-nowrap text-txt-white-p1-active transition-opacity duration-150 ease-soft motion-reduce:transition-none ${tip ? "opacity-100" : "opacity-0"}`}
      >
        {tip?.text}
      </div>
    </div>
  );
}
