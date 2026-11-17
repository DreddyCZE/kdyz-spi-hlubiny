import {test,expect} from '@playwright/test';
const saveKey='hlubiny-scenario-v1-blackwater-bells';
const saved=page=>page.evaluate(key=>localStorage.getItem(key),saveKey);
async function start(page){
  await page.goto('./');
  await page.getByRole('button',{name:'Přeskočit úvod a nápovědy'}).click();
  await page.getByRole('button',{name:/^Detektiv · HP/}).click();
}
for(const width of [320,390,1440]){
  test(`unified journal tabs, ability, focus and save ${width}px`,async({page},testInfo)=>{
    await page.setViewportSize({width,height:900});await start(page);
    const opener=page.locator('#openJournal');await expect(opener).toHaveText('Deník');
    await expect(page.locator('.investigator-bar > button[data-panel]')).toHaveCount(2);
    const before=await saved(page);await opener.click();
    const dialog=page.locator('#details');
    await expect(dialog.getByRole('tab')).toHaveText(['Vyšetřovatel','Důkazy a znalosti · 0','Dedukce · 0','Výbava','Kronika · 1']);
    await expect(dialog.getByRole('img',{name:'Portrét: Detektiv'})).toBeVisible();
    await expect(dialog.locator('#heroStats')).toContainText('HP 6/6 · SAN 8/8');
    await expect(dialog).toContainText('Aktivní schopnost: Jednou za scénář');
    await expect(dialog).toContainText('Spojování stop');
    const hero=dialog.getByRole('tab',{name:'Vyšetřovatel',exact:true});await hero.focus();
    await page.keyboard.press('ArrowRight');await expect(dialog.getByRole('tab',{name:/^Důkazy a znalosti/})).toBeFocused();
    await page.keyboard.press('End');await expect(dialog.getByRole('tab',{name:/^Kronika/})).toBeFocused();
    await page.keyboard.press('Home');await expect(hero).toBeFocused();
    for(const tab of await dialog.getByRole('tab').all()){
      await tab.click();expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    }
    expect(await saved(page)).toBe(before);
    await dialog.getByRole('tab',{name:'Výbava',exact:true}).click();
    await expect(dialog.getByRole('region',{name:'Výbava vyšetřovatele'})).toContainText('Obvaz');
    await page.screenshot({path:testInfo.outputPath(`journal-kit-${width}.png`)});
    await hero.click();await page.screenshot({path:testInfo.outputPath(`journal-hero-${width}.png`)});
    await dialog.getByRole('button',{name:/^Použít schopnost:/}).click();
    await expect(hero).toBeFocused();
    await expect(dialog.getByRole('button',{name:'Schopnost použita',exact:true})).toBeDisabled();
    await expect(dialog).toContainText('Aktivní schopnost: Jednou za scénář');
    await page.keyboard.press('Escape');await expect(opener).toBeFocused();
    await expect(page.locator('#ap')).toHaveText('4');
    await expect(page.locator('#fieldKit').getByRole('button',{name:'Schopnost použita',exact:true})).toBeDisabled();
    await opener.click();await page.locator('#closeDetails').click();await expect(opener).toBeFocused();
    const after=await saved(page);await page.reload();expect(await saved(page)).toBe(after);
  });
}
test('journal stacks over active combat, blocks actions and restores combat focus',async({page})=>{
  await start(page);await page.locator('[data-location-id="location-2"]').click();
  await page.getByRole('button',{name:'Střetnutí: Mlžný pes · 1 AP',exact:true}).click();
  const combat=page.locator('#combatDialog');const opener=combat.getByRole('button',{name:'Deník',exact:true});
  const before=await saved(page);await opener.click();
  const journal=page.locator('#details');
  await expect(journal.getByRole('button',{name:/^Použít schopnost:/})).toBeDisabled();
  await journal.getByRole('tab',{name:'Výbava',exact:true}).click();
  for(const action of await journal.getByRole('region',{name:'Výbava vyšetřovatele'}).getByRole('button').all())await expect(action).toBeDisabled();
  await page.keyboard.press('Escape');await expect(opener).toBeFocused();await expect(combat).toBeVisible();
  expect(await saved(page)).toBe(before);
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Pokračovat v souboji',exact:true})).toBeFocused();
  await page.locator('#openJournal').click();await expect(journal).toBeVisible();
  await page.locator('#closeDetails').click();await expect(page.locator('#openJournal')).toBeFocused();
  expect(await saved(page)).toBe(before);
});
