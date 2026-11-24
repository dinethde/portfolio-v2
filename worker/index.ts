import { Container, getContainer } from "@cloudflare/containers";

// The Workers runtime types aren't installed, so borrow them from the container package.
type Namespace = Parameters<typeof getContainer>[0];
type Ctx = ConstructorParameters<typeof Container>[0];

interface Env {
  PORTFOLIO: Namespace;
  GITHUB_LOGIN: string;
  SITE_URL: string;
  GITHUB_TOKEN?: string;
}

export class PortfolioContainer extends Container<Env> {
  defaultPort = 3000;
  sleepAfter = "30m";

  constructor(ctx: Ctx, env: Env) {
    super(ctx, env);
    this.envVars = {
      GITHUB_LOGIN: env.GITHUB_LOGIN,
      SITE_URL: env.SITE_URL,
      ...(env.GITHUB_TOKEN ? { GITHUB_TOKEN: env.GITHUB_TOKEN } : {}),
    };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // One instance serves every request.
    return getContainer(env.PORTFOLIO).fetch(request);
  },
};
