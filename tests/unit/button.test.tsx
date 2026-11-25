import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "@/components/ui/Button";

afterEach(cleanup);

describe("Button", () => {
  it("renders a link when given an href", () => {
    render(
      <Button variant="primary-light" href="#contact">
        Say hi
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Say hi" });
    expect(link.getAttribute("href")).toBe("#contact");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a button that never submits a form without an href", () => {
    render(<Button variant="secondary">Resume</Button>);
    expect(screen.getByRole("button", { name: "Resume" }).getAttribute("type")).toBe("button");
  });

  it("uses each variant's own colour tokens and keeps extra classes", () => {
    render(
      <>
        <Button variant="primary-light" className="self-start">
          Say hi
        </Button>
        <Button variant="secondary">Resume</Button>
      </>,
    );
    const primary = screen.getByRole("button", { name: "Say hi" });
    const secondary = screen.getByRole("button", { name: "Resume" });
    expect(primary.className).toContain("bg-btn-primary-light-default-bg");
    expect(primary.className).toContain("self-start");
    expect(secondary.className).toContain("bg-btn-secondary-light-default-bg");
    expect(secondary.className).not.toContain("primary");
  });

  it("shows the shared focus ring on keyboard focus", () => {
    render(<Button variant="secondary">Resume</Button>);
    expect(screen.getByRole("button").className).toContain("focus-visible:focus-ring");
  });
});
