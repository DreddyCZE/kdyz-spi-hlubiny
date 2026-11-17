import {test,expect} from '@playwright/test';
const key='hlubiny-scenario-v1-blackwater-bells';
const saved=page=>page.evaluate(key=>localStorage.getItem(key),key);
async function start(page){
  await page.goto('./');await page.getByRole('button',{name:'Přeskočit úvod a nápovědy'}).click();
  await page.getByRole('button',{name:/^Detektiv · HP/}).click();
  await page.locator('#endRound').click();
}
for(const width of [320,1440])for(const leave of [false,true]){
  test(`fog ${leave?'avoided':'hits'} once with reload ${width}px`,async({page},testInfo)=>{
    await page.setViewportSize({width,height:1000});await start(page);
    await expect(page.locator('#mythNotice')).toContainText('Mlha se zvedá');
    await expect(page.locator('#mythNotice img')).toHaveAttribute('src',/myth-fog/);
    await expect(page.locator('#mapThreat')).toContainText('při ukončení 2. kola');
    await expect(page.locator('[data-location-id="location-0"]')).toHaveClass(/threatened/);
    await page.locator('#mythNotice img').evaluate(img=>img.decode());
    await page.screenshot({path:testInfo.outputPath(`fog-${width}.png`),fullPage:true});
    const before=await saved(page);await page.reload();expect(await saved(page)).toBe(before);
    await expect(page.locator('#mythNotice')).toContainText('Mlha se zvedá');
    await page.getByRole('button',{name:'Zpět k průzkumu',exact:true}).click();
    await expect(page.locator('#draw')).toBeEnabled();
    if(leave){await page.locator('[data-location-id="location-1"]').click();await expect(page.locator('#ap')).toHaveText('2');}
    await page.locator('#endRound').click();
    await expect(page.locator('#san')).toHaveText(leave?'8':'7');
    await expect(page.locator('#mapThreat')).toBeHidden();
    const after=await saved(page);await page.reload();expect(await saved(page)).toBe(after);
    await page.locator('#openJournal').click();await page.getByRole('tab',{name:/^Kronika/}).click();
    await expect(page.locator('#journal-chronicle')).toContainText(leave?'Mlha tě minula':'Ztrácíš 1 SAN');
    await expect(page.locator('#journal-chronicle')).toContainText('ohrožen je Přístav');
    await page.keyboard.press('Escape');await page.locator('#endRound').click();
    await expect(page.locator('#san')).toHaveText(leave?'8':'7');
  });
}
test('old save past the warning loads unchanged and never receives a retroactive penalty',async({page})=>{
  await start(page);
  await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));delete s.scenario.delayedThreats;localStorage.setItem(key,JSON.stringify(s));},key);
  const old=await saved(page);await page.reload();expect(await saved(page)).toBe(old);
  await expect(page.locator('#mapThreat')).toBeHidden();
  await page.locator('#endRound').click();await expect(page.locator('#san')).toHaveText('8');
});
