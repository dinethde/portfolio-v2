import { describe, expect, it } from "vitest";

import { handleStore, type Storage } from "../../worker/contributions-store";

function memory(): Storage {
  const map = new Map<string, unknown>();
  return {
    get: (key) => Promise.resolve(map.get(key)),
    put: (key, value) => {
      map.set(key, value);
      return Promise.resolve();
    },
  };
}

const URL = "http://contributions.internal/";

function put(body: string): Request {
  return new Request(URL, { method: "PUT", body });
}

describe("handleStore", () => {
  it("saves then loads the same JSON", async () => {
    const storage = memory();
    const data = { total: 3, weeks: [[]], fetchedAt: "2025-01-01T00:00:00.000Z" };
    expect((await handleStore(put(JSON.stringify(data)), storage)).status).toBe(204);
    const get = await handleStore(new Request(URL), storage);
    expect(get.status).toBe(200);
    expect(await get.json()).toEqual(data);
  });

  it("answers 404 when nothing is saved", async () => {
    expect((await handleStore(new Request(URL), memory())).status).toBe(404);
  });

  it("answers 400 on a body that is not JSON with weeks", async () => {
    const storage = memory();
    for (const body of ["nope", JSON.stringify({ total: 1 }), JSON.stringify({ weeks: 1 })]) {
      expect((await handleStore(put(body), storage)).status).toBe(400);
    }
    expect((await handleStore(new Request(URL), storage)).status).toBe(404);
  });

  it("answers 405 to other methods", async () => {
    expect((await handleStore(new Request(URL, { method: "DELETE" }), memory())).status).toBe(405);
  });
});
