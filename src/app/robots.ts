import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

// A static export has to be told these routes never change (STATE D-86).
export const dynamic = "force-static";

// TECH_SPEC §4: everything is allowed, and the sitemap is linked from here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl()).href,
  };
}
