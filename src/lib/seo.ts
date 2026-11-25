import { site } from "@/content/site";

// TECH_SPEC §4. The same fallback as layout.tsx: SITE_URL is set at build time, and when it is unset
// (local runs) links resolve against localhost.
export function siteUrl(): URL {
  return new URL(process.env.SITE_URL || "http://localhost:3000");
}

// JSON-LD `Person` for the page (TECH_SPEC §4). LinkedIn joins `sameAs` unless its href is the
// "TODO" placeholder the schema allows.
export function personJsonLd() {
  const sameAs = [site.github.href, site.twitter.href];
  if (site.linkedin.href !== "TODO") {
    sameAs.push(site.linkedin.href);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.title,
    url: siteUrl().href,
    sameAs,
  };
}
