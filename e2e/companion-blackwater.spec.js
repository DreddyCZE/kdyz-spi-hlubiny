import {test,expect} from '@playwright/test';
// Existing journey tests begin with the default detective; dedicated selection tests cover the chooser.
test.beforeEach(async ({page}) => {
  await page.goto('./');
  const choose=page.getByRole('button',{name:/^Detektiv · HP 6 \/ SAN 8/});
  if(await choose.isVisible())await choose.click();
});

test('Blackwater dog recruitment, ability cooldown and reload',async({page})=>{
 await page.goto('./');
 await page.locator('[aria-label="Výběr vyšetřovatele"] .investigator-card').first().click({timeout:5000}).catch(async error=>{if(await page.locator('[aria-label="Výběr vyšetřovatele"] .investigator-card').count())throw error;});
 await expect(page.locator('#scenario-companions')).toBeEmpty();
 await page.getByRole('button',{name:'◇ Staré město',exact:true}).click();
 const companions=page.locator('#scenario-companions');
 await expect(companions.getByRole('heading',{name:'Toulavý pes'})).toBeVisible();
 await companions.getByRole('button',{name:'Přijmout společníka'}).click();
 await expect(companions).toContainText('Doprovází tě');
 await expect(companions).not.toContainText('Pes se zastaví u vlhkých stop');
 await companions.getByRole('button',{name:'Použít: Zachytit stopu'}).click();
 await expect(companions).toContainText('Pes se zastaví u vlhkých stop');
 await expect(companions.getByRole('button',{name:'Zachytit stopu · použito v tomto kole'})).toBeDisabled();
 await expect(page.locator('#log')).toContainText('Pes se zastaví u vlhkých stop');
 const discovery=await page.evaluate(()=>Object.entries(localStorage).filter(([k])=>k.startsWith('hlubiny-scenario-v1-')).map(([,v])=>JSON.parse(v).game.flags['dog-scent-found']));
 expect(discovery).toContain(true);
 await page.reload();
 await expect(companions).toContainText('Doprovází tě');
 await expect(page.locator('#log')).toContainText('Pes se zastaví u vlhkých stop');
 await expect(companions.getByRole('button',{name:'Zachytit stopu · použito v tomto kole'})).toBeDisabled();
 await page.locator('#endRound').click();
 await expect(companions.getByRole('button',{name:'Použít: Zachytit stopu'})).toBeEnabled();
 await companions.getByRole('button',{name:'Rozloučit se'}).click();
 await expect(companions.getByRole('button',{name:'Přijmout společníka'})).toBeVisible();
});
