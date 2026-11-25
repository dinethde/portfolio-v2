import { describe, expect, it } from "vitest";

import { type EdgeCache, isCacheable, withEdgeCache } from "../../worker/edge-cache";

function memoryCache(): EdgeCache & { size: () => number } {
  const map = new Map<string, Response>();
  return {
    match: (request) => Promise.resolve(map.get(request.url)?.clone()),
    put: (request, response) => {
      map.set(request.url, response);
      return Promise.resolve();
    },
    size: () => map.size,
  };
}

function setup() {
  const cache = memoryCache();
  const pending: Promise<unknown>[] = [];
  const ctx = { waitUntil: (p: Promise<unknown>) => void pending.push(p) };
  let calls = 0;
  const run = async (request: Request, response: () => Response) => {
    const result = await withEdgeCache(request, cache, ctx, () => {
      calls += 1;
      return Promise.resolve(response());
    });
    await Promise.all(pending);
    return result;
  };
  return { cache, run, calls: () => calls };
}

const page = () =>
  new Response("<html>", {
    headers: { "Cache-Control": "s-maxage=21600, stale-while-revalidate=31536000" },
  });

describe("edge cache", () => {
  it("serves the second GET from the cache", async () => {
    const { run, calls } = setup();
    await run(new Request("https://dinethde.me/"), page);
    const second = await run(new Request("https://dinethde.me/"), page);
    expect(calls()).toBe(1);
    expect(await second.text()).toBe("<html>");
  });

  it("caches immutable static files", () => {
    const response = new Response("js", {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    });
    expect(isCacheable(response)).toBe(true);
  });

  it("never caches a non-GET request", async () => {
    const { run, cache, calls } = setup();
    await run(new Request("https://dinethde.me/", { method: "POST" }), page);
    await run(new Request("https://dinethde.me/", { method: "POST" }), page);
    expect(calls()).toBe(2);
    expect(cache.size()).toBe(0);
  });

  it("never caches a non-200 response", async () => {
    const { run, cache } = setup();
    await run(
      new Request("https://dinethde.me/x"),
      () => new Response("", { status: 404, headers: { "Cache-Control": "s-maxage=60" } }),
    );
    expect(cache.size()).toBe(0);
  });

  it("skips responses that say no-store, private or give no lifetime", () => {
    for (const control of ["no-store", "private, max-age=60", "no-cache", ""]) {
      const headers = control ? { "Cache-Control": control } : undefined;
      expect(isCacheable(new Response("x", { headers }))).toBe(false);
    }
  });

  it("skips responses that set a cookie", () => {
    // The test environment's Response drops Set-Cookie, so the headers are faked.
    const values: Record<string, string> = { "cache-control": "s-maxage=60", "set-cookie": "a=b" };
    const headers = {
      get: (name: string) => values[name.toLowerCase()] ?? null,
      has: (name: string) => name.toLowerCase() in values,
    };
    expect(isCacheable({ status: 200, headers } as unknown as Response)).toBe(false);
  });
});
