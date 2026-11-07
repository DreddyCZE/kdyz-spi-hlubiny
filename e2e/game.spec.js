import { test, expect } from '@playwright/test';

test('rozhodnutí → hod → jediný následek → reload bez opakované odměny', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Deterministic 4+4; exercise the real browser UI without replacing game logic.
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'KDYŽ SPÍ HLUBINY', exact: true })).toBeVisible();
  await expect(page.locator('#cardTitle')).toHaveText('Ztracená loď');
  await expect(page.locator('#ap')).toHaveText('3');
  await expect(page.locator('#reveal')).toBeEmpty();
  await expect(page.locator('#outcomes')).toBeEmpty();
  const decision = page.getByRole('button', { name: /^Vstoupit bez váhání/ });
  await decision.click();
  await expect(decision).toHaveAttribute('aria-pressed', 'true');
  // Browser clock lets us inspect the animation without timing-dependent sleeps.
  await page.clock.install();
  await page.getByRole('button', { name: '🎲 Hodit kostkami', exact: true }).click();
  await expect(page.locator('#roll')).toBeDisabled();
  await expect(page.locator('#endRound')).toBeDisabled();
  await expect(page.locator('#reveal')).toBeEmpty();
  await expect(page.locator('#ap')).toHaveText('2');
  await page.clock.fastForward(1000);
  const reveal = page.locator('#reveal');
  await expect(reveal).toBeVisible();
  await expect(reveal).toHaveText('Úspěch — Najdeš deník zmizelého rybáře.');
  await expect(page.locator('#sum')).toHaveText('4 + 4 + 2 + 0 = 10 proti obtížnosti 8');
  await expect(page.locator('#inventory')).toHaveText('Deník');
  const saved = await page.evaluate(() => localStorage.getItem('hlubiny-v2'));
  await page.reload();
  await expect(reveal).toHaveText('Úspěch — Najdeš deník zmizelého rybáře.');
  await expect(page.locator('#ap')).toHaveText('2');
  await expect(page.locator('#inventory')).toHaveText('Deník');
  await expect(page.locator('#roll')).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('hlubiny-v2'))).toBe(saved);
  await page.screenshot({ path: testInfo.outputPath('game-after-reload.png'), fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Další karta', exact: true }).click();
  await expect(page.locator('#cardTitle')).toHaveText('Muž z mlhy');
  await expect(page.locator('#reveal')).toBeEmpty();
  expect(errors).toEqual([]);
});
