import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import fallback from "@/content/contributions.fallback.json";
import {
  Contributions,
  calendarRange,
  type RawCalendar,
  toContributions,
  toLevel,
} from "@/lib/github/map";

vi.mock("server-only", () => ({}));

const NOW = new Date("2025-06-18T12:00:00Z"); // a Wednesday

function rawCalendar(weekCount: number, level = "FIRST_QUARTILE"): RawCalendar {
  const start = Date.parse("2024-06-16T00:00:00Z"); // a Sunday
  const weeks = Array.from({ length: weekCount }, (_, w) => ({
    contributionDays: Array.from({ length: 7 }, (_, d) => ({
      date: new Date(start + (w * 7 + d) * 86_400_000).toISOString().slice(0, 10),
      contributionCount: 1,
      contributionLevel: level,
    })),
  }));
  return {
    user: { contributionsCollection: { contributionCalendar: { totalContributions: 0, weeks } } },
  };
}

describe("toLevel", () => {
  it("maps every GitHub level to 0 to 4", () => {
    const names = [
      "NONE",
      "FIRST_QUARTILE",
      "SECOND_QUARTILE",
      "THIRD_QUARTILE",
      "FOURTH_QUARTILE",
    ];
    expect(names.map(toLevel)).toEqual([0, 1, 2, 3, 4]);
  });

  it("rejects an unknown level", () => {
    expect(() => toLevel("FIFTH")).toThrow();
  });
});

describe("calendarRange", () => {
  it("starts on the Sunday 52 weeks back", () => {
    const { from, to } = calendarRange(NOW);
    expect(new Date(from).getUTCDay()).toBe(0);
    expect(from).toBe("2024-06-16T00:00:00.000Z");
    expect(to).toBe(NOW.toISOString());
  });
});

describe("toContributions", () => {
  it("keeps the newest 52 weeks, each starting on a Sunday", () => {
    const result = toContributions(rawCalendar(54), NOW);
    expect(result.weeks).toHaveLength(52);
    for (const week of result.weeks) expect(new Date(week[0]?.date ?? "").getUTCDay()).toBe(0);
    expect(result.weeks[0]?.[0]?.date).toBe("2024-06-30");
    expect(result.total).toBe(52 * 7);
    expect(result.source).toBe("live");
  });

  it("throws when GitHub has no such user", () => {
    expect(() => toContributions({ user: null }, NOW)).toThrow();
  });
});

describe("fallback file", () => {
  it("matches the Contributions shape", () => {
    expect(Contributions.parse(fallback).weeks).toHaveLength(52);
  });

  it("rejects a malformed refresh", () => {
    expect(() =>
      Contributions.parse({ ...fallback, weeks: [[{ date: "2025-01-05", count: 1, level: 9 }]] }),
    ).toThrow();
    expect(() => Contributions.parse({ total: 1 })).toThrow();
  });
});

describe("getContributions", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "test-token");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function load() {
    return (await import("@/lib/github/contributions")).getContributions("dinethde");
  }

  it("returns live data on success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ data: rawCalendar(53, "SECOND_QUARTILE") }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await load();
    expect(result.source).toBe("live");
    expect(result.weeks[0]?.[0]?.level).toBe(2);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit & { next?: { revalidate: number } };
    expect(init.next?.revalidate).toBe(21600);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("falls back and logs on an HTTP error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 502 })));
    const result = await load();
    expect(result.source).toBe("fallback");
    expect(console.error).toHaveBeenCalledWith("[contrib]", expect.any(String));
  });

  it("falls back on GraphQL errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ errors: [{ message: "bad" }] })),
    );
    expect((await load()).source).toBe("fallback");
  });

  it("falls back when the response is missing weeks", async () => {
    const data = {
      user: { contributionsCollection: { contributionCalendar: { totalContributions: 1 } } },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ data })));
    expect((await load()).source).toBe("fallback");
  });

  it("falls back on a timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")),
    );
    expect((await load()).source).toBe("fallback");
  });

  it("falls back without a token and never leaks it into the log", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.stubGlobal("fetch", vi.fn());
    expect((await load()).source).toBe("fallback");
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("test-token");
  });
});
