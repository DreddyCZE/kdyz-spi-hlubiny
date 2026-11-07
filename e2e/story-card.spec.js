import { test, expect } from '@playwright/test';

test('story art and outcome placeholders never disclose consequence text before roll', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#cardArt')).toBeVisible();
  const first = page.locator('#choices button:not([disabled])').first();
  await first.click();
  await expect(page.locator('#outcomes')).toBeVisible();
  await expect(page.locator('#outcomes .outcome-slot')).toHaveCount(6);
  await expect(page.locator('#reveal')).toBeHidden();
  await page.locator('#roll').click();
  await expect(page.locator('#outcomes')).toBeHidden();
  await expect(page.locator('#reveal')).toBeVisible();
});
