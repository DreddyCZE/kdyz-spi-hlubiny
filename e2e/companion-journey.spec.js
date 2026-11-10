import {test,expect} from '@playwright/test';
// Existing journey tests begin with the default detective; dedicated selection tests cover the chooser.
test.beforeEach(async ({page}) => {
  await page.goto('./');
  const choose=page.getByRole('button',{name:/^Detektiv · HP 6 \/ SAN 8/});
  if(await choose.isVisible())await choose.click();
});

import {blackwaterContent as data} from '../src/engine/content.js';
const key='hlubiny-scenario-v1-blackwater-bells';
for(const mode of ['dog','solo','unknown'])test(`complete companion investigation through UI: ${mode}`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{Math.random=()=>0.999;});await page.goto('./');
 const state=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 const afford=async n=>{if(Number(await page.locator('#ap').textContent())<n)await page.locator('#endRound').click();};
 const move=async name=>{await afford(1);await page.getByRole('button',{name:'◇ '+name,exact:true}).click();};
 const resolve=async choice=>{
  await afford(choice.apCost);await page.locator('#choices button').filter({hasText:choice.label}).click();
  await expect(page.locator('#reveal')).toBeEmpty();await page.locator('#roll').click();
  if(choice.test){await expect(page.getByRole('button',{name:'Přijmout výsledek',exact:true})).toBeVisible();await expect(page.locator('#reveal')).toBeEmpty();await page.getByRole('button',{name:'Přijmout výsledek',exact:true}).click();}
  await expect(page.locator('#reveal')).not.toBeEmpty();await page.locator('#next').click();
 };
 const seek=async id=>{for(let n=0;n<35;n++){
  await page.locator('#draw').click();const s=await state(),c=data.byId[s.game.drawnCards[s.game.locationId]];
  if(c.id===id)return c;
  await resolve([...c.choices].sort((a,b)=>a.apCost-b.apCost)[0]);
 }throw new Error('Unreachable '+id);};
 if(mode==='dog'){
  await move('Staré město');await page.getByRole('button',{name:'Přijmout společníka'}).click();await page.getByRole('button',{name:'Použít: Zachytit stopu'}).click();
  const c=await seek('bw-dog-trail');await resolve(c.choices[0]);const before=await state();await page.reload();expect(await state()).toEqual(before);
  await expect(page.locator('#scenario-companions')).toContainText('Doprovází tě');
 }
 if(mode!=='unknown'){
  await move('Maják');const c=await seek(mode==='dog'?'bw-lighthouse-dog-trail':'bw-lighthouse-salt');await resolve(c.choices[0]);expect((await state()).game.flags['salt-route-known']).toBe(true);
 }
 await move('Jeskyně');const cave=await seek('bw-cave-service-route');
 const known=page.locator('#choices button').filter({hasText:'Využít zaznamenanou servisní cestu'});
 if(mode==='unknown'){
  await expect(known).toHaveCount(0);await page.evaluate(()=>{Math.random=()=>0;});await resolve(cave.choices[1]);
  expect((await state()).game.flags['cave-service-route-used']).toBeUndefined();await move('Knihovna');await page.locator('#draw').click();await expect(page.locator('#choices button').first()).toBeVisible();
 }else{await expect(known).toBeVisible();await resolve(cave.choices[0]);expect((await state()).game.flags['cave-service-route-used']).toBe(true);}
 expect((await state()).game.round).toBeLessThanOrEqual(12);expect(errors).toEqual([]);
});
