import { describe, expect, it } from "vitest";

import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  securityHeaders,
  toHeadersFile,
} from "@/lib/security-headers";

describe("security headers", () => {
  it("lists the four headers from TECH_SPEC §9", () => {
    expect(securityHeaders.map((h) => h.key)).toEqual([
      "Content-Security-Policy",
      "Referrer-Policy",
      "X-Content-Type-Options",
      "Permissions-Policy",
    ]);
  });

  it("builds the production CSP with no nonce, no eval and every directive", () => {
    const contentSecurityPolicy = buildContentSecurityPolicy(false);
    expect(contentSecurityPolicy).not.toContain("nonce");
    expect(contentSecurityPolicy).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy).toBe(
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
    );
  });

  it("adds 'unsafe-eval' to script-src in development only", () => {
    const development = buildContentSecurityPolicy(true);
    expect(development).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval';");
    expect(development.replace(" 'unsafe-eval'", "")).toBe(buildContentSecurityPolicy(false));
  });

  it("upgrades insecure requests only on an https site", () => {
    expect(buildContentSecurityPolicy(false, true)).toContain("upgrade-insecure-requests");
    expect(buildContentSecurityPolicy(false, false)).not.toContain("upgrade-insecure-requests");
    expect(buildContentSecurityPolicy(false, false)).toBe(
      buildContentSecurityPolicy(false, true).replace("; upgrade-insecure-requests", ""),
    );
  });

  it("sets the fixed values", () => {
    const byKey = Object.fromEntries(buildSecurityHeaders(false).map((h) => [h.key, h.value]));
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
  });

  it("writes the _headers file with one indented line per header", () => {
    const file = toHeadersFile(buildSecurityHeaders(false, false));
    const lines = file.split("\n");
    expect(lines[0]).toBe("/*");
    expect(lines).toHaveLength(6);
    expect(lines[1]).toMatch(/^ {2}Content-Security-Policy: default-src 'self'; /);
    expect(lines[2]).toBe("  Referrer-Policy: strict-origin-when-cross-origin");
    expect(file.endsWith("\n")).toBe(true);
    expect(file).not.toContain("upgrade-insecure-requests");
  });
});
