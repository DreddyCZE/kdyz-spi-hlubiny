import {test,expect} from '@playwright/test';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {scenarioSaveKey} from '../src/engine/scenario-storage.js';

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
 await expect(page.locator('.v3-combat-reopen')).toBeHidden();
 await expect(page.locator('.v3-location-actions').getByRole('button',{name:/Prozkoumat/})).toBeDisabled();
 const selection=page.locator('.v3-investigator-setup [aria-label="Výběr vyšetřovatele"]');
 await expect(selection).toBeVisible();
 await page.screenshot({path:'test-results/blackwater-v3-desktop.png',fullPage:true});
 // Starting a new game must not require discovering controls in a hidden story modal.
 await selection.getByRole('button').first().click();
 await expect(selection).toBeHidden();
 await page.screenshot({path:'test-results/blackwater-v3-in-game.png',fullPage:true});
 await page.locator('.v3-location-actions').getByRole('button',{name:/Prozkoumat/}).click();
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

test('V3 new-round presentation reports real scenario clocks and survives reload',async({page})=>{
 await page.goto('./index.html?ui=v3');
 await page.locator('.v3-investigator-setup').getByRole('button').first().click();
 const previous=Number(await page.locator('#round').textContent());
 await page.locator('.v3-location-actions').getByRole('button',{name:/Ukončit kolo/}).click();
 await expect(page.locator('#round')).toHaveText(String(previous+1));
 const recap=page.locator('#v3-round-dialog');
 await expect(recap).toBeVisible();
 await expect(recap.getByRole('heading',{name:'Kolo '+(previous+1)})).toBeVisible();
 const actualThreat=(await page.locator('#threat').textContent()).trim();
 const actualRitual=(await page.locator('#ritual').textContent()).trim();
 await expect(recap.locator('.v3-round-counter').nth(0).locator('strong')).toHaveText(actualThreat);
 await expect(recap.locator('.v3-round-counter').nth(1).locator('strong')).toHaveText(actualRitual);
 await page.screenshot({path:'test-results/blackwater-v3-next-round.png',fullPage:true});
 await recap.getByRole('button',{name:/Pokračovat ve vyšetřování/}).click();
 await expect(recap).not.toBeVisible();
 await page.reload();
 await expect(page.locator('#round')).toHaveText(String(previous+1));
 await expect(page.locator('#v3-round-dialog')).not.toBeVisible();
});

test('V3 investigation dossier reuses real tabs and opens inventory without changing saves',async({page})=>{
 await page.goto('./index.html?ui=v3');
 await page.locator('.v3-investigator-setup').getByRole('button',{name:/Detektiv/}).click();
 const saveBefore=await page.evaluate(()=>JSON.stringify(Object.entries(localStorage).sort()));
 await page.locator('.v3-location-actions').getByRole('button',{name:/Důkazy a dedukce/}).click();
 const dossier=page.locator('#details.v3-dossier');
 await expect(dossier).toBeVisible();
 await expect(dossier.locator('.v3-journal-metrics')).toBeVisible();
 await expect(dossier.getByRole('tab',{name:/^Důkazy/})).toHaveAttribute('aria-selected','true');
 await dossier.getByRole('tab',{name:/^Znalosti/}).click();
 await expect(dossier.locator('#journal-knowledge')).toBeVisible();
 await dossier.locator('[data-dossier-target="inventory-panel"]').click();
 await expect(dossier.locator('#inventory-panel')).toBeVisible();
 await expect(dossier.locator('.v3-inventory-gallery')).toBeVisible();
 await expect(dossier.locator('.v3-equipment-grid')).toBeVisible();
 const count=await dossier.locator('.v3-equipment-card').count();
 expect(count).toBeGreaterThan(0);
 await page.screenshot({path:'test-results/blackwater-v3-inventory.png',fullPage:true});
 await dossier.locator('[data-dossier-target="investigation-journal"]').click();
 await expect(dossier.locator('#journal-knowledge')).toBeVisible();
 await page.screenshot({path:'test-results/blackwater-v3-dossier.png',fullPage:true});
 await dossier.locator('[data-dossier-target="history"]').click();
 await expect(dossier.locator('#history')).toBeVisible();
 await dossier.locator('[data-dossier-target="investigator"]').click();
 await expect(dossier.locator('#investigatorPortrait')).toBeVisible();
 await page.locator('#closeDetails').click();
 await expect(dossier).not.toBeVisible();
 const saveAfter=await page.evaluate(()=>JSON.stringify(Object.entries(localStorage).sort()));
 expect(saveAfter).toBe(saveBefore);
});
test('V3 dossier and equipment remain usable at phone width',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('./index.html?ui=v3');
 await page.locator('.v3-investigator-setup').getByRole('button',{name:/Detektiv/}).click();
 await page.locator('.v3-hud').getByRole('button',{name:/Vybavení/}).click();
 const dossier=page.locator('#details.v3-dossier');
 await expect(dossier).toBeVisible();
 await expect(dossier.locator('#inventory-panel')).toBeVisible();
 await expect(dossier.locator('.v3-equipment-card').first()).toBeVisible();
 const bounds=await dossier.boundingBox();
 expect(bounds.x).toBeGreaterThanOrEqual(0);
 expect(bounds.x+bounds.width).toBeLessThanOrEqual(391);
 expect(await dossier.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await page.screenshot({path:'test-results/blackwater-v3-inventory-mobile.png',fullPage:true});
 await dossier.locator('[data-dossier-target="investigation-journal"]').click();
 await expect(dossier.locator('.v3-journal-metrics')).toBeVisible();
 await expect(dossier.getByRole('tab',{name:/^Dedukce/})).toBeVisible();
 await page.screenshot({path:'test-results/blackwater-v3-dossier-mobile.png',fullPage:true});
});

test('V3 dossier equipment delegates to real scenario transitions and persists consumption',async({page})=>{
 await page.goto('./index.html?ui=v3');
 await page.locator('.v3-investigator-setup').getByRole('button',{name:/Detektiv/}).click();
 const key=scenarioSaveKey(blackwaterScenario);
 const before=await page.evaluate(key=>localStorage.getItem(key),key);
 await page.locator('.v3-hud').getByRole('button',{name:/Vybavení/}).click();
 const dossier=page.locator('#details.v3-dossier');
 const equipment=dossier.locator('.v3-equipment-grid');
 await expect(equipment).toContainText('Sůl');
 const use=equipment.getByRole('button',{name:'Použít předmět'}).first();
 await expect(use).toBeEnabled();
 await use.click();
 const after=await page.evaluate(key=>localStorage.getItem(key),key);
 expect(after).not.toBe(before);
 await expect(equipment).not.toContainText('Sůl');
 await page.locator('#closeDetails').click();
 await page.reload();
 await page.locator('.v3-hud').getByRole('button',{name:/Vybavení/}).click();
 await expect(page.locator('.v3-equipment-grid')).not.toContainText('Sůl');
 await expect(page.locator('.v3-hud')).toBeVisible();
});
