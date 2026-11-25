import { describe, expect, it } from "vitest";

describe("test setup", () => {
  it("runs in a DOM environment", () => {
    expect(typeof document).toBe("object");
  });
});
