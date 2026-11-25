// The edge cache in front of the container (TECH_SPEC §8). Next sends `s-maxage` for the page and an
// immutable `max-age` for /_next/static/*; the Cache API honours both. On *.workers.dev the cache
// does nothing, so every request falls through to the container.

export interface EdgeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

export interface WaitUntil {
  waitUntil(promise: Promise<unknown>): void;
}

const NOT_SHAREABLE = /(^|,)\s*(no-store|no-cache|private)\s*(,|$)/i;
const HAS_LIFETIME = /(s-maxage|max-age)\s*=\s*([1-9]\d*)/i;

/** True when a response may be kept at the edge: a 200 that says how long it stays fresh. */
export function isCacheable(response: Response): boolean {
  if (response.status !== 200 || response.headers.has("Set-Cookie")) return false;
  const control = response.headers.get("Cache-Control") ?? "";
  return !NOT_SHAREABLE.test(control) && HAS_LIFETIME.test(control);
}

export async function withEdgeCache(
  request: Request,
  cache: EdgeCache,
  ctx: WaitUntil,
  origin: (request: Request) => Promise<Response>,
): Promise<Response> {
  // Only plain GETs are shared; a Range request would need partial responses.
  if (request.method !== "GET" || request.headers.has("Range")) return origin(request);

  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await origin(request);
  if (isCacheable(response)) {
    ctx.waitUntil(cache.put(request, response.clone()).catch(() => undefined));
  }
  return response;
}
