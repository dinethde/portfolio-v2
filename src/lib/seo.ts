import { site } from "@/content/site";

// TECH_SPEC §4. The same fallback as layout.tsx: SITE_URL is set at build time, and until the domain
// is chosen (STATE O2) links resolve against localhost.
export function siteUrl(): URL {
  return new URL(process.env.SITE_URL || "http://localhost:3000");
}

// JSON-LD `Person` for the page (TECH_SPEC §4). LinkedIn joins `sameAs` once its URL is known
// (STATE O1), so it's left out while the content still says "TODO".
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
