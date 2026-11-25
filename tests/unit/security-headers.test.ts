import { describe, expect, it } from "vitest";

import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  securityHeaders,
} from "@/lib/security-headers";

describe("security headers", () => {
  it("lists the headers from TECH_SPEC §9", () => {
    const keys = securityHeaders.map((h) => h.key);
    expect(keys.slice(0, 4)).toEqual([
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

  it("sends HSTS only on an https site", () => {
    const value = (secure: boolean) =>
      buildSecurityHeaders(false, secure).find((h) => h.key === "Strict-Transport-Security")?.value;
    expect(value(true)).toBe("max-age=63072000; includeSubDomains");
    expect(value(false)).toBeUndefined();
  });

  it("sets the fixed values", () => {
    const byKey = Object.fromEntries(buildSecurityHeaders(false).map((h) => [h.key, h.value]));
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
  });
});
