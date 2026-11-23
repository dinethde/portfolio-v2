import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContributionChart } from "@/components/contribution-chart/ContributionChart";

import { sampleContributions } from "../../src/app/(dev)/lab/fixtures";

afterEach(cleanup);

function setup() {
  return render(<ContributionChart title="Title" contributions={sampleContributions} />);
}

describe("ContributionChart", () => {
  it("wraps an img grid in a figure captioned with the total", () => {
    const { container } = setup();
    expect(container.querySelector("figure")).not.toBeNull();
    expect(container.querySelector("figcaption")?.textContent).toContain(
      "contributions in the last year",
    );
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
      "contributions in the last year",
    );
  });

  it("renders 40 week columns, hiding the oldest 16 on phones", () => {
    const { container } = setup();
    expect(screen.getByRole("img").children).toHaveLength(40);
    expect(container.querySelectorAll(".max-tablet\\:hidden")).toHaveLength(16);
  });

  it("colours cells with the chart-level tokens", () => {
    const { container } = setup();
    expect(container.querySelector(".bg-contribution_chart-level_0-bg")).not.toBeNull();
    expect(container.querySelector(".bg-contribution_chart-level_4-bg")).not.toBeNull();
  });

  it("shows the tooltip for the hovered cell", () => {
    const { container } = setup();
    const cell = container.querySelector<HTMLElement>("[data-tip]");
    expect(cell).not.toBeNull();
    fireEvent.pointerMove(cell as HTMLElement);
    expect(screen.getAllByText(cell?.dataset.tip ?? "").length).toBeGreaterThan(0);
  });
});
