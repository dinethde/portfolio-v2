import { expect, test } from "@playwright/test";

import { contentSecurityPolicy } from "../../src/lib/security-headers";

// Runs against the production server (the webServer block, or PLAYWRIGHT_BASE_URL).

test("every security header is set and the page hydrates under the CSP", async ({
  page,
  browserName,
  baseURL,
}) => {
  // WebKit applies `upgrade-insecure-requests` to http://localhost too, so its scripts never load there.
  test.skip(
    browserName === "webkit" && !baseURL?.startsWith("https:"),
    "WebKit upgrades http localhost subresources to https",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const headers = response?.headers() ?? {};
  expect(headers["content-security-policy"]).toBe(contentSecurityPolicy);
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
  expect(headers["x-powered-by"]).toBeUndefined();

  // Hydration check: the phone menu only opens once React is running.
  const trigger = page.locator('button[aria-controls="site-menu-panel"]');
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  expect(problems.filter((text) => /Content Security Policy|CSP/i.test(text))).toEqual([]);
});
