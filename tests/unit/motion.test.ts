import { describe, expect, it } from "vitest";

import { duration, ease, entrance, entranceGroup, stagger } from "@/lib/motion";

// These pin DESIGN.md "Motion". If one fails, change the design doc first.
describe("motion constants", () => {
  it("uses the one easing curve", () => {
    expect(ease).toEqual([0.22, 1, 0.36, 1]);
  });

  it("has only the durations from the design", () => {
    expect(duration).toEqual({
      fast: 0.15,
      quick: 0.2,
      medium: 0.25,
      slow: 0.3,
      entrance: 0.5,
      ping: 0.6,
    });
  });

  it("staggers children by 60ms", () => {
    expect(stagger).toBe(0.06);
    expect(entranceGroup.visible).toMatchObject({ transition: { staggerChildren: 0.06 } });
  });

  it("fades in and rises 12px over 500ms", () => {
    expect(entrance.hidden).toEqual({ opacity: 0, y: 12 });
    expect(entrance.visible).toEqual({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    });
  });
});
