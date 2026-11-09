import {test,expect} from '@playwright/test';
for(const width of [1440,390,320])for(const legacy of [false,true]){
 test(`public rules at ${width}px in ${legacy?'legacy':'scenario'} mode preserve save`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('./'+(legacy?'?mode=legacy':''));
  const before=await page.evaluate(()=>JSON.stringify({...localStorage}));
  await page.getByRole('button',{name:'Jak se hraje',exact:true}).click();
  const panel=page.locator('#rules-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(legacy?'nejvýše 7 kol':'nejvýše 12 kol');
  await expect(panel).toContainText('2k6');
  await expect(panel).not.toContainText('eye');
  expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).toBe(before);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.keyboard.press('Escape');await expect(page.locator('#details')).not.toBeVisible();
  expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).toBe(before);
 });
}
