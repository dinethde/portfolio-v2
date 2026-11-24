import { expect, test } from "@playwright/test";

// TECH_SPEC §6: with reduced motion the page shows final states only: the timeline line fully
// drawn, every dot active, no marker, and no entrance motion.

test.use({ reducedMotion: "reduce" });

test("the timeline is fully drawn with every dot active and no marker", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const dots = page.locator("[data-timeline-dot]");
  const count = await dots.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await expect(dots.nth(i)).toHaveAttribute("data-active", "true");
    await expect(dots.nth(i)).not.toHaveAttribute("data-ping", /.*/);
  }
  await expect(page.locator("#story svg path[pathLength]")).toHaveCSS("stroke-dashoffset", "0px");
  await expect(page.locator("#story svg circle")).toHaveCount(0);
});

test("content is visible straight away, with no entrance motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll("main *")].filter(
        (el) => getComputedStyle(el).opacity === "0" && !el.closest("[aria-hidden='true']"),
      ).length,
  );
  expect(hidden).toBe(0);
  await expect(page.locator("main [style*='transform']")).toHaveCount(0);
});
