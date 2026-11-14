import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    // Same server as the container (STATE D-02): standalone output needs its static files beside it.
    command:
      "bun run build && cp -R .next/static .next/standalone/.next/ && (test ! -d public || cp -R public .next/standalone/) && node .next/standalone/server.js",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
