import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RichText } from "@/components/ui/RichText";

afterEach(cleanup);

describe("RichText", () => {
  it("renders one span per run with its text", () => {
    const { container } = render(<RichText runs={[{ text: "a " }, { text: "b" }]} />);
    const spans = container.querySelectorAll("span");
    expect(spans).toHaveLength(2);
    expect(container.textContent).toBe("a b");
  });

  it("maps each tone and weight to its token class", () => {
    const { container } = render(
      <RichText
        runs={[
          { text: "s", tone: "strong", weight: "medium" },
          { text: "b", tone: "brand" },
          { text: "c", tone: "secondary", weight: "semibold" },
          { text: "e", tone: "error", weight: "regular" },
        ]}
      />,
    );
    const [s, b, c, e] = Array.from(container.querySelectorAll("span"));
    expect(s?.className).toBe("text-txt-neutral-p2-active font-medium");
    expect(b?.className).toBe("text-txt-brand-p1-active");
    expect(c?.className).toBe("text-txt-secondary-p1-active font-semibold");
    expect(e?.className).toBe("text-txt-error-p1-active font-normal");
  });

  it("leaves a run with no tone or weight unstyled", () => {
    const { container } = render(<RichText runs={[{ text: "plain" }]} />);
    expect(container.querySelector("span")?.hasAttribute("class")).toBe(false);
  });
});
