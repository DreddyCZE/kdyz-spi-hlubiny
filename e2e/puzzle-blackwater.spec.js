import {test,expect} from '@playwright/test';
// Existing journey tests begin with the default detective; dedicated selection tests cover the chooser.
test.beforeEach(async ({page}) => {
  await page.goto('./');
  const choose=page.getByRole('button',{name:/^Detektiv · HP 6 \/ SAN 8/});
  if(await choose.isVisible())await choose.click();
});


test('Blackwater bell puzzle reveals earned clues, solves by keyboard and persists after reload',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');
 // Isolated puzzle fixture: select through the engine, then inject location and evidence.
 await page.evaluate(async()=>{
  const {activeScenarioPack}=await import('./src/data/scenario-registry.js');
  const {newScenarioSession,scenarioSessionTransition}=await import('./src/engine/scenario-session.js');
  const {saveScenarioSession}=await import('./src/engine/scenario-storage.js');
  const {scenario,content}=activeScenarioPack;
  const initial=newScenarioSession(scenario,content);
  const session=scenarioSessionTransition(initial,{type:'selectInvestigator',investigatorId:'detective',revision:0},scenario,content);
  session.game.locationId='location-5';
  session.game.evidence=['reward-10','reward-12','reward-14'];
  if(!saveScenarioSession(localStorage,session,scenario,content))throw Error('Scenario save rejected');
 });
 await page.reload();
 const panel=page.locator('#scenario-puzzles');
 await expect(panel.getByRole('heading',{name:'Tři znamení zvonu'})).toBeVisible();
 await expect(panel).toContainText('Archivní katalog');
 await expect(panel).toContainText('Pacient tvrdí');
 await expect(panel).toContainText('Rytina');
 await expect(panel).not.toContainText('První patří mrtvým');
 await panel.getByRole('button',{name:'Zobrazit nápovědu'}).click();
 await expect(panel).toContainText('První patří mrtvým');
 await panel.getByRole('button',{name:'Posunout eye doleva'}).focus();
 await page.keyboard.press('Enter');
 await expect(panel.getByRole('button',{name:'Posunout eye doprava'})).toBeFocused();
 await panel.getByRole('button',{name:'Posunout anchor doleva'}).focus();
 await page.keyboard.press('Enter');
 await expect(panel.getByRole('button',{name:'Posunout anchor doleva'})).toBeFocused();
 await panel.getByRole('button',{name:'Ověřit řešení'}).click();
 await expect(panel).toContainText('Vyřešeno');
 const key=await page.evaluate(()=>Object.keys(localStorage).find(k=>k.startsWith('hlubiny-scenario-v1-')));
 expect(key).toBeTruthy();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 expect(saved.game.flags['bell-order-solved']).toBe(true);
 expect(saved.scenario.puzzles['bw-bell-order'].attempts).toBe(1);
 await page.reload();
 await expect(page.locator('#scenario-puzzles')).toContainText('Vyřešeno');
 await expect(page.locator('#scenario-puzzles').getByRole('button',{name:'Ověřit řešení'})).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('Blackwater bell puzzle does not disclose unearned clues or hints',async({page})=>{
 await page.goto('./');
 await page.evaluate(async()=>{
  const {activeScenarioPack}=await import('./src/data/scenario-registry.js');
  const {newScenarioSession,scenarioSessionTransition}=await import('./src/engine/scenario-session.js');
  const {saveScenarioSession}=await import('./src/engine/scenario-storage.js');
  const {scenario,content}=activeScenarioPack;
  const initial=newScenarioSession(scenario,content);
  const session=scenarioSessionTransition(initial,{type:'selectInvestigator',investigatorId:'detective',revision:0},scenario,content);
  session.game.locationId='location-5';
  if(!saveScenarioSession(localStorage,session,scenario,content))throw Error('Scenario save rejected');
 });
 await page.reload();
 const panel=page.locator('#scenario-puzzles');
 await expect(panel.getByRole('heading',{name:'Tři znamení zvonu'})).toBeVisible();
 await expect(panel).not.toContainText('Archivní katalog');
 await expect(panel).not.toContainText('Pacient tvrdí');
 await expect(panel).not.toContainText('Rytina');
 await expect(panel.getByRole('button',{name:'Zobrazit nápovědu'})).toHaveCount(0);
});
