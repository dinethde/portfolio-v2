import { useReducedMotion } from "motion/react";

import { type RefObject, useEffect, useState } from "react";

// The Story timeline's progress line (TECH_SPEC §6). The geometry and the maths are pure functions
// so they can be tested; the hook only measures the DOM and follows the scroll.
//
// The path starts at the element marked `data-timeline-start` (the plane), curves to the first
// `data-timeline-dot`, then runs straight down through the others. Dots get `data-active` once the
// line passes them, and `data-ping` the moment they turn on.

export interface Point {
  x: number;
  y: number;
}

/** Where the "you are here" marker rides, as a share of the viewport height. */
export const MARKER_VIEWPORT_SHARE = 0.6;

const CURVE_SAMPLES = 32;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** progress = clamp((0.6 × innerHeight − pathTop) / pathHeight, 0, 1). */
export function timelineProgress(
  viewportHeight: number,
  pathTop: number,
  pathHeight: number,
): number {
  if (pathHeight <= 0) return 0;
  return clamp((MARKER_VIEWPORT_SHARE * viewportHeight - pathTop) / pathHeight, 0, 1);
}

function curveControls(from: Point, to: Point): [Point, Point] {
  const midY = (from.y + to.y) / 2;
  return [
    { x: from.x, y: midY },
    { x: to.x, y: midY },
  ];
}

function curvePoint(from: Point, c1: Point, c2: Point, to: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
    y: u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y,
  };
}

/** The first leg curves (the plane sits off the rail); the rest are straight. */
export function buildPath(points: Point[]): string {
  const [first, ...rest] = points;
  if (!first) return "";
  let d = `M ${first.x} ${first.y}`;
  let previous = first;
  rest.forEach((point, index) => {
    if (index === 0 && point.x !== previous.x) {
      const [c1, c2] = curveControls(previous, point);
      d += ` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${point.x} ${point.y}`;
    } else {
      d += ` L ${point.x} ${point.y}`;
    }
    previous = point;
  });
  return d;
}

/** The length along the path to each point, matching buildPath's shape. */
export function lengthsAlong(points: Point[]): number[] {
  const lengths: number[] = [];
  let total = 0;
  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (previous && index === 1 && point.x !== previous.x) {
      const [c1, c2] = curveControls(previous, point);
      let last = previous;
      for (let step = 1; step <= CURVE_SAMPLES; step++) {
        const next = curvePoint(previous, c1, c2, point, step / CURVE_SAMPLES);
        total += Math.hypot(next.x - last.x, next.y - last.y);
        last = next;
      }
    } else if (previous) {
      total += Math.hypot(point.x - previous.x, point.y - previous.y);
    }
    lengths.push(total);
  });
  return lengths;
}

/** How far along the path each point sits, from 0 (the start) to 1 (the last stop). */
export function stopThresholds(points: Point[]): number[] {
  const lengths = lengthsAlong(points);
  const total = lengths.at(-1) ?? 0;
  return lengths.map((length) => (total > 0 ? length / total : 0));
}

export interface TimelineState {
  d: string;
  width: number;
  height: number;
  progress: number;
  marker: Point | null;
}

const EMPTY: TimelineState = { d: "", width: 0, height: 0, progress: 0, marker: null };

function centreIn(element: Element, box: DOMRect): Point {
  const rect = element.getBoundingClientRect();
  return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
}

export function useTimelineProgress(
  containerRef: RefObject<HTMLElement | null>,
  pathRef: RefObject<SVGPathElement | null>,
): TimelineState {
  const reduceMotion = useReducedMotion() ?? false;
  const [state, setState] = useState<TimelineState>(EMPTY);

  // subscription: ResizeObserver on the timeline, plus window scroll and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let points: Point[] = [];
    let thresholds: number[] = [];
    let dots: HTMLElement[] = [];
    let lit: boolean[] = [];
    let frame = 0;

    const measure = () => {
      const box = container.getBoundingClientRect();
      const start = container.querySelector("[data-timeline-start]");
      dots = Array.from(container.querySelectorAll<HTMLElement>("[data-timeline-dot]"));
      points = [...(start ? [centreIn(start, box)] : []), ...dots.map((dot) => centreIn(dot, box))];
      // The dots are the points after the start marker, when there is one.
      thresholds = stopThresholds(points).slice(start ? 1 : 0);
      lit = dots.map(() => false);
      return { d: buildPath(points), width: box.width, height: box.height };
    };

    let geometry = measure();

    const update = () => {
      frame = 0;
      const first = points[0];
      const last = points.at(-1);
      const box = container.getBoundingClientRect();
      const progress =
        reduceMotion || !first || !last
          ? 1
          : timelineProgress(window.innerHeight, box.top + first.y, last.y - first.y);

      dots.forEach((dot, index) => {
        const on = reduceMotion || progress >= (thresholds[index] ?? 1);
        if (on === lit[index]) return;
        lit[index] = on;
        dot.dataset.active = on ? "true" : "false";
        if (on && !reduceMotion) dot.dataset.ping = "true";
        else delete dot.dataset.ping;
      });

      const path = pathRef.current;
      let marker: Point | null = null;
      if (!reduceMotion && path && geometry.d) {
        const at = path.getPointAtLength(progress * path.getTotalLength());
        marker = { x: at.x, y: at.y };
      }
      setState({ ...geometry, progress, marker });
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(() => {
      geometry = measure();
      schedule();
    });
    observer.observe(container);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [containerRef, pathRef, reduceMotion]);

  return state;
}
