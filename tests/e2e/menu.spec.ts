import { expect, test } from "@playwright/test";

// The phone menu, driven in the component lab. The lab is a 404 in a production build, so these
// specs skip there and run against `bun run dev` (which `bun run lab:shot` also uses).

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/lab?only=menu-mobile");
  test.skip(response?.status() === 404, "the lab only exists in dev");
});

function parts(page: import("@playwright/test").Page) {
  return {
    trigger: page.locator('button[aria-controls="site-menu-panel"]'),
    panel: page.locator("#site-menu-panel"),
  };
}

test("the pill opens the panel with links and contact rows", async ({ page }) => {
  const { trigger, panel } = parts(page);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: "Story so far" })).toBeVisible();
  await expect(panel.getByRole("link", { name: /Send an email/ })).toBeVisible();
});

test("Esc closes the panel and returns focus to the pill", async ({ page }) => {
  const { trigger, panel } = parts(page);
  await trigger.click();
  await expect(panel.getByRole("link", { name: "Achievements" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("an outside click closes the panel", async ({ page }) => {
  const { trigger, panel } = parts(page);
  await trigger.click();
  await page.getByTestId("menu-stage").click({ position: { x: 4, y: 4 } });
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("a link click closes the panel and returns focus to the pill", async ({ page }) => {
  const { trigger, panel } = parts(page);
  await trigger.click();
  await panel.getByRole("link", { name: "Projects" }).click();
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Tab stays inside the open menu", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "Safari does not Tab to links by default");
  const { trigger, panel } = parts(page);
  await trigger.click();
  for (let i = 0; i < 12; i += 1) await page.keyboard.press("Tab");
  const inside = await page.evaluate(
    () =>
      document.querySelector("#site-menu-panel")?.contains(document.activeElement) ||
      document.activeElement?.getAttribute("aria-controls") === "site-menu-panel",
  );
  expect(inside).toBe(true);
  await expect(panel).toBeVisible();
});
