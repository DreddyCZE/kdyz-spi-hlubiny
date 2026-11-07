import { test, expect } from '@playwright/test';

test('story artwork resolves as an actual local WebP asset', async ({ page }) => {
  await page.goto('./');
  const art = page.locator('#cardArt');
  await expect(art).toBeVisible();
  const background = await art.evaluate(el => getComputedStyle(el).backgroundImage);
  const url = background.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
  expect(url).toBeTruthy();
  const response = await page.request.get(new URL(url, page.url()).href);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/image\/webp/);
  const bytes = await response.body();
  expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
  expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
});

test('story art and outcome placeholders never disclose consequence text before roll', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#cardArt')).toBeVisible();
  const first = page.locator('#choices button:not([disabled])').first();
  await first.click();
  await expect(page.locator('#outcomes')).toBeVisible();
  await expect(page.locator('#outcomes .outcome-slot')).toHaveCount(6);
  await expect(page.locator('#outcomes')).not.toContainText('Najdeš deník');
  await expect(page.locator('#reveal')).toBeHidden();
  await page.locator('#roll').click();
  await expect(page.locator('#outcomes')).toBeHidden();
  await expect(page.locator('#reveal')).toBeVisible();
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 844 }]) {
  test(`story card responsive layout ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('./');
    const art = page.locator('#cardArt');
    await expect(art).toBeVisible();
    const bounds = await art.boundingBox();
    expect(bounds).toBeTruthy();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#choices button:not([disabled])').first().click();
    await expect(page.locator('#outcomes .outcome-slot')).toHaveCount(6);
    await page.screenshot({ path: testInfo.outputPath(`story-card-${viewport.width}.png`), fullPage: true });
  });
}
