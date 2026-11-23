import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SectionHeader } from "@/components/ui/SectionHeader";

afterEach(cleanup);

describe("SectionHeader", () => {
  it("renders the title as a heading and the eyebrow", () => {
    render(<SectionHeader variant="section" eyebrow="Story" title="About me" />);
    expect(screen.getByRole("heading", { name: "About me" })).toBeTruthy();
    expect(screen.getByText("Story")).toBeTruthy();
  });

  it("shows the description and divider only on request", () => {
    const { container, rerender } = render(
      <SectionHeader variant="section" eyebrow="e" title="t" description="Some words" />,
    );
    expect(screen.getByText("Some words")).toBeTruthy();
    expect(container.querySelector("hr")).toBeNull();
    rerender(<SectionHeader variant="section" eyebrow="e" title="t" divider />);
    expect(screen.queryByText("Some words")).toBeNull();
    expect(container.querySelector("hr")).not.toBeNull();
  });

  it("draws the underline as a hidden image", () => {
    const { container } = render(
      <SectionHeader variant="section" eyebrow="e" title="t" underline />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the hero emoji beside the hello line, hidden from screen readers", () => {
    const { container } = render(
      <SectionHeader variant="hero" eyebrow="Hi" title="t" icons="👀" />,
    );
    expect(container.querySelector('span[aria-hidden="true"]')?.textContent).toBe("👀");
  });
});
