import {test,expect} from '@playwright/test';
const inspect=page=>page.evaluate(async()=>{
 const {activeScenarioPack:p}=await import('./src/data/scenario-registry.js');
 const {currentCard}=await import('./src/engine/game.js');
 const {scenarioSessionView}=await import('./src/engine/scenario-session.js');
 const s=JSON.parse(localStorage.getItem('hlubiny-scenario-v1-'+p.scenario.id));
 return {game:s.game,card:currentCard(s.game,p.content),testBonuses:scenarioSessionView(s,p.scenario,p.content).testBonuses};
});
async function journey(page){
 page.on('pageerror',e=>console.log('BROWSER ERROR:',e.stack));
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{Math.random=()=>.5;});
 await page.goto('./');await page.getByRole('button',{name:/^Detektiv · HP 6 \/ SAN 8/}).click();
 const afford=async n=>{if((await inspect(page)).game.ap<n)await page.locator('#endRound').click();};
 const resolve=async o=>{
  await afford(o.apCost);await page.locator(`[data-choice-id="${o.id}"]`).click();
  const bonus=(await inspect(page)).testBonuses[o.test?.attribute]||0;
  // Keep the established outcome tiers while exercising the public class bonus.
  await page.evaluate(b=>{let index=0;const values=[.5,b?1/3:.5];Math.random=()=>values[index++%2];},bonus);
  await page.locator('#roll').click();
  if(o.test)await page.getByRole('button',{name:'Přijmout výsledek',exact:true}).click();
  await expect(page.locator('#reveal')).not.toBeEmpty();await page.locator('#next').click();
 };
 const seek=async id=>{for(let i=0;i<50;i++){
  if(!(await inspect(page)).card)await page.locator('#draw').click();const {card}=await inspect(page);if(card.id===id)return card;
  await resolve(card.id==='bw-02-01'?card.choices.find(o=>o.id==='bw-02-01-alternate'):[...card.choices].filter(o=>o.unavailableReason!=='Nesplněné podmínky').sort((a,b)=>a.apCost-b.apCost)[0]);
 }throw Error('Unreachable '+id);};
 const move=async id=>{await afford(1);await page.locator(`[data-location-id="${id}"]`).click();};
 await resolve((await seek('0-0')).choices[0]);await move('location-2');await resolve((await seek('bw-02-04')).choices[0]);
 await move('location-4');const name=page.locator('[data-puzzle-id="bw-missing-name"]');
 await name.getByRole('combobox',{name:'Vyber závěr'}).selectOption('samuel-reed');
 await name.getByRole('button',{name:'Ověřit řešení'}).click();await expect(name).toContainText('Inkoust se rozteče');
 await name.getByRole('combobox',{name:'Vyber závěr'}).selectOption('nathaniel-voss');await page.reload();
 await expect(name.getByRole('combobox')).toHaveValue('nathaniel-voss');
 await name.getByRole('button',{name:'Ověřit řešení'}).click();await expect(name).toContainText('Vyřešeno');
 await resolve((await seek('4-0')).choices[0]);await move('location-3');
 await resolve((await seek('bw-03-04')).choices.find(o=>o.id==='bw-03-04-ally'));
 await move('location-5');await resolve((await seek('5-0')).choices[0]);
 const mechanism=page.locator('[data-puzzle-id="bw-lighthouse-signal"]');
 await mechanism.getByRole('combobox',{name:'Nastavení: Pauza mezi záblesky'}).selectOption('short');
 await page.reload();await expect(mechanism.getByRole('combobox',{name:'Nastavení: Pauza mezi záblesky'})).toHaveValue('short');
 await mechanism.getByRole('combobox',{name:'Nastavení: Směr paprsku'}).selectOption('sea');
 await mechanism.getByRole('button',{name:'Ověřit řešení'}).click();await expect(mechanism).toContainText('Vyřešeno');
 await resolve((await seek('bw-05-04')).choices.find(o=>o.id==='bw-05-04-trust'));
 await move('location-1');await resolve((await seek('bw-01-01')).choices[0]);
 await move('location-6');await resolve((await seek('bw-event-02')).choices.find(o=>o.id==='bw-event-02-rescue'));
}
for(const [ending,title,width] of [['quiet-sea','Tiché moře',1440],['broken-bell','Zlomený zvon',1440],['voice-price','Cena hlasu',1440],['quiet-sea','Tiché moře',390],['quiet-sea','Tiché moře',320]]){
 test(`story from public actions to ${ending} at ${width}px`,async({page})=>{
  test.setTimeout(90000);await page.setViewportSize({width,height:900});await journey(page);
  const endingButton=page.getByRole('button',{name:'Dokončit scénář: '+title,exact:true});await expect(endingButton).toBeVisible();
  await expect(page.locator('#scenario-finale-actions')).not.toContainText('Samuel Reed a zachránění');
  await endingButton.click();await expect(page.locator('#gameStatus')).toContainText(title);
  await expect(page.locator('#scenario-finale-actions')).toContainText('Samuel Reed a zachránění');
  await page.reload();await expect(page.locator('#gameStatus')).toContainText(title);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
