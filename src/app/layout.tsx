import type { ReactNode } from "react";

import "./globals.css";

// Stub: P0-02 adds the fonts, metadata, skip link and menu.
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
