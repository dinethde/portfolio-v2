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

interface Sample extends Point {
  /** Length along the path up to this sample. */
  length: number;
}

/** The path as short straight pieces, matching buildPath's shape, with the length to each. */
function samplePath(points: Point[]): { samples: Sample[]; atPoint: number[] } {
  const samples: Sample[] = [];
  const atPoint: number[] = [];
  let total = 0;
  const add = (next: Point) => {
    const last = samples.at(-1);
    if (last) total += Math.hypot(next.x - last.x, next.y - last.y);
    samples.push({ ...next, length: total });
  };
  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (previous && index === 1 && point.x !== previous.x) {
      const [c1, c2] = curveControls(previous, point);
      for (let step = 1; step <= CURVE_SAMPLES; step++) {
        add(curvePoint(previous, c1, c2, point, step / CURVE_SAMPLES));
      }
    } else {
      add(point);
    }
    atPoint.push(total);
  });
  return { samples, atPoint };
}

/** The length along the path to each point. */
export function lengthsAlong(points: Point[]): number[] {
  return samplePath(points).atPoint;
}

/**
 * How much of the path is drawn, 0 to 1, when the marker line (0.6 × innerHeight) sits at
 * `markerY` in the path's own coordinates. Measured along the path, so the drawn tip lands on the
 * marker line even across the curved first leg.
 */
export function progressAlong(points: Point[], markerY: number): number {
  const { samples } = samplePath(points);
  const first = samples[0];
  const last = samples.at(-1);
  if (!first || !last || last.length <= 0) return 0;
  if (markerY <= first.y) return 0;
  if (markerY >= last.y) return 1;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    if (a && b && markerY <= b.y && b.y > a.y) {
      const t = (markerY - a.y) / (b.y - a.y);
      return (a.length + t * (b.length - a.length)) / last.length;
    }
  }
  return 1;
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
      const found = Array.from(container.querySelectorAll<HTMLElement>("[data-timeline-dot]"));
      // A resize measures again; the dots that were already lit stay lit, so they don't ping twice.
      // Only a different set of dots starts over.
      const sameDots = found.length === dots.length && found.every((dot, i) => dot === dots[i]);
      dots = found;
      points = [...(start ? [centreIn(start, box)] : []), ...dots.map((dot) => centreIn(dot, box))];
      // The dots are the points after the start marker, when there is one.
      thresholds = stopThresholds(points).slice(start ? 1 : 0);
      if (!sameDots) {
        lit = dots.map(() => false);
        for (const dot of dots) dot.dataset.active = "false";
      }
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
          : progressAlong(points, MARKER_VIEWPORT_SHARE * window.innerHeight - box.top);

      dots.forEach((dot, index) => {
        const on = reduceMotion || progress >= (thresholds[index] ?? 1);
        if (on === lit[index]) return;
        lit[index] = on;
        dot.dataset.active = on ? "true" : "false";
        if (on && !reduceMotion) dot.dataset.ping = "true";
        else delete dot.dataset.ping;
      });

      // The path only holds the new geometry after React renders it, so the marker waits a frame.
      const path = pathRef.current;
      let marker: Point | null = null;
      if (!reduceMotion && path && geometry.d) {
        if (path.getAttribute("d") === geometry.d) {
          const at = path.getPointAtLength(progress * path.getTotalLength());
          marker = { x: at.x, y: at.y };
        } else {
          schedule();
        }
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
