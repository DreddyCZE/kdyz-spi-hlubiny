import { test, expect } from '@playwright/test';
import { cards } from '../src/data/cards.js';

test('explicit draw animates once, locks controls and preserves keyboard focus', async ({ page }) => {
  await page.goto('./');
  await page.locator('#draw').focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('#card')).toHaveClass(/motion-card-draw/);
  await expect(page.locator('#cardTitle')).toBeFocused();
  await expect(page.locator('#draw')).toBeDisabled();
  const savedAfterDraw = await page.evaluate(() => localStorage.getItem('hlubiny-v4'));
  await page.evaluate(() => {
    document.querySelector('#draw').onclick();
    document.querySelector('#draw').onclick();
  });
  expect(await page.evaluate(() => localStorage.getItem('hlubiny-v4'))).toBe(savedAfterDraw);
  await expect(page.locator('#choices button').first()).toBeEnabled();
});

test('dice animation keeps every outcome hidden until only the achieved result is revealed', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => .5; });
  await page.goto('./');
  await page.locator('#draw').click();
  await page.locator('#choices button').first().click();

  const outcomeTexts = [...new Set(cards.find(card => card.id === '0-0')
    .choices.flatMap(choice => Object.values(choice.outcomes).map(outcome => outcome.text)))];
  await page.locator('#roll').click();
  await expect(page.locator('#die1')).toHaveClass(/motion-dice-roll/);
  await expect(page.locator('#reveal')).toBeEmpty();
  const duringRoll = await page.locator('body').innerHTML();
  for (const text of outcomeTexts) expect(duringRoll).not.toContain(text);

  await expect(page.locator('#reveal')).toHaveText('Úspěch — Najdeš deník zmizelého rybáře.');
  const afterReveal = await page.locator('body').innerHTML();
  for (const text of outcomeTexts.filter(text => text !== 'Najdeš deník zmizelého rybáře.')) {
    expect(afterReveal).not.toContain(text);
  }
});

for (const width of [1440, 390, 320]) {
  test(`motion presentation fits ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await page.locator('#draw').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#cardTitle')).toBeFocused();
    await expect(page.locator('#card')).not.toHaveClass(/motion-card-draw/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`motion-${width}.png`), fullPage: true });
  });
}
