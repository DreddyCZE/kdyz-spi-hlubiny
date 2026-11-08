import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {scenarioSaveKey} from '../src/engine/scenario-storage.js';
import { test, expect } from '@playwright/test';

for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
  test(`mapa, přehledy a reload ${viewport.width}`, async ({page},testInfo)=>{
    await page.setViewportSize(viewport);
    await page.goto('./');
    await page.locator('#draw').click();
    const points=page.locator('#places button');
    await expect(points).toHaveCount(7);
    await expect(page.locator('[aria-current="location"]')).toContainText('Přístav');
    await page.getByRole('button',{name:'◇ Knihovna',exact:true}).click();
    await expect(page.locator('#placeTitle')).toHaveText('Knihovna');
    await expect(page.locator('#ap')).toHaveText('2');
    await page.reload();
    await expect(page.locator('#placeTitle')).toHaveText('Knihovna');
    await expect(page.locator('#ap')).toHaveText('2');
    await page.getByRole('button',{name:'Vyšetřovatel',exact:true}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#heroStats')).toContainText('Eleanor Whitmore');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Vyšetřovatel',exact:true})).toBeFocused();
    await page.getByRole('button',{name:'Deník · důkazy',exact:true}).click();
    await expect(page.locator('#journal-evidence')).toBeVisible();
    await expect(page.locator('#deduce')).toBeDisabled();
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Znalosti',exact:true}).click();
    await expect(page.locator('#journal-knowledge')).toBeFocused();
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Herní záznam',exact:true}).click();
    await expect(page.locator('#log')).toContainText('Přesun: Knihovna');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.evaluate(async()=>{
      const url=getComputedStyle(document.getElementById('places')).getPropertyValue('--map-art').trim().slice(5,-2);
      const image=new Image();image.src=url;await image.decode();
    });
    await page.screenshot({path:testInfo.outputPath(`table-${viewport.width}.png`),fullPage:true});
    await testInfo.attach(`Herní stůl ${viewport.width}`,{path:testInfo.outputPath(`table-${viewport.width}.png`),contentType:'image/png'});
  });
}

test('zamčené body, žádné AP a konec hry blokují přesun',async({page})=>{
  await page.goto('./');
    await page.locator('#draw').click();
  await page.evaluate(async()=>{
    const {activeScenarioPack}=await import('./src/data/scenario-registry.js');
    const {newScenarioSession}=await import('./src/engine/scenario-session.js');
    const {saveScenarioSession}=await import('./src/engine/scenario-storage.js');
    const {scenario,content}=activeScenarioPack;
    const session=newScenarioSession(scenario,content);
    session.game.unlockedLocations=['location-0','location-1'];
    if(!saveScenarioSession(localStorage,session,scenario,content))throw Error('Scenario save rejected');
  });
  await page.reload();
  const locked=page.getByRole('button',{name:'▣ Knihovna · zamčeno',exact:true});
  await expect(locked).toBeDisabled();
  await expect(locked).toHaveClass(/locked/);
  await page.getByRole('button',{name:'◇ Staré město',exact:true}).click();
  await expect(page.locator('#ap')).toHaveText('2');
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem(scenarioSaveKey(blackwaterScenario)));s.ap=0;localStorage.setItem(scenarioSaveKey(blackwaterScenario),JSON.stringify(s));});
  await page.reload();
  await expect(page.getByRole('button',{name:'◇ Přístav',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Další kolo',exact:true}).click();
  await expect(page.locator('#ap')).toHaveText('3');
  for(let i=0;i<11;i++)await page.locator('#endRound').click();
  await expect(page.locator('#gameStatus')).toContainText('Konec scénáře');
  await expect(page.getByRole('button',{name:'◇ Přístav',exact:true})).toBeDisabled();
});

test('scénář bez mapy má čitelný seznam a vlastní názvy',async({page})=>{
  await page.goto('./');
    await page.locator('#draw').click();
  await page.evaluate(async()=>{
    const {renderMap}=await import('./src/ui/map.js');
    renderMap(document.getElementById('places'),[{id:'room',name:'Čítárna'}],null,{locationId:'elsewhere',unlockedLocations:['room'],ap:1,ended:false},false,()=>{});
  });
  await expect(page.locator('#places')).not.toHaveClass(/mapped/);
  await expect(page.getByRole('button',{name:'◇ Čítárna',exact:true})).toBeVisible();
});

test('reset během hodu zruší animaci a zachová nový save',async({page})=>{
  await page.goto('./');
    await page.locator('#draw').click();
  await page.clock.install();
  await page.locator('#roll').click();
  await expect(page.locator('#reveal')).toBeEmpty();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#reset').click();
  await page.clock.fastForward(1100);
  await expect(page.locator('#ap')).toHaveText('3');
  await expect(page.locator('#reveal')).toBeEmpty();
  await page.reload();
  await expect(page.locator('#ap')).toHaveText('3');
  await expect(page.locator('#draw')).toBeEnabled();
});

test('omezený pohyb odhalí výsledek bez animace a výběr zachová focus',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('./');
    await page.locator('#draw').click();
  const choice=page.locator('#choices button').first();
  await choice.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#choices button').first()).toBeFocused();
  await page.locator('#roll').click();
  await page.getByRole('button',{name:'Přijmout výsledek'}).click();
  await expect(page.locator('#reveal')).toBeVisible();
  expect(await page.locator('#die1').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});

test('konec hry zakáže hod i po reloadu a nezmění uložený stav',async({page})=>{
  await page.goto('./');
    await page.locator('#draw').click();
  await expect(page.locator('#roll')).toBeEnabled();
  // Reach the deadline through real actions with an unresolved card still present.
  for(let i=0;i<12;i++)await page.locator('#endRound').click();
  await expect(page.locator('#gameStatus')).toContainText('Konec scénáře');
  await expect(page.locator('#cardTitle')).toHaveText('Ztracená loď');
  await expect(page.locator('#roll')).toBeDisabled();
  const saved=await page.evaluate(()=>localStorage.getItem(scenarioSaveKey(blackwaterScenario)));
  await page.reload();
  await expect(page.locator('#roll')).toBeDisabled();
  // Even a synthetic click cannot perform another action.
  await page.locator('#roll').dispatchEvent('click');
  expect(await page.evaluate(()=>localStorage.getItem(scenarioSaveKey(blackwaterScenario)))).toBe(saved);
  await expect(page.locator('#reveal')).toBeEmpty();
});

test('reload během animace obnoví nepotvrzený hod bez předčasného odhalení',async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>0.5;});
  await page.goto('./');
  await page.locator('#draw').click();
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.locator('#roll').click();
  await expect(page.locator('#die1')).toHaveText('?');
  await expect(page.locator('#reveal')).toBeEmpty();
  const saved=await page.evaluate(key=>localStorage.getItem(key),scenarioSaveKey(blackwaterScenario));
  const session=JSON.parse(saved);
  expect(session.scenario.pendingTest.firstDice).toEqual([4,4]);
  expect(session.game.ap).toBe(3);
  expect(session.game.result).toBeNull();
  await page.reload();
  await expect(page.locator('#reveal')).toBeEmpty();
  await expect(page.locator('#outcomes')).toBeHidden();
  await expect(page.getByRole('button',{name:'Přijmout výsledek'})).toBeVisible();
  expect(await page.evaluate(key=>localStorage.getItem(key),scenarioSaveKey(blackwaterScenario))).toBe(saved);
  await page.getByRole('button',{name:'Přijmout výsledek'}).click();
  await expect(page.locator('#reveal')).toHaveText('Úspěch — Najdeš deník zmizelého rybáře.');
  await expect(page.locator('#inventory')).toHaveText('Deník');
  await expect(page.locator('#ap')).toHaveText('2');
  await expect(page.locator('#roll')).toBeDisabled();
});

for(const width of [320,390,1440]){
  test(`mapové body: ovládání a rozměry při ${width} px`,async({page},testInfo)=>{
    await page.setViewportSize({width,height:844});
    await page.goto('./');
    await page.locator('#draw').click();
    const report=[];
    for(let index=0;index<7;index++){
      if(index>0){
        const point=page.locator(`#places [data-location-id="location-${index}"]`);
        if(await page.locator('#ap').textContent()==='0')await page.locator('#endRound').click();
        // Real pointer interaction, including changing widths of current labels.
        await point.click();
        await expect(point).toHaveAttribute('aria-current','location');
      }
      const overlaps=await page.locator('#places').evaluate(el=>{
        const buttons=[...el.querySelectorAll('button')];
        const box=el.getBoundingClientRect();
        const rects=buttons.map(b=>({id:b.dataset.locationId,r:b.getBoundingClientRect()}));
        return {
          outside:rects.filter(({r})=>r.left<box.left||r.right>box.right||r.top<box.top||r.bottom>box.bottom).map(b=>b.id),
          pairs:rects.flatMap((a,i)=>rects.slice(i+1).filter(b=>Math.min(a.r.right,b.r.right)>Math.max(a.r.left,b.r.left)&&Math.min(a.r.bottom,b.r.bottom)>Math.max(a.r.top,b.r.top)).map(b=>[a.id,b.id])),
        };
      });
      expect(overlaps.outside).toEqual([]);
      expect(overlaps.pairs).toEqual([]);
      report.push({current:`location-${index}`,...overlaps});
    }
    await page.locator('#endRound').click();
    await page.locator('#places [data-location-id="location-0"]').click();
    await expect(page.locator('#places [data-location-id="location-0"]')).toHaveAttribute('aria-current','location');
    // Incomplete map metadata must fall back as a whole, even on a narrow screen.
    await page.evaluate(async()=>{
      const {renderMap}=await import('./src/ui/map.js');
      const {locations}=await import('./src/data/locations.js');
      const {blackwaterMap}=await import('./src/data/map.js');
      renderMap(document.getElementById('places'),locations,{...blackwaterMap,points:{}},{locationId:'location-0',unlockedLocations:locations.map(l=>l.id),ap:3,ended:false},false,()=>{});
    });
    await expect(page.locator('#places')).not.toHaveClass(/mapped/);
    await expect(page.locator('#places button')).toHaveCount(7);
    for(const point of await page.locator('#places button:not(:disabled)').all())await point.click({trial:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await testInfo.attach('mobile-map-overlaps',{body:JSON.stringify(report,null,2),contentType:'application/json'});

  });
}
