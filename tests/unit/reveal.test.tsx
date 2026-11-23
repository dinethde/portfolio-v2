import { act, cleanup, render, screen } from "@testing-library/react";
import { useInView, useReducedMotion } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { Reveal } from "@/components/ui/Reveal";
import { RevealGroup } from "@/components/ui/RevealGroup";

vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useInView: vi.fn(() => false),
  useReducedMotion: vi.fn(() => false),
}));

beforeEach(() => {
  vi.mocked(useInView).mockReturnValue(false);
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

afterEach(cleanup);

describe("Reveal", () => {
  it("starts hidden and 12px low until it scrolls into view", () => {
    render(<Reveal>Hello</Reveal>);
    const el = screen.getByText("Hello");
    expect(el.style.opacity).toBe("0");
    expect(el.style.transform).toContain("12px");
  });

  it("plays once, when 15% of it is in view", () => {
    render(<Reveal>Hello</Reveal>);
    expect(useInView).toHaveBeenCalledWith(expect.anything(), { once: true, amount: 0.15 });
  });

  it("renders the final state with no motion under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(
      <Reveal as="section" className="flex">
        Hello
      </Reveal>,
    );
    const el = screen.getByText("Hello");
    expect(el.tagName).toBe("SECTION");
    expect(el.getAttribute("style")).toBeNull();
    expect(el.className).toBe("flex");
  });

  it("keeps a visible fallback for the first paint before React knows the preference", () => {
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText("Hello").className).toContain("motion-reduce:opacity-100!");
  });
});

describe("RevealGroup", () => {
  it("keeps list semantics for its children", () => {
    render(
      <RevealGroup as="ol">
        <Reveal as="li">One</Reveal>
        <Reveal as="li">Two</Reveal>
      </RevealGroup>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("hides its children until the group is in view", () => {
    render(
      <RevealGroup>
        <Reveal>One</Reveal>
      </RevealGroup>,
    );
    expect(screen.getByText("One").style.opacity).toBe("0");
  });

  it("renders plain elements under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(
      <RevealGroup as="ul">
        <Reveal as="li">One</Reveal>
      </RevealGroup>,
    );
    expect(screen.getByRole("listitem").getAttribute("style")).toBeNull();
    expect(screen.getByRole("list").getAttribute("style")).toBeNull();
  });
});

describe("hydration under reduced motion", () => {
  it("matches the server HTML, then drops the motion element", async () => {
    // The server never knows the preference; the browser does from its first render.
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const tree = (
      <RevealGroup as="ul">
        <Reveal as="li">One</Reveal>
      </RevealGroup>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const root = await act(async () => hydrateRoot(container, tree));

    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector("li")?.getAttribute("style")).toBeNull();
    act(() => root.unmount());
    container.remove();
    errors.mockRestore();
  });
});
