import { expect, test } from "@playwright/test";

// Run through `bun run lab:shot <id>`, which starts the dev server and sets LAB_ID. The lab is a
// 404 in production, so a normal e2e run skips this spec.

const id = process.env.LAB_ID ?? "";
const outDir = process.env.LAB_OUT ?? "tests/visual/out";
const widths = [390, 834, 1440];

test.skip(!id, "only runs through bun run lab:shot <id>");

for (const width of widths) {
  test(`lab ${id} at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/lab?only=${encodeURIComponent(id)}`);
    const entry = page.locator(`#lab-${id}`);
    await expect(entry).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await entry.screenshot({ path: `${outDir}/${id}-${width}.png`, animations: "disabled" });
  });
}
