import {test,expect} from '@playwright/test';

const saveKey='hlubiny-scenario-v1-blackwater-bells';
const saved=page=>page.evaluate(key=>localStorage.getItem(key),saveKey);
async function start(page,hero='Detektiv'){
  await page.goto('./');
  await page.getByRole('button',{name:'Přeskočit úvod a nápovědy'}).click();
  await page.getByRole('button',{name:new RegExp('^'+hero+' · HP')}).click();
}

for(const width of [320,390,1440]){
  test(`B/C map, compact investigator and reachable story at ${width}px`,async({page},testInfo)=>{
    await page.setViewportSize({width,height:1000});await start(page,'Námořník');
    await expect(page.locator('#fieldName')).toHaveText('Námořník');
    await expect(page.locator('#hpLimit')).toHaveText('7');
    await expect(page.locator('#sanLimit')).toHaveText('7');
    const before=await saved(page);
    if(width===1440){
      const map=await page.locator('#boardMap').boundingBox(),card=await page.locator('#storyPanel').boundingBox();
      expect(map.width).toBeGreaterThan(card.width);
    }else{
      await page.getByRole('link',{name:'Příběh a akce',exact:true}).click();
      await expect(page.locator('#cardTitle')).toBeInViewport();
    }
    expect(await saved(page)).toBe(before);
    await page.locator('#draw').click();await expect(page.locator('#cardArt')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    // Wait for the cosmetic entrance before visual inspection.
    await page.locator('#storyPanel').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
    await page.screenshot({path:testInfo.outputPath(`bc-${width}.png`),fullPage:true});
    await testInfo.attach(`B/C ${width}`,{path:testInfo.outputPath(`bc-${width}.png`),contentType:'image/png'});
  });
}

test('myth summary presents reached clocks without replaying the end of round',async({page})=>{
  await start(page);await page.locator('#endRound').click();
  await expect(page.locator('#mythNotice')).toBeVisible();
  await expect(page.locator('#scenePhase')).toHaveText('Mýtus');
  await expect(page.locator('#mythNotice')).toContainText('2. kolo');
  await expect(page.locator('#mythNotice')).toContainText('Údery zvonu: 1 / 7');
  const before=await saved(page);
  await page.getByRole('button',{name:'Zpět k průzkumu'}).click();
  await expect(page.locator('#mythNotice')).toBeHidden();expect(await saved(page)).toBe(before);
  await page.reload();await expect(page.locator('#round')).toHaveText('2');
  await expect(page.locator('#mythNotice')).toBeHidden();expect(await saved(page)).toBe(before);
});

test('first roll and reroll hide faces during animation and resolve only on acceptance',async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>.5;});await start(page);
  await page.locator('#draw').click();await page.clock.install();await page.clock.pauseAt(new Date());
  await page.locator('#roll').click();
  const accept=page.getByRole('button',{name:'Přijmout výsledek',exact:true});
  await expect(page.locator('#die1')).toHaveText('?');await expect(accept).toBeDisabled();
  await expect(page.locator('#reveal')).toBeEmpty();
  await page.clock.runFor(1000);await expect(page.locator('#die1')).toHaveText('4');
  await expect(page.locator('#dicebox')).toBeVisible();await expect(accept).toBeEnabled();
  await page.getByRole('button',{name:/^Sebrat odvahu/}).click();
  await expect(page.locator('#die1')).toHaveText('?');await expect(accept).toBeDisabled();
  await expect(page.getByRole('status').filter({hasText:'První hod:'})).toHaveCount(0);
  const pending=JSON.parse(await saved(page));expect(pending.game.ap).toBe(3);expect(pending.game.result).toBeNull();
  await page.clock.runFor(1000);await accept.click();
  await expect(page.locator('#reveal')).toContainText('Úspěch');await expect(page.locator('#ap')).toHaveText('2');
});

test('combat scene animates once, hides the exchange and restores its committed result after reload',async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>.99;});await start(page,'Námořník');
  await page.locator('[data-location-id="location-2"]').click();
  await page.getByRole('button',{name:'Střetnutí: Mlžný pes · 1 AP',exact:true}).click();
  await expect(page.locator('#scenePhase')).toHaveText('Souboj');
  await expect(page.locator('.combat-portrait')).toHaveAttribute('src',/fog-hound/);
  await page.clock.install();await page.clock.pauseAt(new Date());
  const attack=page.getByRole('button',{name:'🎲 Zaútočit',exact:true});await attack.click();
  await expect(attack).toBeDisabled();await expect(page.locator('.combat-dice .die').first()).toHaveText('?');
  const combat=page.getByRole('region',{name:'Taktický souboj'});
  await expect(combat).not.toContainText('Nepřítel byl poražen.');
  const before=await saved(page);expect(JSON.parse(before).scenario.combat.exchange).toBe(1);
  // Synthetic second clicks cannot pay again or roll a second exchange.
  await attack.dispatchEvent('click');expect(await saved(page)).toBe(before);
  await page.reload();await expect(combat).toContainText('Nepřítel byl poražen.');
  expect(await saved(page)).toBe(before);await expect(page.locator('#draw')).toBeEnabled();
});

test('reduced motion disables table and dice animation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await start(page);await page.locator('#draw').click();
  expect(await page.locator('#storyPanel').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.locator('#roll').click();await expect(page.getByRole('button',{name:'Přijmout výsledek',exact:true})).toBeEnabled();
  await expect(page.locator('#die1')).not.toHaveText('?');
});
