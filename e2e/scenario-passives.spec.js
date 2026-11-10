import {test,expect} from '@playwright/test';

test('detective earned bonus agrees with the pending tier, total and restored result',async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{Math.random=()=>.5;});
 await page.goto('./');await page.getByRole('button',{name:/^Detektiv · HP/}).click();
 await page.locator('#draw').click();await expect(page.locator('#challenge')).not.toContainText('postava +1');
 await page.locator('#roll').click();await page.getByRole('button',{name:'Přijmout výsledek',exact:true}).click();
 await page.locator('#next').click();await page.locator('#draw').click();
 await page.getByRole('button',{name:/^Nenápadně ho sledovat/}).click();
 await expect(page.locator('#challenge')).toContainText('postava +1');
 await page.evaluate(()=>{let n=0;Math.random=()=>[.5,.67][n++%2];});
 await page.locator('#roll').click();
 await expect(page.getByRole('status').filter({hasText:'První hod:'})).toContainText('Velký úspěch');
 await page.getByRole('button',{name:'Přijmout výsledek',exact:true}).click();
 await expect(page.locator('#sum')).toHaveText('4 + 5 + 2 + 0 + 1 (postava) = 12 proti obtížnosti 9');
 await page.reload();await expect(page.locator('#sum')).toContainText('= 12 proti obtížnosti 9');
 await page.getByRole('region',{name:'Schopnost vyšetřovatele'}).scrollIntoViewIfNeeded();
 await page.screenshot({path:testInfo.outputPath('detective-passive.png')});
});

test('occultist free reroll displays its cost and remains spent after reload',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{Math.random=()=>.5;});
 await page.goto('./');await page.getByRole('button',{name:/^Okultistka · HP/}).click();
 await expect(page.getByRole('region',{name:'Schopnost vyšetřovatele'})).toContainText('Znalost zakázaného');
 await page.locator('#draw').click();await page.locator('#roll').click();
 const reroll=page.getByRole('button',{name:'Sebrat odvahu · přehodit za 0 SAN',exact:true});
 await expect(reroll).toBeEnabled();await reroll.click();await expect(page.locator('#san')).toHaveText('9');
 await page.reload();await expect(page.getByRole('region',{name:'Schopnost vyšetřovatele'})).toContainText('V tomto kole využito.');
 await expect(page.getByRole('button',{name:/^Sebrat odvahu/})).toBeHidden();
 await page.getByRole('button',{name:'Přijmout výsledek',exact:true}).click();
 await page.locator('#endRound').click();
 await expect(page.getByRole('region',{name:'Schopnost vyšetřovatele'})).not.toContainText('V tomto kole využito.');
});

test('sailor first combat injury is prevented once and persists at mobile width',async({page})=>{
 await page.setViewportSize({width:320,height:900});await page.addInitScript(()=>{Math.random=()=>0;});
 await page.goto('./');await page.getByRole('button',{name:/^Námořník · HP/}).click();
 await page.locator('[data-location-id="location-2"]').click();
 await page.getByRole('button',{name:'Střetnutí: Mlžný pes · 1 AP',exact:true}).click();
 await page.getByRole('button',{name:'🎲 Zaútočit',exact:true}).click();await expect(page.locator('#hp')).toHaveText('7');
 await page.reload();await page.getByRole('button',{name:'🎲 Zaútočit',exact:true}).click();await expect(page.locator('#hp')).toHaveText('6');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
