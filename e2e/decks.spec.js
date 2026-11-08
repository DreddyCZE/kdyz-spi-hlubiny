import {test,expect} from '@playwright/test';
import {blackwaterContent as content} from '../src/engine/content.js';
const saveKey='hlubiny-scenario-v1-blackwater';
async function resolveDrawn(page){
 await page.locator('#roll').click();
 if(await page.getByRole('button',{name:'Přijmout výsledek'}).isVisible()){
  await page.getByRole('button',{name:'Přijmout výsledek'}).click();
 }
 await expect(page.locator('#reveal')).toBeVisible();
}

for(const width of [1440,390,320])test(`explicit deck draw, keyboard, privacy and reload ${width}px`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{Math.random=()=>.5;});await page.goto('./');
 const hidden=async(known=[])=>{const html=await page.locator('body').innerHTML();for(const c of content.cards.filter(c=>!known.includes(c.id))){expect(html).not.toContain(c.title);expect(html).not.toContain(c.description);}expect(html).not.toContain('addEvidence');};
 await hidden();await expect(page.locator('#deckName')).toHaveText('Mlžná mola');await expect(page.locator('#deckCounts')).toContainText('Dostupné: 3');
 await expect(page.locator('#roll')).toBeDisabled();await expect(page.locator('#next')).toBeDisabled();
 await page.screenshot({path:testInfo.outputPath(`deck-${width}.png`),fullPage:true});
 await page.reload();await hidden();await page.locator('#draw').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#cardTitle')).toHaveText('Ztracená loď');await expect(page.locator('#cardTitle')).toBeFocused();await expect(page.locator('#ap')).toHaveText('3');
 for(const c of content.cards.slice(1))expect(await page.locator('body').innerHTML()).not.toContain(c.title);
 await page.reload();await expect(page.locator('#cardTitle')).toHaveText('Ztracená loď');
 await resolveDrawn(page);await page.locator('#next').click();
 await expect(page.locator('#draw')).toBeFocused();await hidden(['0-0']);await expect(page.locator('#deckCounts')).toContainText('Dostupné: 2');
 const saved=await page.evaluate(()=>localStorage.getItem(saveKey));await page.reload();await hidden(['0-0']);expect(await page.evaluate(()=>localStorage.getItem(saveKey))).toBe(saved);
 await page.locator('#draw').click();await expect(page.locator('#cardTitle')).toHaveText('Muž z mlhy');await expect(page.locator('#ap')).toHaveText('2');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath(`drawn-${width}.png`),fullPage:true});
});
test('exhausted location has no enabled dead-end draw control',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{Math.random=()=>.5;});await page.goto('./');
 for(let i=0;i<3;i++){
  await page.locator('#draw').click();if(i===2)await page.locator('#choices button').first().click();
  await resolveDrawn(page);await page.locator('#next').click();
 }
 await expect(page.locator('#deckCounts')).toContainText('Dostupné: 0');await expect(page.locator('#deckCounts')).toContainText('Vyřešené: 3');
 await expect(page.locator('#draw')).toBeDisabled();await expect(page.locator('#roll')).toBeDisabled();await expect(page.locator('#next')).toBeDisabled();
 await page.reload();await expect(page.locator('#draw')).toBeDisabled();
});
