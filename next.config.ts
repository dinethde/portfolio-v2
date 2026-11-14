import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // next dev writes an AGENTS.md for coding agents otherwise. Agents here read CLAUDE.md (STATE D-35).
  agentRules: false,
};

export default nextConfig;
