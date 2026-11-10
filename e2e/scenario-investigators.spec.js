import {test,expect} from '@playwright/test';

for(const [name,hp,san,item] of [['Detektiv',6,8,'Sůl'],['Okultistka',5,9,'Laudanum'],['Námořník',7,7,'Obvaz']]){
 test(`scenario character selection persists: ${name}`,async({page})=>{
  await page.goto('./');
  await expect(page.locator('#draw')).toBeDisabled();
  await page.getByRole('button',{name:new RegExp('^'+name+' · HP '+hp+' / SAN '+san)}).click();
  await expect(page.locator('#investigatorName')).toHaveText(name);
  await expect(page.locator('#hp')).toHaveText(String(hp));
  await expect(page.locator('#san')).toHaveText(String(san));
  await expect(page.getByRole('region',{name:'Výbava vyšetřovatele'})).toContainText(item);
  await expect(page.locator('#draw')).toBeEnabled();
  await page.locator('[data-panel="investigator"]').click();
  await expect(page.getByRole('img',{name:'Portrét: '+name,exact:true})).toBeVisible();
  await expect(page.locator('#investigatorRole')).not.toHaveText('Výzkumnice · hlavní scénář');
  await page.locator('#closeDetails').click();
  await page.reload();
  await expect(page.locator('#investigatorName')).toHaveText(name);
  await expect(page.locator('#hp')).toHaveText(String(hp));
  await expect(page.locator('#san')).toHaveText(String(san));
  if(name==='Detektiv'){
   await page.getByRole('button',{name:/^Použít schopnost:/}).click();
   await expect(page.locator('#ap')).toHaveText('4');
   await page.reload();await expect(page.locator('#ap')).toHaveText('4');
   await expect(page.getByRole('button',{name:'Schopnost použita',exact:true})).toBeDisabled();
  }
 });
}

test('scenario encounter uses equipment, persists mid-combat and permits continued exploration',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0.99;});
 await page.goto('./');
 await page.getByRole('button',{name:/^Námořník · HP 7 \/ SAN 7/}).click();
 await page.locator('[data-location-id="location-2"]').click();
 await page.getByRole('button',{name:'Střetnutí: Mlžný pes · 1 AP',exact:true}).click();
 await expect(page.locator('#ap')).toHaveText('1');
 await expect(page.locator('#draw')).toBeDisabled();
 await page.reload();
 const combat=page.getByRole('region',{name:'Taktický souboj'});
 await expect(combat).toContainText('Mlžný pes');
 await combat.getByRole('button',{name:'🎲 Zaútočit',exact:true}).click();
 await expect(combat).toContainText('Nepřítel byl poražen.');
 await expect(page.locator('#draw')).toBeEnabled();
 await page.reload();
 await expect(combat).toContainText('Nepřítel byl poražen.');
 await expect(page.getByRole('button',{name:'Střetnutí: Mlžný pes · 1 AP',exact:true})).toHaveCount(0);
 await page.locator('#draw').click();await expect(page.locator('#cardTitle')).not.toBeEmpty();
});
