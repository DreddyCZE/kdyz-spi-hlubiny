import {test,expect} from '@playwright/test';
import {journey} from './helpers/story-journey.js';

for(const investigator of ['Detektiv','Okultistka','Námořník']){
 for(const [id,title] of [['quiet-sea','Tiché moře'],['broken-bell','Zlomený zvon'],['voice-price','Cena hlasu']]){
  test(`V3 ${investigator}: real evidence, puzzles and ${id}`,async({page})=>{
   test.setTimeout(120000);
   await page.setViewportSize({width:investigator==='Námořník'?320:1440,height:900});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await journey(page,{v3:true,investigator});
   await page.getByRole('button',{name:'Dokončit scénář: '+title,exact:true}).click();
   await expect(page.locator('#gameStatus')).toContainText(title);
   await expect(page.locator('#scenario-finale-actions')).toContainText('Samuel Reed a zachránění');
   await page.screenshot({path:`test-results/blackwater-v3-ending-${id}-${investigator}.png`});
   await page.reload();
   await expect(page.locator('#v3-story-dialog')).toBeVisible();
   await expect(page.locator('#gameStatus')).toContainText(title);
   await expect(page.locator('#roll')).toBeDisabled();
   await expect(page.locator('#endRound')).toBeDisabled();
   expect(errors).toEqual([]);
  });
 }
}

test('V3 ability is actionable from the investigator dossier and focus returns to its opener',async({page})=>{
 await page.goto('./index.html?ui=v3');
 await page.locator('[data-investigator-id="detective"]').click();
 const opener=page.locator('.v3-hud').getByRole('button',{name:/Schopnosti/});
 await opener.click();
 const ability=page.locator('#details #scenario-ability button');
 await expect(ability).toBeEnabled();
 const ap=Number(await page.locator('#ap').textContent());
 await ability.click();
 await expect(page.locator('#ap')).toHaveText(String(ap+1));
 await expect(ability).toBeDisabled();
 await page.keyboard.press('Escape');
 await expect(opener).toBeFocused();
 await page.reload();
 await opener.click();
 await expect(ability).toBeDisabled();
});

test('V3 map keeps focus visible and equipment use keeps focus inside the dossier',async({page})=>{
 await page.goto('./index.html?ui=v3');
 await page.locator('[data-investigator-id="detective"]').click();
 await page.locator('[data-location-id="location-2"]').focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('#placeTitle')).toBeFocused();
 await page.locator('.v3-hud').getByRole('button',{name:/Vybavení/}).click();
 const salt=page.locator('[data-equipment-id="bw-salt"] button');
 await salt.focus();await page.keyboard.press('Enter');
 expect(await page.locator('#details').evaluate(el=>el.contains(document.activeElement))).toBe(true);
 await expect(page.locator('[data-equipment-id="bw-salt"]')).toHaveCount(0);
});

test('V3 occultist free reroll is public, persists pending dice and resets next round',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{Math.random=()=>.5;});
 await page.goto('./index.html?ui=v3');
 await page.locator('[data-investigator-id="occultist"]').click();
 const open=()=>page.locator('.v3-location-actions').getByRole('button',{name:/Prozkoumat/}).click();
 await open();await page.locator('#draw').click();await page.locator('#roll').click();
 await page.getByRole('button',{name:'Sebrat odvahu · přehodit za 0 SAN',exact:true}).click();
 await expect(page.locator('#san')).toHaveText('9');
 await page.reload();await open();
 await expect(page.getByRole('button',{name:/^Sebrat odvahu/})).toBeHidden();
 await expect(page.locator('#reveal')).toBeEmpty();
 await page.getByRole('button',{name:'Přijmout výsledek',exact:true}).click();
 await expect(page.locator('#reveal')).not.toBeEmpty();
 await page.locator('#v3-story-dialog').getByRole('button',{name:'Zpět na mapu',exact:true}).click();
 await page.locator('.v3-hud').getByRole('button',{name:/Schopnosti/}).click();
 await expect(page.locator('#scenario-ability')).toContainText('V tomto kole využito.');
 await page.keyboard.press('Escape');
 await page.locator('.v3-location-actions').getByRole('button',{name:/Ukončit kolo/}).click();
 await page.locator('#v3-round-dialog button').click();
 await page.locator('.v3-hud').getByRole('button',{name:/Schopnosti/}).click();
 await expect(page.locator('#scenario-ability')).not.toContainText('V tomto kole využito.');
});

test('V3 sailor protection, escape, healing ability and bandage follow actual combat state',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0;});
 await page.goto('./index.html?ui=v3');
 await page.locator('[data-investigator-id="sailor"]').click();
 await page.locator('[data-location-id="location-2"]').click();
 await page.locator('.v3-location-actions').getByRole('button',{name:/Prozkoumat/}).click();
 await page.getByRole('button',{name:'Střetnutí: Mlžný pes · 1 AP',exact:true}).click();
 await page.locator('[data-combat-move="attack"]').click();
 await expect(page.locator('#hp')).toHaveText('7');
 await page.reload();
 await expect(page.locator('#v3-combat-dialog')).toBeVisible();
 await page.locator('[data-combat-move="escape"]').click();
 await expect(page.locator('#hp')).toHaveText('6');
 await page.locator('[data-combat-move="escape"]').click();
 await expect(page.locator('#v3-combat-dialog')).toHaveClass(/v3-battle-finished/);
 await page.locator('#v3-battle-close').click();
 await page.locator('.v3-hud').getByRole('button',{name:/Schopnosti/}).click();
 const hp=Number(await page.locator('#hp').textContent());
 await page.locator('#scenario-ability button').click();
 await expect(page.locator('#hp')).toHaveText(String(hp+2));
 await page.keyboard.press('Escape');
 await page.locator('.v3-hud').getByRole('button',{name:/Vybavení/}).click();
 await page.locator('[data-equipment-id="bw-bandage"] button').click();
 await expect(page.locator('#hp')).toHaveText('7');
 await expect(page.locator('[data-equipment-id="bw-bandage"]')).toHaveCount(0);
});

test('V3 time defeat opens the epilogue instead of a new round and remains locked after reload',async({page})=>{
 await page.goto('./index.html?ui=v3');
 await page.locator('[data-investigator-id="occultist"]').click();
 for(let round=2;round<=13;round++){
  await page.locator('.v3-location-actions').getByRole('button',{name:/Ukončit kolo/}).click();
  if(round<13)await page.locator('#v3-round-dialog button').click();
 }
 await expect(page.locator('#v3-round-dialog')).not.toBeVisible();
 await expect(page.locator('#v3-story-dialog')).toBeVisible();
 await expect(page.locator('#gameStatus')).toContainText('Hlubiny odpoví');
 expect((await page.locator('#storyPanel').boundingBox()).height).toBeLessThan(400);
 await page.screenshot({path:'test-results/blackwater-v3-time-defeat.png'});
 await page.reload();
 await expect(page.locator('#gameStatus')).toContainText('Hlubiny odpoví');
 await expect(page.locator('#endRound')).toBeDisabled();
});

for(const [locationId,puzzle] of [['location-5','bw-bell-order'],['location-4','bw-missing-name'],['location-5','bw-lighthouse-signal']]){
 test(`V3 ${puzzle} fallback respects AP, charges once and survives reload`,async({page})=>{
  await page.goto('./index.html?ui=v3');
  await page.locator('[data-investigator-id="detective"]').click();
  await page.evaluate(async locationId=>{
   const {activeScenarioPack:p}=await import('./src/data/scenario-registry.js');
   const {scenarioSaveKey,saveScenarioSession}=await import('./src/engine/scenario-storage.js');
   const s=JSON.parse(localStorage.getItem(scenarioSaveKey(p.scenario)));
   s.game.ap=0;s.game.locationId=locationId;
   if(!saveScenarioSession(localStorage,s,p.scenario,p.content))throw Error('Invalid puzzle fixture');
  },locationId);
  await page.reload();
  const open=()=>page.locator('.v3-location-actions').getByRole('button',{name:/Prozkoumat/}).click();
  await open();
  const panel=page.locator(`[data-puzzle-id="${puzzle}"]`);
  const fallback=panel.getByRole('button',{name:/hrozba \+1 · 1 AP/});
  await expect(fallback).toBeDisabled();
  await page.locator('#v3-story-dialog').getByRole('button',{name:'Zpět na mapu',exact:true}).click();
  await page.locator('.v3-location-actions').getByRole('button',{name:/Ukončit kolo/}).click();
  await page.locator('#v3-round-dialog button').click();await open();
  const before=Number(await page.locator('#threat').textContent());
  await fallback.click();
  await expect(panel).toContainText('Náhradní cesta dokončena');
  await expect(page.locator('#ap')).toHaveText('2');
  await expect(page.locator('#threat')).toHaveText(String(before+1));
  await expect(fallback).toHaveCount(0);
  await page.reload();await open();
  await expect(panel).toContainText('Náhradní cesta dokončena');
  await expect(page.locator('#ap')).toHaveText('2');
 });
}

for(const [stat,locationId,enemy] of [['hp','location-2','Mlžný pes'],['san','location-4','Prázdný ošetřovatel']]){
 test(`V3 lethal ${stat} combat shows defeat once and blocks stale combat controls`,async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>0;});
  await page.goto('./index.html?ui=v3');
  await page.locator('[data-investigator-id="detective"]').click();
  // A validated edge fixture leaves the final injury to the real UI combat action.
  await page.evaluate(async({stat,locationId})=>{
   const {activeScenarioPack:p}=await import('./src/data/scenario-registry.js');
   const {scenarioSaveKey,saveScenarioSession}=await import('./src/engine/scenario-storage.js');
   const session=JSON.parse(localStorage.getItem(scenarioSaveKey(p.scenario)));
   session.game[stat]=1;session.game.locationId=locationId;
   if(!saveScenarioSession(localStorage,session,p.scenario,p.content))throw Error('Invalid defeat fixture');
  },{stat,locationId});
  await page.reload();
  await page.locator('.v3-location-actions').getByRole('button',{name:/Prozkoumat/}).click();
  await page.getByRole('button',{name:`Střetnutí: ${enemy} · 1 AP`,exact:true}).click();
  await page.locator('[data-combat-move="attack"]').click();
  await expect(page.locator('#'+stat)).toHaveText('0');
  await expect(page.locator('#v3-story-dialog')).toBeVisible();
  await expect(page.locator('#v3-combat-dialog')).not.toBeVisible();
  await expect(page.locator('#gameStatus')).not.toBeEmpty();
  await expect(page.locator('[data-combat-move="attack"]')).toBeDisabled();
  await page.screenshot({path:`test-results/blackwater-v3-${stat}-defeat.png`});
  await page.reload();
  await expect(page.locator('#v3-story-dialog')).toBeVisible();
  await expect(page.locator('#v3-combat-dialog')).not.toBeVisible();
 });
}
