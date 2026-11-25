import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

// TECH_SPEC §4: everything is allowed, and the sitemap is linked from here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl()).href,
  };
}
