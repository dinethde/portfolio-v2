import { expect, test } from "@playwright/test";

import { nav } from "@/content/nav";

// The assembled page (P4-06): every menu anchor lands below the floating pill, the active link
// follows the scroll, and the chart renders even without GitHub (the build falls back to the
// saved JSON when there's no token).

// How far below the viewport top a section may start after an anchor jump: the scroll-margin
// (STATE D-59) plus a little rounding.
const LANDING = { 390: 80, 834: 96, 1440: 0 } as const;

for (const width of [390, 834, 1440] as const) {
  test.describe(`at ${width}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
    });

    test("every section anchor lands below the menu", async ({ page }) => {
      for (const { id } of nav) {
        await page.evaluate((target) => {
          document.documentElement.style.scrollBehavior = "auto";
          location.hash = `#${target}`;
        }, id);
        const top = await page
          .locator(`section#${id}`)
          .evaluate((el) => el.getBoundingClientRect().top);
        const atBottom = await page.evaluate(
          () =>
            Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight,
        );
        // The last sections can't scroll to the top of the viewport once the page bottoms out.
        if (!atBottom) expect(Math.abs(top - LANDING[width])).toBeLessThanOrEqual(2);
        expect(top).toBeGreaterThanOrEqual(LANDING[width] - 2);
      }
    });

    test("the chart renders", async ({ page }) => {
      const chart = page.locator("#achievements figure");
      await expect(chart).toBeVisible();
      await expect(chart.locator('[role="img"]')).toHaveAttribute("aria-label", /contribution/i);
    });

    test("there is one main landmark and one h1", async ({ page }) => {
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  });
}

test("the desktop menu marks the section in view", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const sideMenu = page.getByRole("navigation", { name: "Page sections" }).first();
  await expect(sideMenu.getByRole("link", { name: "Achievements" })).toHaveAttribute(
    "aria-current",
    "true",
  );
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.getElementById("projects")?.scrollIntoView();
  });
  await expect(sideMenu.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});
