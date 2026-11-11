import {test,expect} from '@playwright/test';
import {journey} from './helpers/story-journey.js';
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
