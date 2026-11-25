import { defineConfig, devices } from "@playwright/test";

// lab_shot.py points this at its own per-checkout dev server; everything else uses 3000.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "on-first-retry" },
  // Visual baselines live beside the specs, one per screenshot name (STATE D-83).
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFileName}/{arg}{ext}",
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    // Same server as the container (STATE D-02): standalone output needs its static files beside it.
    command:
      "bun run build && cp -R .next/static .next/standalone/.next/ && (test ! -d public || cp -R public .next/standalone/) && node .next/standalone/server.js",
    url: baseURL,
    // Docker sets HOSTNAME to the container id, which server.js would bind to instead of every interface
    env: { HOSTNAME: "0.0.0.0" },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
