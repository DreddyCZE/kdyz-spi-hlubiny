import {test,expect} from '@playwright/test';

// V3 is an opt-in presentation layer: all gameplay actions still come from the scenario engine.
test('V3 map and story dialog render and can be operated',async({page})=>{
 await page.goto('./index.html?ui=v3');
 await expect(page.locator('body')).toHaveClass(/v3/);
 await expect(page.locator('.v3-board .map-panel')).toBeVisible();
 await expect(page.locator('.v3-hud')).toBeVisible();
 await expect(page.locator('.v3-location-panel')).toBeVisible();
 await expect(page.locator('.v3-location-panel #placeTitle')).toBeVisible();
 await expect(page.locator('.map-panel #placeTitle')).toHaveCount(0);
 await expect(page.locator('#places .map-point').first()).toBeVisible();
 const mapBox = await page.locator('.map-panel').boundingBox();
 const mapArtBox = await page.locator('#places').boundingBox();
 expect(mapBox.height-mapArtBox.height).toBeLessThan(130);
 await expect(page.locator('.v3-toolbar')).toHaveCount(0);
 await expect(page.locator('.v3-location-actions button').first()).toBeDisabled();
 const selection=page.locator('.v3-investigator-setup [aria-label="Výběr vyšetřovatele"]');
 await expect(selection).toBeVisible();
 await page.screenshot({path:'test-results/blackwater-v3-desktop.png',fullPage:true});
 // Starting a new game must not require discovering controls in a hidden story modal.
 await selection.getByRole('button').first().click();
 await expect(selection).toBeHidden();
 await page.screenshot({path:'test-results/blackwater-v3-in-game.png',fullPage:true});
 await page.locator('.v3-location-actions button').first().click();
 await expect(page.locator('#v3-story-dialog')).toBeVisible();
 await expect(page.locator('#v3-story-dialog #storyPanel')).toBeVisible();
 // Empty card art must not consume most of the modal; the draw action stays visible.
 await expect(page.locator('#v3-story-dialog .card-art.empty')).toBeHidden();
 await expect(page.locator('#v3-story-dialog #draw')).toBeEnabled();
 await page.locator('#v3-story-dialog #draw').click();
 await expect(page.locator('#v3-story-dialog .card-art.empty')).toHaveCount(0);
 // A narrative-led story card: explain what happened before showing bonuses and equipment.
 const narrativeTop = await page.locator('#v3-story-dialog #cardStory').evaluate(el => el.getBoundingClientRect().top);
 const equipmentTop = await page.locator('#v3-story-dialog [aria-label="Výbava vyšetřovatele"]').evaluate(el => el.getBoundingClientRect().top);
 expect(narrativeTop).toBeLessThan(equipmentTop);
 await expect(page.locator('#v3-story-dialog .actions')).toHaveCSS('position','static');
 const overlap=await page.locator('#v3-story-dialog #storyPanel').evaluate(panel=>{
   const choices=panel.querySelector('.choices').getBoundingClientRect();
   const actions=panel.querySelector('.actions').getBoundingClientRect();
   return choices.bottom-actions.top;
 });
 expect(overlap).toBeLessThanOrEqual(1);
 await page.screenshot({path:'test-results/blackwater-v3-story-card.png',fullPage:true});
 await page.getByRole('button',{name:'Zpět na mapu'}).click();
 await expect(page.locator('#v3-story-dialog')).not.toBeVisible();
});
test('V3 mobile layout remains usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('./index.html?ui=v3');
 await expect(page.locator('.v3-board .map-panel')).toBeVisible();
 await expect(page.locator('.v3-location-panel')).toBeVisible();
 await expect(page.locator('.v3-location-panel #placeTitle')).toBeVisible();
 const selection=page.locator('.v3-investigator-setup [aria-label="Výběr vyšetřovatele"]');
 await expect(selection).toBeVisible();
 const startingHud=await page.locator('.v3-hud').boundingBox();
 const startingMap=await page.locator('.map-panel').boundingBox();
 expect(startingHud.y).toBeLessThan(startingMap.y);
 const columns = await page.locator('#places').evaluate(element =>
   getComputedStyle(element).gridTemplateColumns.split(/\s+/).map(value => Number.parseFloat(value))
 );
 expect(columns).toHaveLength(2);
 expect(columns.every(width => Number.isFinite(width) && width > 0)).toBe(true);
 await page.screenshot({path:'test-results/blackwater-v3-mobile.png',fullPage:true});
 await selection.getByRole('button').first().click();
 await expect(selection).toBeHidden();
 const playingHud=await page.locator('.v3-hud').boundingBox();
 const playingMap=await page.locator('.map-panel').boundingBox();
 expect(playingMap.y).toBeLessThan(playingHud.y);
 await page.screenshot({path:'test-results/blackwater-v3-mobile-in-game.png',fullPage:true});
});
test('classic mode is unchanged',async({page})=>{
 await page.goto('./index.html');
 await expect(page.locator('.v3-hud')).toHaveCount(0);
 await expect(page.locator('#storyPanel')).toBeVisible();
});

test('V3 combat screen uses actual encounter controls, survives closing and reveals the result',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0.99;});
 await page.goto('./index.html?ui=v3');
 await page.locator('.v3-investigator-setup').getByRole('button',{name:/Námořník · HP 7/}).click();
 await page.locator('[data-location-id="location-2"]').click();
 await page.locator('.v3-location-actions button').filter({hasText:'Prozkoumat'}).click();
 await page.getByRole('button',{name:'Střetnutí: Mlžný pes · 1 AP',exact:true}).click();
 const battle=page.locator('#v3-combat-dialog');
 await expect(battle).toBeVisible();
 await expect(battle.locator('#v3-battle-enemy')).toHaveText('Mlžný pes');
 await expect(battle.locator('#v3-battle-enemy-art')).toHaveCSS('background-image',/fog-hound\.webp/);
 await expect(battle.locator('#v3-battle-hp')).toContainText('Životy 7');
 await page.screenshot({path:'test-results/blackwater-v3-combat.png',fullPage:true});
 await battle.locator('#v3-battle-close').click();
 await expect(battle).not.toBeVisible();
 await expect(page.locator('.v3-combat-reopen')).toBeVisible();
 await page.locator('.v3-combat-reopen').click();
 await expect(battle).toBeVisible();
 await battle.getByRole('button',{name:'🎲 Zaútočit',exact:true}).click();
 await expect(battle.locator('#v3-battle-dice .v3-battle-die')).toHaveText(['6','6']);
 await expect(battle).toContainText('Nepřítel byl poražen.');
 await expect(battle.locator('#v3-battle-enemy')).toHaveText('Mlžný pes');
 await page.screenshot({path:'test-results/blackwater-v3-combat-outcome.png',fullPage:true});
 await battle.locator('#v3-battle-close').click();
 await expect(battle).not.toBeVisible();
 await expect(page.locator('.v3-combat-reopen')).toBeHidden();
 await expect(page.locator('#v3-story-dialog')).not.toBeVisible();
});
test('V3 story card presentation reflects the actual engine card type',async({page})=>{
 await page.goto('./index.html?ui=v3');
 await page.locator('.v3-investigator-setup').getByRole('button').first().click();
 await page.locator('.v3-location-actions button').filter({hasText:'Prozkoumat'}).click();
 await page.locator('#v3-story-dialog #draw').click();
 const tag=await page.locator('#cardTag').innerText();
 const kind=tag.startsWith('UDÁLOST')?'event':tag.startsWith('SETKÁNÍ')?'encounter':tag.startsWith('DŮKAZ')?'evidence':tag.startsWith('PŘEDMĚT')?'item':'exploration';
 await expect(page.locator('#v3-story-dialog')).toHaveAttribute('data-story-type',kind);
 await expect(page.locator('#v3-story-dialog #cardArt')).toBeVisible();
});
