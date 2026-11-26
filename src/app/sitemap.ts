import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

// A static export has to be told these routes never change (STATE D-86).
export const dynamic = "force-static";

// TECH_SPEC §4: the sitemap lists one URL, the home page.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl().href }];
}
