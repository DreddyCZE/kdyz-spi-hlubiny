import { test, expect } from '@playwright/test';

const openJournal = page => page.getByRole('button', { name: 'Deník · důkazy', exact: true }).click();
const tab = (page, name) => page.getByRole('tab', { name: new RegExp('^' + name + ' · ') });
const saved = page => page.evaluate(() => localStorage.getItem('hlubiny-v3'));

async function acquireEvidence(page) {
  await page.addInitScript(() => { Math.random = () => .5; });
  await page.goto('./');
  await page.clock.install();
  for (let i = 0; i < 2; i++) {
    await page.locator('#roll').click();
    await page.clock.fastForward(1000);
    await expect(page.locator('#reveal')).toBeVisible();
    if (!i) await page.locator('#next').click();
  }
}

test('empty journal, all tabs, keyboard navigation and opening leave save untouched', async ({ page }) => {
  await page.goto('./');
  const pristine = await saved(page);
  await openJournal(page);
  await tab(page, 'Kronika').click();
  await page.keyboard.press('Escape');
  expect(await saved(page)).toBe(pristine);
  await expect(page.locator('#ap')).toHaveText('3');
  await page.locator('#choices button').first().click(); // Persist a real state/revision.
  const before = await saved(page);
  await openJournal(page);
  await expect(page.getByRole('heading', { name: 'Vyšetřovací deník', exact: true })).toBeVisible();
  await expect(tab(page, 'Důkazy')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#journal-evidence')).toContainText('Zatím nemáš');
  await tab(page, 'Důkazy').focus();
  await page.keyboard.press('ArrowRight');
  await expect(tab(page, 'Znalosti')).toBeFocused();
  await expect(tab(page, 'Znalosti')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#journal-knowledge')).toBeVisible();
  await page.keyboard.press('End');
  await expect(tab(page, 'Kronika')).toBeFocused();
  await expect(page.locator('#journal-chronicle')).toContainText('Vyšetřování začíná');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowLeft');
  await expect(tab(page, 'Kronika')).toBeFocused();
  await tab(page, 'Dedukce').click();
  await expect(page.locator('#journal-available')).toContainText('Žádné další propojení');
  await expect(page.locator('#deduce')).toBeDisabled();
  const html = await page.locator('#investigation-journal').innerHTML();
  for (const secret of ['Spojení s majákem', 'Kam vedou stopy', 'Najdeš deník', 'addEvidence', 'outcomes', 'unlockChoice']) expect(html).not.toContain(secret);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Deník · důkazy', exact: true })).toBeFocused();
  expect(await saved(page)).toBe(before);
  expect(JSON.parse(await saved(page))).toEqual(JSON.parse(before));
});

test('acquired evidence, available/completed deduction, chronology and reload use real data', async ({ page }) => {
  await acquireEvidence(page);
  const before = await saved(page);
  await openJournal(page);
  await expect(tab(page, 'Důkazy')).toHaveText('Důkazy · 2');
  await expect(page.locator('#journal-evidence')).toContainText('Deník');
  await tab(page, 'Dedukce').click();
  await expect(page.locator('#journal-available')).toContainText('Kam vedou stopy');
  await expect(page.locator('#journal-available')).toContainText('Požadavky splněny');
  await expect(page.locator('#journal-knowledge')).not.toContainText('Spojení s majákem');
  expect(await saved(page)).toBe(before);
  await page.locator('#deduce').click(); // Only this explicit action changes game state.
  await expect(page.locator('#journal-deductions')).toContainText('Vyhodnoceno');
  await expect(tab(page, 'Dedukce')).toHaveText('Dedukce · 1');
  await tab(page, 'Znalosti').click();
  await expect(page.locator('#journal-knowledge')).toContainText('Spojení s majákem');
  const after = await saved(page);
  expect(JSON.parse(after).ap).toBe(JSON.parse(before).ap);
  expect(JSON.parse(after).revision).toBe(JSON.parse(before).revision + 1);
  await tab(page, 'Kronika').click();
  await expect(page.locator('#journal-chronicle li').first()).toContainText('Vyšetřování začíná');
  await expect(page.locator('#journal-chronicle')).toContainText('Ztracená loď: Úspěch');
  await page.reload();
  await page.getByRole('button', { name: 'Znalosti', exact: true }).click();
  await expect(page.locator('#journal-knowledge')).toBeFocused();
  await expect(page.locator('#journal-knowledge')).toContainText('Spojení s majákem');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Dedukce', exact: true }).click();
  await expect(page.locator('#journal-deductions')).toBeFocused();
  await expect(page.locator('#journal-deductions')).toContainText('Kam vedou stopy');
  await expect(page.locator('#deduce')).toBeDisabled();
  expect(await saved(page)).toBe(after);
});

test('journal renders foreign text literally and ignores private fields', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    const { createJournal } = await import('./src/ui/journal.js');
    const anchor = document.createElement('div'); document.body.append(anchor);
    const journal = createJournal(anchor, () => {});
    // Remove the normal panel to keep IDs unique in this isolated renderer test.
    document.querySelector('#investigation-journal').remove();
    const section = anchor.nextElementSibling; section.hidden = false;
    journal.render({ evidence: [{ name: '<img src=x onerror="window.injected=true">', description: '<script>bad()</script>', effects: 'SECRET EFFECT', conditions: 'SECRET CONDITION' }], knowledge: [], deductions: [], available: [] }, false, ['<b>zápis</b>']);
  });
  await expect(page.locator('#journal-evidence')).toContainText('<img src=x');
  await expect(page.locator('#journal-evidence img, #journal-evidence script')).toHaveCount(0);
  expect(await page.locator('#investigation-journal').innerHTML()).not.toContain('SECRET');
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
});

for (const width of [1440, 390, 320]) {
  test(`journal responsive and reduced motion ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await acquireEvidence(page);
    await openJournal(page);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(tab(page, 'Důkazy')).toHaveText('Důkazy · 2');
    for (const name of ['Důkazy', 'Znalosti', 'Dedukce', 'Kronika']) {
      await tab(page, name).click();
      const bounds = await tab(page, name).boundingBox();
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(await page.locator('#details').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await tab(page, 'Důkazy').focus();
    await page.keyboard.press('Enter');
    expect(await tab(page, 'Důkazy').evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
    expect(await tab(page, 'Důkazy').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
    const path = testInfo.outputPath(`journal-${width}.png`);
    await page.screenshot({ path });
    await testInfo.attach(`Vyšetřovací deník ${width}px`, { path, contentType: 'image/png' });
    await tab(page, 'Dedukce').click();
    await page.locator('#deduce').click();
    await tab(page, 'Znalosti').click();
    await page.screenshot({ path: testInfo.outputPath(`journal-knowledge-${width}.png`) });
  });
}
