import {test,expect} from '@playwright/test';
import {newState,transition} from '../src/engine/game.js';
import {newBlackwaterGame,blackwaterTransition} from '../src/engine/blackwater.js';
import {activeScenarioPack as pack} from '../src/data/scenario-registry.js';
import {newScenarioSession,scenarioSessionTransition} from '../src/engine/scenario-session.js';
const keys=['hlubiny-v4','ksh-blackwater-v1','hlubiny-scenario-v1-blackwater-bells'];
// Fixtures are prepared using public actions of each original engine.
const legacy=transition(newState(),{type:'endRound'});
const old=blackwaterTransition(newBlackwaterGame(),{type:'selectInvestigator',investigatorId:'detective',revision:0});
const initial=newScenarioSession(pack.scenario,pack.content);
const scenario=scenarioSessionTransition(initial,{type:'endRound',revision:initial.game.revision},pack.scenario,pack.content);
const values=[legacy,old,scenario].map(v=>JSON.stringify(v));
async function seed(page,entries){await page.addInitScript(entries=>{if(!sessionStorage.getItem('save-fixture')){for(const [key,value] of entries)localStorage.setItem(key,value);sessionStorage.setItem('save-fixture','yes');}},entries);}
const saved=page=>page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys);
for(const selected of [[],[0],[1],[2],[0,1,2]])test('release entry safely handles save formats '+JSON.stringify(selected),async({page})=>{
 await seed(page,selected.map(i=>[keys[i],values[i]]));await page.goto('/site/index.html');
 const before=await saved(page),panel=page.locator('#save-compatibility');await expect(panel).toBeVisible();
 for(const i of selected)await expect(panel).toContainText(['Původní hra: nalezena','Ilustrovaný Blackwater: nalezena','Nový scénář: nalezena'][i]);
 await page.locator('#endRound').click();const after=await saved(page);
 for(const i of [0,1])expect(after[i]).toBe(before[i]);expect(after[2]).not.toBeNull();
 await page.reload();expect(await saved(page)).toEqual(after);
 await page.goto('/site/preview/index.html');expect(await saved(page)).toEqual(after);await expect(page.locator('#round')).toHaveText(String(JSON.parse(after[2]).game.round));
});
test('legacy continuation preserves original rules and other two saves',async({page})=>{
 await seed(page,keys.map((k,i)=>[k,values[i]]));await page.goto('/site/index.html');await page.getByRole('link',{name:'Pokračovat: Původní hra',exact:true}).click();
 await expect(page.locator('#round')).toHaveText('2');await expect(page.locator('#roundLimit')).toHaveText('7');await expect(page.locator('#scenario-companions')).toBeEmpty();
 await page.locator('#endRound').click();const after=await saved(page);expect(JSON.parse(after[0]).round).toBe(3);expect(JSON.parse(after[0]).ritual).toBe(3);expect(after.slice(1)).toEqual(values.slice(1));
 await page.reload();expect(await saved(page)).toEqual(after);await expect(page.locator('#round')).toHaveText('3');
});
test('old illustrated game continues without migrating or overwriting other saves',async({page})=>{
 await seed(page,keys.map((k,i)=>[k,values[i]]));await page.goto('/site/preview/index.html');await page.getByRole('link',{name:'Pokračovat: Ilustrovaný Blackwater',exact:true}).click();await expect(page.locator('#game')).toBeVisible();
 await page.locator('#endRound').click();await expect(page.locator('#mythDialog')).toBeVisible();const after=await saved(page);expect(JSON.parse(after[1]).game.round).toBe(2);expect(after[0]).toBe(values[0]);expect(after[2]).toBe(values[2]);
 await page.reload();expect(await saved(page)).toEqual(after);
});
for(const mode of ['scenario','legacy','blackwater'])test('corrupt '+mode+' data survive play, reset and reload',async({page})=>{
 const invalid=['{broken','{}','null'];await seed(page,keys.map((k,i)=>[k,invalid[i]]));
 await page.goto(mode==='blackwater'?'/site/preview/blackwater.html':'/site/preview/index.html'+(mode==='legacy'?'?mode=legacy':''));
 await expect(page.locator('#save-compatibility')).toContainText('poškozená');
 if(mode==='blackwater')await page.getByRole('button',{name:/^Detektiv /}).click();else await page.locator('#endRound').click();
 expect(await saved(page)).toEqual(invalid);
 page.once('dialog',dialog=>dialog.accept());await page.locator('#reset').click();expect(await saved(page)).toEqual(invalid);
 await page.reload();expect(await saved(page)).toEqual(invalid);
});
for(const path of ['/site/index.html','/site/preview/index.html','/site/preview/blackwater.html'])test('combined Pages artifact serves '+path,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(path);await expect(page.locator('#save-compatibility')).toBeVisible();
 if(path.endsWith('blackwater.html')){await page.getByRole('button',{name:/^Detektiv /}).click();await expect(page.locator('#game')).toBeVisible();}else{await page.locator('#draw').click();await expect(page.locator('#choices button').first()).toBeVisible();}
 const imagePaths=await page.evaluate(()=>[...document.styleSheets].length);expect(imagePaths).toBeGreaterThan(0);expect(errors).toEqual([]);
 const manifest=await page.request.get('/site/pages-build.json');expect(manifest.ok()).toBe(true);expect((await manifest.json()).rootSha).toMatch(/^[0-9a-f]{40}$/);
});

test('legacy dice actions use the original engine and never create a scenario session',async({page})=>{
 await seed(page,[[keys[0],values[0]]]);await page.addInitScript(()=>{Math.random=()=>0.999;});await page.goto('/site/preview/index.html?mode=legacy');
 await page.locator('#draw').click();await page.locator('#choices button').first().click();await page.locator('#roll').click();await expect(page.locator('#reveal')).not.toBeEmpty();
 await expect(page.getByRole('button',{name:'Přijmout výsledek',exact:true})).toBeHidden();const result=await saved(page);expect(result[2]).toBeNull();expect(JSON.parse(result[0]).result).not.toBeNull();
 await page.reload();expect(await saved(page)).toEqual(result);await expect(page.locator('#reveal')).not.toBeEmpty();
});

test('a historical backup is not offered as if it could bypass an invalid newer legacy save',async({page})=>{
 const v3={...legacy,version:3};delete v3.drawnCards;
 await seed(page,[[keys[0],'{broken'],['hlubiny-v3',JSON.stringify(v3)]]);await page.goto('/site/index.html');
 const panel=page.locator('#save-compatibility');await expect(panel).toContainText('starší zálohu');await expect(panel.getByRole('link',{name:'Pokračovat: Původní hra v3',exact:true})).toHaveCount(0);
 await page.goto('/site/index.html?mode=legacy');await page.locator('#endRound').click();expect((await saved(page))[0]).toBe('{broken');expect(await page.evaluate(()=>localStorage.getItem('hlubiny-v3'))).toBe(JSON.stringify(v3));
});
