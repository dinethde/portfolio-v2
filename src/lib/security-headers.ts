// The response headers for every route (TECH_SPEC §9). No nonce, so `'unsafe-inline'` stays (STATE D-03).
export interface SecurityHeader {
  key: string;
  value: string;
}

// React's dev build uses eval for debugging, so only development adds 'unsafe-eval' (Next's CSP guide).
// `upgrade-insecure-requests` only goes out on an https site: on http://localhost WebKit would
// upgrade the CSS and JS requests to https, and the page would load unstyled (STATE D-79).
export function buildContentSecurityPolicy(development: boolean, secure = true): string {
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
    ...(secure ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function buildSecurityHeaders(development: boolean, secure = true): SecurityHeader[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(development, secure),
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
// The same SITE_URL as lib/seo.ts; unset means localhost.
const isSecure = (process.env.SITE_URL ?? "").startsWith("https:");

export const contentSecurityPolicy = buildContentSecurityPolicy(isDevelopment, isSecure);
export const securityHeaders = buildSecurityHeaders(isDevelopment, isSecure);
