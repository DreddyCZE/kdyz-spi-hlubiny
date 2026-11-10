import {test,expect} from '@playwright/test';
// Existing journey tests begin with the default detective; dedicated selection tests cover the chooser.
test.beforeEach(async ({page}) => {
  await page.goto('./');
  const choose=page.getByRole('button',{name:/^Detektiv · HP 6 \/ SAN 8/});
  if(await choose.isVisible())await choose.click();
});

// Current scenario UX: a dice test is first rolled, then accepted or rerolled.
// These checks intentionally exercise the active scenario, not the old v4 prototype.
test('scenario dice confirmation, persistence and reload',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Math.random=()=>0.5;});
 await page.goto('./');
 await expect(page.locator('#deckName')).not.toBeEmpty();
 await page.locator('#draw').click();
 await expect(page.locator('#choices button').first()).toBeVisible();
 await page.locator('#choices button').first().click();
 const isTest=await page.locator('#roll').textContent();
 await page.locator('#roll').click();
 if(isTest.includes('Hodit')){
  await expect(page.getByRole('button',{name:'Přijmout výsledek'})).toBeVisible();
  await expect(page.locator('#reveal')).toBeEmpty();
  const key=await page.evaluate(()=>Object.keys(localStorage).find(k=>k.startsWith('hlubiny-scenario-v1-')));
  expect(key).toBeTruthy();
  const before=await page.evaluate(k=>localStorage.getItem(k),key);
  await page.reload();
  await expect(page.getByRole('button',{name:'Přijmout výsledek'})).toBeVisible();
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(before);
  await page.getByRole('button',{name:'Přijmout výsledek'}).click();
  await expect(page.locator('#reveal')).not.toBeEmpty();
 }
 expect(errors).toEqual([]);
});

test('next round advances scenario clock and persists after reload',async({page})=>{
 await page.goto('./');
 const before=Number(await page.locator('#round').textContent());

 await page.locator('#endRound').click();
 await expect(page.locator('#round')).toHaveText(String(before+1));
 await expect(page.locator('#ap')).toHaveText('3');
 const key=await page.evaluate(()=>Object.keys(localStorage).find(k=>k.startsWith('hlubiny-scenario-v1-')));
 expect(key).toBeTruthy();
 const saved=await page.evaluate(k=>localStorage.getItem(k),key);
 await page.reload();
 await expect(page.locator('#round')).toHaveText(String(before+1));
 expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(saved);
});
