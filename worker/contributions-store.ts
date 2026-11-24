const KEY = "contributions";

/** The part of Durable Object storage the store uses, so tests can pass a Map. */
export interface Storage {
  get(key: string): Promise<unknown>;
  put(key: string, value: unknown): Promise<void>;
}

function hasWeeks(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { weeks?: unknown }).weeks)
  );
}

/** PUT saves the chart JSON, GET returns it (404 when empty), anything else is 405. */
export async function handleStore(request: Request, storage: Storage): Promise<Response> {
  if (request.method === "PUT") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("Body must be JSON", { status: 400 });
    }
    if (!hasWeeks(body)) return new Response("Body needs a weeks array", { status: 400 });
    await storage.put(KEY, body);
    return new Response(null, { status: 204 });
  }
  if (request.method === "GET") {
    const saved = await storage.get(KEY);
    return saved === undefined ? new Response(null, { status: 404 }) : Response.json(saved);
  }
  return new Response(null, { status: 405, headers: { Allow: "GET, PUT" } });
}
