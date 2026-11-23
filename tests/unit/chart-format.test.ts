import { describe, expect, it } from "vitest";

import { formatMonth, formatTooltip, formatTotal } from "@/components/contribution-chart/format";

describe("formatTooltip", () => {
  it("says no contributions for zero", () => {
    expect(formatTooltip(0, "2026-06-09")).toBe("No contributions on 9 June");
  });
  it("uses the singular for one", () => {
    expect(formatTooltip(1, "2026-05-03")).toBe("1 contribution on 3 May");
  });
  it("uses the plural for many", () => {
    expect(formatTooltip(4, "2026-03-12")).toBe("4 contributions on 12 March");
  });
});

describe("formatTotal", () => {
  it("handles zero, one and many with thousands separators", () => {
    expect(formatTotal(0)).toBe("0 contributions in the last year");
    expect(formatTotal(1)).toBe("1 contribution in the last year");
    expect(formatTotal(1284)).toBe("1,284 contributions in the last year");
  });
});

describe("formatMonth", () => {
  it("gives the short month name", () => {
    expect(formatMonth("2025-11-16")).toBe("Nov");
  });
});
