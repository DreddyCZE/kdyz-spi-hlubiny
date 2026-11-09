import {test,expect} from '@playwright/test';
for(const width of [1440,320])test(`dockside conflict has four approaches and persists its result at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{Math.random=()=>0.99;});
 await page.goto('./');await page.getByRole('button',{name:/^Detektiv · HP 6 \/ SAN 8/}).click();
 for(let i=0;i<3;i++){
  await page.locator('#draw').click();await page.locator('#roll').click();
  const accept=page.getByRole('button',{name:'Přijmout výsledek',exact:true});
  if(await accept.isVisible())await accept.click();
  await expect(page.locator('#reveal')).not.toBeEmpty();await page.locator('#next').click();
 }
 await page.locator('#endRound').click();await page.locator('#draw').click();
 await expect(page.locator('#cardTitle')).toHaveText('Hlídač u řetězu');
 await expect(page.locator('#choices button')).toHaveCount(4);
 await page.getByRole('button',{name:/^Prostředí: uvolnit brzdu/}).click();
 await page.locator('#roll').click();await expect(page.locator('#reveal')).toBeEmpty();
 await page.reload();await expect(page.getByRole('button',{name:'Přijmout výsledek',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Přijmout výsledek',exact:true}).click();
 await expect(page.locator('#reveal')).toContainText('Zajistíš kliku');
 await expect(page.locator('#ap')).toHaveText('2');
 await page.reload();await expect(page.locator('#reveal')).toContainText('Zajistíš kliku');
 await expect(page.locator('#ap')).toHaveText('2');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
