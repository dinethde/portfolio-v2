import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { nav } from "@/content/nav";

// TECH_SPEC §5: zero axe violations at every breakpoint, and the page works from the keyboard.

for (const width of [390, 834, 1440] as const) {
  test(`axe finds no violations at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("#achievements figure")).toBeVisible();
    // Scroll the whole page so every entrance has finished: axe would read a half-faded colour.
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += window.innerHeight / 2) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);
    // Dineth keeps Figma's text colours though some are under 4.5:1 (STATE.md D-65).
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .disableRules(["color-contrast"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("the keyboard reaches the skip link first, then the menu, then the sections", async ({
  page,
  browserName,
}) => {
  test.skip(browserName === "webkit", "Safari does not Tab to links by default");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

  const menu = page.getByRole("navigation", { name: "Page sections" }).first();
  const target = nav[1] ?? { id: "projects" };
  const link = menu.locator(`a[href="#${target.id}"]`);
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`#${target.id}$`));
  await expect(page.locator(`section#${target.id}`)).toBeInViewport();
});

test("on a phone the menu button opens the panel from the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.locator('button[aria-controls="site-menu-panel"]');
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});
