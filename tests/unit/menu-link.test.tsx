import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MenuLink } from "@/components/menu/MenuLink";

afterEach(cleanup);

describe("MenuLink", () => {
  it("links to the section anchor and is muted at rest", () => {
    render(<MenuLink id="story" label="Story so far" />);
    const link = screen.getByRole("link", { name: "Story so far" });
    expect(link.getAttribute("href")).toBe("#story");
    expect(link.getAttribute("aria-current")).toBeNull();
    expect(link.className).toContain("text-menu-link-muted");
    expect(link.className).toContain("hover:text-menu-link-default");
  });

  it("is blue and marked current when active", () => {
    render(<MenuLink id="story" label="Story so far" active />);
    const link = screen.getByRole("link", { name: "Story so far" });
    expect(link.getAttribute("aria-current")).toBe("true");
    expect(link.className).toContain("text-menu-link-active");
    expect(link.className).not.toContain("text-menu-link-muted");
  });
});
