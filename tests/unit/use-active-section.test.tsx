import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SECTION_IDS, useActiveSection } from "@/hooks/use-active-section";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let callback: Callback;
let options: IntersectionObserverInit | undefined;
const observed: string[] = [];
const disconnect = vi.fn();

beforeEach(() => {
  observed.length = 0;
  disconnect.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: Callback, opts?: IntersectionObserverInit) {
        callback = cb;
        options = opts;
      }
      observe(el: Element) {
        observed.push(el.id);
      }
      disconnect = disconnect;
    },
  );
  for (const id of SECTION_IDS) {
    const el = document.createElement("section");
    el.id = id;
    document.body.append(el);
  }
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("useActiveSection", () => {
  it("observes the five anchors with the centre-band margin", () => {
    renderHook(() => useActiveSection());
    expect(observed).toEqual([...SECTION_IDS]);
    expect(options?.rootMargin).toBe("-40% 0px -60% 0px");
  });

  it("starts on the first section and follows the intersecting one", () => {
    const { result } = renderHook(() => useActiveSection());
    expect(result.current).toBe("achievements");
    act(() => {
      callback([{ isIntersecting: true, target: document.getElementById("projects")! }]);
    });
    expect(result.current).toBe("projects");
    act(() => {
      callback([{ isIntersecting: false, target: document.getElementById("about")! }]);
    });
    expect(result.current).toBe("projects");
  });

  it("disconnects on unmount", () => {
    renderHook(() => useActiveSection()).unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
