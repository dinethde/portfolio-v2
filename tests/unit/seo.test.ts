import { afterEach, describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";
import { personJsonLd, siteUrl } from "@/lib/seo";

describe("siteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to localhost when SITE_URL is unset", () => {
    vi.stubEnv("SITE_URL", "");
    expect(siteUrl().href).toBe("http://localhost:3000/");
  });

  it("uses SITE_URL when it is set", () => {
    vi.stubEnv("SITE_URL", "https://example.com");
    expect(siteUrl().href).toBe("https://example.com/");
  });
});

describe("personJsonLd", () => {
  it("describes the person with name, job title and url", () => {
    const json = personJsonLd();
    expect(json["@type"]).toBe("Person");
    expect(json.name).toBe(site.name);
    expect(json.jobTitle).toBe(site.title);
    expect(json.url).toBe(siteUrl().href);
  });

  it("lists GitHub and X, and skips LinkedIn while it is TODO", () => {
    expect(site.linkedin.href).toBe("TODO");
    expect(personJsonLd().sameAs).toEqual([site.github.href, site.twitter.href]);
  });
});
