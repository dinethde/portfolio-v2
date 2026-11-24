import type { NextConfig } from "next";

import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // next dev writes an AGENTS.md for coding agents otherwise. Agents here read CLAUDE.md (STATE D-35).
  agentRules: false,
  // TECH_SPEC §9: the same headers on every route.
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
};

export default nextConfig;
