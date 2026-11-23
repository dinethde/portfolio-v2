import { describe, expect, it } from "vitest";

import {
  buildPath,
  lengthsAlong,
  stopThresholds,
  timelineProgress,
} from "@/hooks/use-timeline-progress";

describe("timelineProgress", () => {
  it("is 0 until the path top reaches 60% of the viewport", () => {
    expect(timelineProgress(1000, 700, 2000)).toBe(0);
    expect(timelineProgress(1000, 600, 2000)).toBe(0);
  });

  it("follows the marker line through the path", () => {
    expect(timelineProgress(1000, 100, 1000)).toBeCloseTo(0.5);
  });

  it("stops at 1 once the path has passed the marker", () => {
    expect(timelineProgress(1000, -5000, 1000)).toBe(1);
  });

  it("is 0 for an empty path", () => {
    expect(timelineProgress(1000, 0, 0)).toBe(0);
  });
});

describe("buildPath", () => {
  it("curves from an off-rail start to the first dot, then runs straight", () => {
    const d = buildPath([
      { x: 100, y: 0 },
      { x: 10, y: 100 },
      { x: 10, y: 300 },
    ]);
    expect(d).toBe("M 100 0 C 100 50 10 50 10 100 L 10 300");
  });

  it("is empty with no points", () => {
    expect(buildPath([])).toBe("");
  });
});

describe("stopThresholds", () => {
  it("places evenly spaced straight stops evenly", () => {
    const points = [0, 100, 200, 300, 400].map((y) => ({ x: 10, y }));
    expect(stopThresholds(points)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("counts the curve's real length, so the first dot lights where the line reaches it", () => {
    const points = [
      { x: 100, y: 0 },
      { x: 10, y: 100 },
      { x: 10, y: 200 },
    ];
    const [, curve = 0, end = 0] = lengthsAlong(points);
    // The curve is longer than its 100px drop but shorter than going round both legs.
    expect(curve).toBeGreaterThan(Math.hypot(90, 100));
    expect(curve).toBeLessThan(190);
    expect(end - curve).toBeCloseTo(100);
    expect(stopThresholds(points)[1]).toBeCloseTo(curve / end);
  });
});
