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
 const selection=page.locator('.v3-investigator-setup [aria-label="Výběr vyšetřovatele"]');
 await expect(selection).toBeVisible();
 await page.screenshot({path:'test-results/blackwater-v3-desktop.png',fullPage:true});
 // Starting a new game must not require discovering controls in a hidden story modal.
 await selection.getByRole('button').first().click();
 await expect(selection).toBeHidden();
 await page.screenshot({path:'test-results/blackwater-v3-in-game.png',fullPage:true});
 await page.getByRole('button',{name:'📜 Otevřít příběhovou kartu'}).click();
 await expect(page.locator('#v3-story-dialog')).toBeVisible();
 await expect(page.locator('#v3-story-dialog #storyPanel')).toBeVisible();
 // Empty card art must not consume most of the modal; the draw action stays visible.
 await expect(page.locator('#v3-story-dialog .card-art.empty')).toBeHidden();
 await expect(page.locator('#v3-story-dialog #draw')).toBeEnabled();
 await page.locator('#v3-story-dialog #draw').click();
 await expect(page.locator('#v3-story-dialog .card-art.empty')).toHaveCount(0);
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
 await expect(page.locator('#places')).toHaveCSS('grid-template-columns',/\d+px \d+px/);
 await page.screenshot({path:'test-results/blackwater-v3-mobile.png',fullPage:true});
});
test('classic mode is unchanged',async({page})=>{
 await page.goto('./index.html');
 await expect(page.locator('.v3-hud')).toHaveCount(0);
 await expect(page.locator('#storyPanel')).toBeVisible();
});
