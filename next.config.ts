import type { NextConfig } from "next";

import { securityHeaders } from "./src/lib/security-headers";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // The site is plain files in out/ (STATE D-86).
  output: "export",
  images: { unoptimized: true },
  // The component lab lives in page.dev.tsx, so it exists only in development.
  pageExtensions: isDevelopment ? ["tsx", "ts", "dev.tsx"] : ["tsx", "ts"],
  poweredByHeader: false,
  // next dev writes an AGENTS.md for coding agents otherwise. Agents here read CLAUDE.md (STATE D-35).
  agentRules: false,
  // TECH_SPEC §9: the same headers on every route in development. The export ignores headers(),
  // so production gets them from out/_headers instead.
  ...(isDevelopment && {
    headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  }),
};

export default nextConfig;
