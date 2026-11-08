import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {scenarioSaveKey} from '../src/engine/scenario-storage.js';
import { test, expect } from '@playwright/test';
import { cards } from '../src/data/cards.js';
import { storyArt } from '../src/data/story-art.js';

test('story artwork resolves as an actual local WebP asset', async ({ page }) => {
  await page.goto('./');
    await page.locator('#draw').click();
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
  await page.addInitScript(() => { Math.random = () => .5; });
  await page.goto('./');
    await page.locator('#draw').click();
  await page.clock.install();
  await expect(page.locator('#cardArt')).toBeVisible();
  const first = page.locator('#choices button:not([disabled])').first();
  await first.click();
  await expect(page.locator('#outcomes')).toBeVisible();
  await expect(page.locator('#outcomes .outcome-slot')).toHaveCount(6);
  await expect(page.locator('#outcomes')).not.toContainText('Najdeš deník');
  const hiddenTexts = [...new Set(cards.find(c => c.id === '0-0').choices.flatMap(c => Object.values(c.outcomes).map(o => o.text)))];
  const assertConcealed = async () => {
    const html = await page.locator('body').innerHTML();
    for (const text of hiddenTexts) expect(html).not.toContain(text);
    expect(html).not.toContain('addEvidence');
    expect(html).not.toContain('modifyStat');
  };
  await assertConcealed();
  await expect(page.locator('#reveal')).toBeHidden();
  await page.locator('#roll').click();
  await assertConcealed();
  await expect(page.locator('#reveal')).toBeEmpty();
  await page.clock.fastForward(1000);
  await expect(page.getByRole('button',{name:'Přijmout výsledek'})).toBeVisible();
  await page.getByRole('button',{name:'Přijmout výsledek'}).click();
  await expect(page.locator('#outcomes')).toBeHidden();
  await expect(page.locator('#reveal')).toHaveText('Úspěch — Najdeš deník zmizelého rybáře.');
  for (const text of hiddenTexts.filter(t => t !== 'Najdeš deník zmizelého rybáře.')) {
    expect(await page.locator('body').innerHTML()).not.toContain(text);
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 844 }]) {
  test(`story card responsive layout ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('./');
    await page.locator('#draw').click();
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

 test('all registered artwork decodes below the Pages subdirectory', async ({ page }) => {
  await page.goto('./');
    await page.locator('#draw').click();
  for (const path of new Set([storyArt.fallback, ...Object.values(storyArt.byCardId)])) {
    const response = await page.request.get(new URL(path, page.url()).href);
    expect(response.status()).toBe(200);
    const bytes = await response.body();
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    const size = await page.evaluate(async path => {
      const image = new Image(); image.src = path; await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    }, path);
    expect(size[0]).toBeGreaterThan(0);
    expect(size[1]).toBeGreaterThan(0);
  }
});

test('reduced motion, keyboard focus and immediate persisted result', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { Math.random = () => .5; });
  await page.goto('./');
    await page.locator('#draw').click();
  await page.locator('#choices button').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#choices button').first()).toBeFocused();
  const outline = await page.locator('#choices button').first().evaluate(el => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
  await page.locator('#roll').focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button',{name:'Přijmout výsledek'}).click();
  await expect(page.locator('#reveal')).toBeVisible();
  const saved = await page.evaluate(key => localStorage.getItem(key),scenarioSaveKey(blackwaterScenario));
  await page.reload();
  await expect(page.locator('#reveal')).toBeVisible();
  await expect(page.locator('#roll')).toBeDisabled();
  expect(await page.evaluate(key => localStorage.getItem(key),scenarioSaveKey(blackwaterScenario))).toBe(saved);
});

test('actual Old Town choice has five reachable tiers rather than six', async ({ page }) => {
  await page.goto('./');
    await page.locator('#draw').click();
  await page.locator('[data-location-id="location-1"]').click();
  await page.locator('#draw').click();
  await expect(page.locator('#cardTitle')).toHaveText('Obálka pod prahem');
  await expect(page.locator('#outcomes .outcome-slot')).toHaveCount(5);
  await page.locator('#choices button').nth(1).click();
  await expect(page.locator('#outcomes .outcome-slot')).toHaveCount(6);
});
