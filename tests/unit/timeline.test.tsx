import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProjectRow } from "@/components/timeline/ProjectRow";
import { TimelineDot } from "@/components/timeline/TimelineDot";
import { TimelineEntry } from "@/components/timeline/TimelineEntry";

afterEach(cleanup);

const img = { src: "/x.png", width: 10, height: 10 };
const thumbs = [{ image: img, alt: "" }];

describe("TimelineDot", () => {
  it("marks its circle and styles active and ping from data attributes", () => {
    const { container } = render(<TimelineDot />);
    const dot = container.querySelector("[data-timeline-dot]");
    expect(dot).not.toBeNull();
    expect(dot?.className).toContain("data-[active=true]:bg-fill-secondary-main-active");
    expect(dot?.className).toContain("data-[ping=true]:before:animate-");
    expect(dot?.className).toContain("motion-reduce:before:hidden");
  });
});

describe("ProjectRow", () => {
  it("is a plain block without href and a safe link with one", () => {
    const { rerender } = render(<ProjectRow title="A" description="d" thumbs={thumbs} />);
    expect(screen.queryByRole("link")).toBeNull();
    rerender(<ProjectRow title="A" description="d" thumbs={thumbs} href="https://x.dev" />);
    expect(screen.getByRole("link").getAttribute("rel")).toBe("noopener noreferrer");
  });
});

describe("TimelineEntry", () => {
  const props = {
    org: "IIT",
    logo: { image: img, alt: "" },
    jobTitle: "Student",
    description: "Desc",
    place: "COLOMBO",
    period: "2026",
    projects: [{ title: "Kenhold", description: "d", thumbs }],
  };

  it("shows the CURRENT tag only when current", () => {
    const { rerender } = render(<TimelineEntry {...props} />);
    expect(screen.queryByText("CURRENT")).toBeNull();
    rerender(<TimelineEntry {...props} current />);
    expect(screen.getByText("CURRENT")).toBeTruthy();
  });

  it("renders one dot and one row per project", () => {
    const { container } = render(<TimelineEntry {...props} />);
    expect(screen.getByText("Kenhold")).toBeTruthy();
    expect(container.querySelectorAll("[data-timeline-dot]").length).toBe(1);
  });
});
