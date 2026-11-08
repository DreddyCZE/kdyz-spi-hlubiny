import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {scenarioSaveKey} from '../src/engine/scenario-storage.js';
import { test, expect } from '@playwright/test';

test('rozhodnutí → hod → jediný následek → reload bez opakované odměny', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Deterministic 4+4; exercise the real browser UI without replacing game logic.
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.goto('./');
    await page.locator('#draw').click();
  await expect(page.getByRole('heading', { name: 'KDYŽ SPÍ HLUBINY', exact: true })).toBeVisible();
  await expect(page.locator('#cardTitle')).toHaveText('Ztracená loď');
  await expect(page.locator('#ap')).toHaveText('3');
  await expect(page.locator('#reveal')).toBeEmpty();
  await expect(page.locator('#outcomes .outcome-slot')).toHaveCount(6);
  await expect(page.locator('#outcomes')).not.toContainText('Najdeš deník');
  const decision = page.getByRole('button', { name: /^Vstoupit bez váhání/ });
  await decision.click();
  await expect(decision).toHaveAttribute('aria-pressed', 'true');
  // Browser clock lets us inspect the animation without timing-dependent sleeps.
  await page.clock.install();
  await page.getByRole('button', { name: '🎲 Hodit kostkami', exact: true }).click();
  await expect(page.locator('#roll')).toBeDisabled();
  await expect(page.locator('#endRound')).toBeDisabled();
  await expect(page.locator('#reveal')).toBeEmpty();
  await expect(page.locator('#ap')).toHaveText('3');
  await page.clock.fastForward(1000);
  await page.getByRole('button',{name:'Přijmout výsledek'}).click();
  const reveal = page.locator('#reveal');
  await expect(reveal).toBeVisible();
  await expect(reveal).toHaveText('Úspěch — Najdeš deník zmizelého rybáře.');
  await expect(page.locator('#sum')).toHaveText('4 + 4 + 2 + 0 = 10 proti obtížnosti 8');
  await expect(page.locator('#inventory')).toHaveText('Deník');
  const saved = await page.evaluate(() => localStorage.getItem(scenarioSaveKey(blackwaterScenario)));
  await page.reload();
  await expect(reveal).toHaveText('Úspěch — Najdeš deník zmizelého rybáře.');
  await expect(page.locator('#ap')).toHaveText('2');
  await expect(page.locator('#inventory')).toHaveText('Deník');
  await expect(page.locator('#roll')).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem(scenarioSaveKey(blackwaterScenario)))).toBe(saved);
  await page.screenshot({ path: testInfo.outputPath('game-after-reload.png'), fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Pokračovat', exact: true }).click();
      await page.locator('#draw').click();
  await expect(page.locator('#cardTitle')).toHaveText('Muž z mlhy');
  await expect(page.locator('#reveal')).toBeEmpty();
  expect(errors).toEqual([]);
});

for (const { label, random, reward } of [
  { label: 'běžný úspěch', random: 0.5, reward: 'Deník' },
  { label: 'velký úspěch', random: 0.7, reward: 'Deník a přívěsek' },
  { label: 'kritický úspěch', random: 0.99, reward: 'Deník a přívěsek' },
]) {
  test(`porovnání poznámky s deníkem po odměně: ${label}`, async ({ page }) => {
    await page.addInitScript(value => { Math.random = () => value; }, random);
    await page.goto('./');
    await page.locator('#draw').click();
    await page.clock.install();
    for (const title of ['Ztracená loď', 'Muž z mlhy']) {
      await expect(page.locator('#cardTitle')).toHaveText(title);
      await page.getByRole('button', { name: '🎲 Hodit kostkami', exact: true }).click();
      await page.clock.fastForward(1000);
      await page.getByRole('button',{name:'Přijmout výsledek'}).click();
      await expect(page.locator('#reveal')).toBeVisible();
      if (title === 'Ztracená loď') await expect(page.locator('#inventory')).toHaveText(reward);
      await page.getByRole('button', { name: 'Pokračovat', exact: true }).click();
      await page.locator('#draw').click();
    }
    // Reload before the decision to cover the saved composite item in the actual UI.
    await page.reload();
    await expect(page.locator('#cardTitle')).toHaveText('Poznámka na molu');
    const copy = page.getByRole('button', { name: /^Porovnat ji s deníkem/ });
    await expect(copy).toBeEnabled();
    await copy.click();
    await page.getByRole('button', { name: 'Provést rozhodnutí', exact: true }).click();
    await expect(page.locator('#reveal')).toHaveText('Úspěch — Porovnáním s deníkem získáš čitelný opis poznámky.');
    await expect(page.locator('#inventory')).toContainText('Opis poznámky');
    await expect(page.locator('#ap')).toHaveText('0');
    await expect(page.locator('#roll')).toBeDisabled();
    // The active scenario performs deduction automatically when evidence is obtained.
    await expect(page.locator('#journal-evidence')).toContainText('Deník');
    await page.getByRole('button', { name: 'Deník · důkazy', exact: true }).click();
    await expect(page.locator('#journal-knowledge')).toContainText('Spojení s majákem');
    await expect(page.locator('#journal-deductions')).toContainText('Kam vedou stopy');
    await expect(page.locator('#deduce')).toBeDisabled();
    await page.reload();
    await expect(page.locator('#journal-knowledge')).toContainText('Spojení s majákem');
    await expect(page.locator('#journal-deductions p')).toHaveCount(1);
    await expect(page.locator('#ap')).toHaveText('0');
    await expect(page.locator('#deduce')).toBeDisabled();
  });
}
