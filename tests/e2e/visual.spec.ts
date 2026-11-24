import { expect, type Page, test } from "@playwright/test";

// The approved look of the page (P5-04), compared within 0.5% of pixels. Baselines are recorded on
// Linux in Playwright's Docker image, so they match CI's browsers and fonts (STATE D-83). Reduced
// motion shows every final state, and the chart is masked because its data changes every day.

test.skip(process.platform !== "linux", "baselines are recorded on Linux, like CI");
test.use({ reducedMotion: "reduce" });

const options = { maxDiffPixelRatio: 0.005, animations: "disabled" } as const;

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

for (const [width, height] of [
  [390, 844],
  [834, 1194],
  [1440, 900],
] as const) {
  test(`the page at ${width}`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "one browser is enough for pixels");
    await open(page, width, height);
    await expect(page).toHaveScreenshot(`page-${width}.png`, {
      ...options,
      fullPage: true,
      mask: [page.locator("#achievements figure")],
    });
  });
}

for (const [width, height] of [
  [390, 844],
  [834, 1194],
] as const) {
  test(`the open menu at ${width}`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "one browser is enough for pixels");
    await open(page, width, height);
    const trigger = page.locator('button[aria-controls="site-menu-panel"]');
    // Click until React has hydrated and the panel opens.
    await expect(async () => {
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true", { timeout: 500 });
    }).toPass();
    await expect(page).toHaveScreenshot(`menu-${width}.png`, {
      ...options,
      mask: [page.locator("#achievements figure")],
    });
  });
}
