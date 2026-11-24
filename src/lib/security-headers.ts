// The response headers for every route (TECH_SPEC §9). No nonce, so `'unsafe-inline'` stays (STATE D-03).
export interface SecurityHeader {
  key: string;
  value: string;
}

// React's dev build uses eval for debugging, so only development adds 'unsafe-eval' (Next's CSP guide).
export function buildContentSecurityPolicy(development: boolean): string {
  const scriptSrc = development
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function buildSecurityHeaders(development: boolean): SecurityHeader[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(development),
    },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
}

const isDevelopment = process.env.NODE_ENV === "development";

export const contentSecurityPolicy = buildContentSecurityPolicy(isDevelopment);
export const securityHeaders = buildSecurityHeaders(isDevelopment);
