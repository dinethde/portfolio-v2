import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

// TECH_SPEC §4: the sitemap lists one URL, the home page.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl().href }];
}
