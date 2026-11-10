import {test,expect} from '@playwright/test';

test('prologue and hint preferences persist independently of the scenario save',async({page})=>{
 await page.goto('./');
 const guide=page.getByRole('region',{name:'Průvodce Blackwaterem'});
 await expect(guide).toContainText('Příjezd do Blackwateru');
 const save=await page.evaluate(()=>localStorage.getItem('hlubiny-scenario-v1-blackwater-bells'));
 await guide.getByRole('button',{name:'Vstoupit do Blackwateru',exact:true}).click();
 await expect(guide).toContainText('Koho vyšleš do mlhy?');
 await page.reload();
 await expect(guide).toContainText('Koho vyšleš do mlhy?');
 await guide.getByRole('button',{name:'Vypnout nápovědy',exact:true}).click();
 await page.reload();await expect(guide).toBeHidden();
 expect(await page.evaluate(()=>localStorage.getItem('hlubiny-scenario-v1-blackwater-bells'))).toBe(save);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hlubiny-onboarding-v1')).enabled)).toBe(false);
 await page.getByRole('button',{name:/^Detektiv · HP/}).click();
 const started=await page.evaluate(()=>localStorage.getItem('hlubiny-scenario-v1-blackwater-bells'));
 await page.getByRole('button',{name:'Průvodce hrou',exact:true}).click();
 await expect(guide).toContainText('Příjezd do Blackwateru');
 await guide.getByRole('button',{name:'Vstoupit do Blackwateru',exact:true}).click();
 await expect(guide).toContainText('Město a jeho stopy');
 await guide.getByRole('button',{name:'Rozumím',exact:true}).click();
 await expect(guide).toContainText('Výbava pro těžké chvíle');
 expect(await page.evaluate(()=>localStorage.getItem('hlubiny-scenario-v1-blackwater-bells'))).toBe(started);
});

test('unavailable storage leaves prologue controls usable',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('Storage unavailable');};});
 await page.goto('./');
 const guide=page.getByRole('region',{name:'Průvodce Blackwaterem'});
 await guide.getByRole('button',{name:'Vstoupit do Blackwateru',exact:true}).click();
 await expect(guide).toContainText('Koho vyšleš do mlhy?');
 await page.getByRole('button',{name:/^Detektiv · HP/}).click();
 await expect(page.getByRole('button',{name:'Dobrat kartu',exact:true})).toBeEnabled();
});
