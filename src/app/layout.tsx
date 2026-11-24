import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";

import type { ReactNode } from "react";

import { site } from "@/content/site";
import { siteUrl } from "@/lib/seo";

import "./globals.css";

// Self-hosted and preloaded by next/font. The SF fonts are system stacks and never download
// (TECH_SPEC §10). The variable feeds --font-serif in design-tokens.css (STATE D-09).
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const title = `${site.name} — ${site.title}`;

// TECH_SPEC §4. SITE_URL is set at build time; until the domain is chosen (STATE O2) links resolve
// against localhost. The share image is app/opengraph-image.png, which Next picks up by itself.
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title,
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    creator: site.twitter.handle,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={instrumentSerif.variable}>
      <body>
        <a
          href="#content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-16 focus-visible:left-16 focus-visible:z-50 focus-visible:rounded-500 focus-visible:bg-surface-neutral-light-active focus-visible:px-16 focus-visible:py-8 focus-visible:font-medium focus-visible:text-txt-neutral-p1-active focus-visible:shadow-pill focus-visible:outline-2 focus-visible:outline-outline-secondary-main-active focus-visible:outline-offset-2"
        >
          Skip to content
        </a>
        {/* Anchors stop below the floating menu pill on phone and tablet (TECH_SPEC §5, STATE D-59). */}
        <main
          id="content"
          tabIndex={-1}
          className="focus:outline-none [&_section[id]]:scroll-mt-80 desktop:[&_section[id]]:scroll-mt-0"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
