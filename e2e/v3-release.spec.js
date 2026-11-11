import {test,expect} from '@playwright/test';

for(const [width,height] of [[1920,1080],[1440,900],[1280,720],[390,844],[320,700]]){
 test(`V3 release screens ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width,height});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{Math.random=()=>.99;});
  await page.goto('./index.html?ui=v3');
  const shot=async name=>{
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   for(const dialog of await page.locator('dialog[open]').all()){
    expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Dialog must not clip controls horizontally').toBe(true);
   }
   await page.screenshot({path:`test-results/blackwater-v3-${width}-${name}.png`,animations:'disabled',fullPage:!await page.locator('dialog[open]').count()});
  };
  await shot('selection');
  await page.locator('.v3-investigator-setup button').first().click();
  const dismiss=page.getByRole('button',{name:'Vypnout nápovědy',exact:true});
  if(await dismiss.isVisible())await dismiss.click();
  await shot('map');
  await page.locator('.v3-location-actions').getByRole('button',{name:/Prozkoumat/}).click();
  await page.locator('#draw').click();
  await shot('card');
  await page.locator('#choices button').first().click();
  await page.locator('#roll').click();
  await expect(page.locator('#reveal')).toBeEmpty();
  await expect(page.getByRole('button',{name:'Přijmout výsledek',exact:true})).toBeVisible();
  await shot('dice');
  await page.getByRole('button',{name:'Přijmout výsledek',exact:true}).click();
  await expect(page.locator('#reveal')).not.toBeEmpty();
  await expect(page.locator('.v3-changes')).toContainText('AP -1');
  await shot('result');
  await page.locator('#next').click();
  await page.locator('#v3-story-dialog').getByRole('button',{name:'Zpět na mapu',exact:true}).click();
  await page.locator('[data-location-id="location-2"]').click();
  await page.locator('.v3-location-actions').getByRole('button',{name:/Prozkoumat/}).click();
  await page.getByRole('button',{name:'Střetnutí: Mlžný pes · 1 AP',exact:true}).click();
  await expect(page.locator('#v3-combat-dialog')).toBeVisible();
  await shot('combat');
  await page.locator('[data-combat-move="attack"]').click();
  await expect(page.locator('#v3-combat-dialog')).toHaveClass(/v3-battle-finished/);
  await shot('combat-result');
  await page.locator('#v3-battle-close').click();
  await page.locator('.v3-hud').getByRole('button',{name:/Vybavení/}).click();
  await shot('inventory');
  await page.locator('[data-dossier-target="investigation-journal"]').click();
  await shot('journal');
  await page.locator('#closeDetails').click();
  await page.locator('.v3-location-actions').getByRole('button',{name:/Ukončit kolo/}).click();
  await expect(page.locator('#v3-round-dialog')).toBeVisible();
  await shot('round');
  expect(errors).toEqual([]);
 });
}

test('illustrated reference screen for V3 audit',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('./blackwater.html');
 await page.screenshot({path:'test-results/blackwater-v3-reference-illustrated.png',fullPage:true});
 await page.getByRole('button',{name:/^Detektiv /}).click();
 await page.screenshot({path:'test-results/blackwater-v3-reference-map.png'});
 await page.locator('#draw').click();
 await page.screenshot({path:'test-results/blackwater-v3-reference-card.png'});
});
