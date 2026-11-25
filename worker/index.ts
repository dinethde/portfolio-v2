import { Container, getContainer } from "@cloudflare/containers";

import { handleStore, type Storage } from "./contributions-store";
import { type EdgeCache, type WaitUntil, withEdgeCache } from "./edge-cache";

export { ContainerProxy } from "@cloudflare/containers";

// The Workers runtime types aren't installed, so borrow them from the container package.
type Namespace = Parameters<typeof getContainer>[0];
type Ctx = ConstructorParameters<typeof Container>[0];

interface Env {
  PORTFOLIO: Namespace;
  GITHUB_LOGIN: string;
  SITE_URL: string;
  GITHUB_TOKEN?: string;
}

interface StoreRpc {
  store(request: Request): Promise<Response>;
}

export class PortfolioContainer extends Container<Env> {
  defaultPort = 3000;
  sleepAfter = "30m";
  // Internet stays on (the package default) so the container can reach GitHub.
  enableInternet = true;

  // The container's requests to this host are answered by the Worker (STATE D-75).
  static outboundByHost = {
    "contributions.internal": (request: Request, env: unknown): Promise<Response> => {
      const stub = getContainer((env as Env).PORTFOLIO) as unknown as StoreRpc;
      return stub.store(request);
    },
  };

  private readonly storage: Storage;

  constructor(ctx: Ctx, env: Env) {
    super(ctx, env);
    this.storage = (ctx as { storage: Storage }).storage;
    this.envVars = {
      GITHUB_LOGIN: env.GITHUB_LOGIN,
      SITE_URL: env.SITE_URL,
      ...(env.GITHUB_TOKEN ? { GITHUB_TOKEN: env.GITHUB_TOKEN } : {}),
    };
  }

  /** RPC: keeps the last chart pull in this object's storage. */
  store(request: Request): Promise<Response> {
    return handleStore(request, this.storage);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: WaitUntil): Promise<Response> {
    // The edge cache answers first; one container instance serves what it misses.
    const cache = (globalThis as unknown as { caches: { default: EdgeCache } }).caches.default;
    return withEdgeCache(request, cache, ctx, (req) => getContainer(env.PORTFOLIO).fetch(req));
  },
};
