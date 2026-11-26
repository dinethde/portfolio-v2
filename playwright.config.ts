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
    // Serves the static export the way production does, as an assets-only Worker (STATE D-91).
    command: "bun run build && bunx wrangler dev --port 3000 --ip 0.0.0.0",
    url: baseURL,
    env: { WRANGLER_SEND_METRICS: "false" },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
