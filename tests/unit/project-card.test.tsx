import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProjectCard } from "@/components/project-card/ProjectCard";

afterEach(cleanup);

const image = { src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=", alt: "Screenshot" };

describe("ProjectCard", () => {
  it("makes the whole card the link when given an href", () => {
    render(
      <ProjectCard title="Kenhold" tag="Work" image={image} glow="blue-base" href="#kenhold" />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("#kenhold");
    expect(link.textContent).toContain("Kenhold");
    expect(link.querySelector("img[alt='Screenshot']")).not.toBeNull();
  });

  it("is a plain article without an href", () => {
    render(<ProjectCard title="Vows" image={image} glow="warm-left" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("heading", { name: "Vows" })).not.toBeNull();
  });

  it("draws three decorative glow layers and respects reduced motion", () => {
    const { container } = render(<ProjectCard title="Vows" image={image} glow="warm-right" />);
    const glow = container.querySelector("[aria-hidden='true'].pointer-events-none");
    expect(glow?.querySelectorAll("img[alt='']").length).toBe(3);
    expect(container.innerHTML).toContain("motion-reduce:transition-none");
  });
});
