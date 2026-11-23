import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Pill } from "@/components/ui/Pill";

afterEach(cleanup);

describe("Pill", () => {
  it("renders a social pill as a safe external link with hidden new-tab text", () => {
    render(
      <Pill href="https://github.com/x" icon={<svg />}>
        GitHub
      </Pill>,
    );
    const link = screen.getByRole("link", { name: "GitHub (opens in new tab)" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.className).toContain("focus-visible:focus-ring");
    expect(link.className).toContain("hover:-translate-y-1");
  });

  it("renders a tool pill as a plain span with no hover", () => {
    render(<Pill>React</Pill>);
    expect(screen.queryByRole("link")).toBeNull();
    const el = screen.getByText("React");
    expect(el.tagName).toBe("SPAN");
    expect(el.className).not.toContain("hover:");
  });
});
