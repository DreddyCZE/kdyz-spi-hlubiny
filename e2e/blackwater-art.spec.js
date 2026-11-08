import { test, expect } from '@playwright/test';
import { cp, mkdir } from 'node:fs/promises';
import { blackwaterAssetPaths } from '../src/data/story-art.js';
import { blackwaterContent } from '../src/engine/blackwater.js';

const live = process.env.BLACKWATER_PREVIEW_URL;
const entry = live || './blackwater.html';
async function painted(locator) {
  await expect(locator).toBeVisible();
  const result = await locator.evaluate(async el => {
    const style = getComputedStyle(el);
    const src = style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    if (!src) return {src:null};
    const image = new Image(); image.src = src; await image.decode();
    return { src, width:el.getBoundingClientRect().width, height:el.getBoundingClientRect().height, naturalWidth:image.naturalWidth };
  });
  expect(result.src).toMatch(/\.webp$/);
  expect(result.width).toBeGreaterThan(10);
  expect(result.height).toBeGreaterThan(10);
  expect(result.naturalWidth).toBeGreaterThanOrEqual(256);
  return result.src;
}
const snapshot = page => page.evaluate(() => localStorage.getItem('ksh-blackwater-v1'));
async function choose(page, name='Detektiv') {
  await page.goto(entry);
  await page.getByRole('button', { name:new RegExp('^'+name+' ') }).click();
  await expect(page.locator('#game')).toBeVisible();
}

test('all registered rasters load and decode in the built Pages preview subdirectory', async ({ page },testInfo) => {
  if (!live) {
    await mkdir('.cache/m4-preview-qa/kdyz-spi-hlubiny/preview', {recursive:true});
    await cp('dist', '.cache/m4-preview-qa/kdyz-spi-hlubiny/preview', {recursive:true});
  }
  await page.goto(live || '/.cache/m4-preview-qa/kdyz-spi-hlubiny/preview/blackwater.html');
  for (const path of blackwaterAssetPaths) {
    const url = new URL(path,page.url()).href;
    const response=await page.request.get(url);
    expect(response.status(),url).toBe(200);
    expect(response.headers()['content-type']).toMatch(/image\/webp/);
    const bytes=await response.body();
    expect(bytes.toString('ascii',0,4)).toBe('RIFF');
    expect(bytes.toString('ascii',8,12)).toBe('WEBP');
    expect(await page.evaluate(async url => {const image=new Image();image.src=url;await image.decode();return image.naturalWidth;},url)).toBeGreaterThanOrEqual(256);
  }
  // Static contact sheets for visual QA of every actual raster, never part of the game UI.
  const urls=blackwaterAssetPaths.map(path=>new URL(path,page.url()).href);
  await page.setViewportSize({width:1600,height:1000});
  for(let start=0;start<urls.length;start+=16){
    await page.setContent('<style>body{margin:0;padding:12px;background:#132321;color:#ead7b2;font:16px Georgia}main{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}figure{margin:0}img{width:100%;height:205px;object-fit:contain;background:#071315}figcaption{padding:4px}</style><main>'+urls.slice(start,start+16).map(url=>'<figure><img src="'+url+'"><figcaption>'+url.split('/').at(-1)+'</figcaption></figure>').join('')+'</main>');
    await page.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    await page.screenshot({path:testInfo.outputPath('art-contact-'+start+'.png')});
  }

});

for (const name of ['Detektiv','Okultistka','Námořník']) test(`investigator portrait persists in selection, detail and save: ${name}`, async ({page}) => {
  await page.goto(entry);
  const button=page.getByRole('button',{name:new RegExp('^'+name+' ')});
  const src=await painted(button.locator('.selection-portrait'));
  await button.click();
  expect(await painted(page.locator('#miniPortrait'))).toBe(src);
  const saved=await snapshot(page);
  await page.locator('#investigatorOpen').click();
  expect(await painted(page.locator('#characterGlyph'))).toBe(src);
  await page.locator('#investigatorClose').click();
  expect(await snapshot(page)).toBe(saved);
  await page.reload();
  expect(await painted(page.locator('#miniPortrait'))).toBe(src);
  expect(await snapshot(page)).toBe(saved);
});

for (const width of [1440,390,320]) test(`Blackwater illustrated scene sequence and combat ${width}px`, async ({page},testInfo) => {
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{Math.random=()=>.5;});
  const errors=[],failed=[];const requested=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  page.on('request',r=>requested.push(r.url()));
  await page.goto(entry);
  await page.screenshot({path:testInfo.outputPath(`selection-${width}.png`)});
  await page.getByRole('button',{name:/^Detektiv /}).click();
  expect(requested.some(url=>url.includes('/bw-00-01.webp'))).toBe(false);
  await page.clock.install();
  await page.locator('#draw').click();
  await expect(page.locator('#cardTitle')).toHaveText('Zvon v mlze');
  const encounter=await painted(page.locator('#storyArt'));
  expect(encounter).toContain('bw-00-01.webp');
  const card=blackwaterContent.byId['bw-00-01'];
  const secretTexts=[...new Set(card.choices.flatMap(c=>Object.values(c.outcomes).map(o=>o.text)))];
  for (const text of secretTexts) expect(await page.locator('body').innerHTML()).not.toContain(text);
  expect(requested.some(url=>url.includes('/bw-00-02.webp'))).toBe(false);
  await page.locator('#choices button').first().click();
  await page.clock.fastForward(1200);
  await expect(page.locator('#outcomeDialog')).toBeVisible();
  await painted(page.locator('#outcomeArt'));
  await page.screenshot({path:testInfo.outputPath(`outcome-${width}.png`)});
  await page.locator('#outcomeContinue').click();
  if (await page.locator('#rewardDialog').isVisible()) await page.locator('#rewardContinue').click();
  const saved=await snapshot(page);
  await page.reload();
  expect(await snapshot(page)).toBe(saved);
  await expect(page.locator('#next')).toBeEnabled();
  await page.locator('#next').click();
  await page.getByRole('button',{name:/Staré město/}).click();
  await expect(page.locator('#transitionDialog')).toBeVisible();
  expect(await painted(page.locator('#transitionArtwork'))).toContain('old-town.webp');
  await page.screenshot({path:testInfo.outputPath(`travel-${width}.png`)});
  await page.locator('#transitionContinue').click();
  await page.locator('#draw').click();
  expect(await painted(page.locator('#storyArt'))).toContain('bw-01-01.webp');
  // Myth cards are revealed only by an actual end-of-round action.
  await page.locator('#endRound').click();
  await expect(page.locator('#mythCardTitle')).toHaveText('První úder');
  expect(await painted(page.locator('#mythIllustration'))).toContain('myth-bell.webp');
  const emblem=await page.locator('#mythGlyph').boundingBox();expect(emblem.width).toBeLessThanOrEqual(40);expect(emblem.height).toBeLessThanOrEqual(40);
  await page.screenshot({path:testInfo.outputPath(`myth-${width}.png`)});
  await page.locator('#mythConfirm').click();
  await page.locator('#endRound').click();
  await expect(page.locator('#mythCardTitle')).toHaveText('Mlžná stěna');
  expect(await painted(page.locator('#mythIllustration'))).toContain('myth-fog.webp');
  await page.locator('#mythConfirm').click();
  await page.locator('#enemies button').first().click();
  await expect(page.locator('#battleDialog')).toBeVisible();
  expect(await painted(page.locator('#battleInvestigatorArt'))).toContain('detective.webp');
  expect(await painted(page.locator('#battleMonsterArt'))).toContain('drowned.webp');
  const combat=page.locator('#battleDialog');
  expect(await combat.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const action=page.getByRole('button',{name:'⚔ Zaútočit · hod 2 kostkami',exact:true});
  await expect(action).toBeInViewport();
  await page.screenshot({path:testInfo.outputPath(`combat-${width}.png`)});
  await action.click();
  await expect(page.locator('#battleOutcomeDialog')).toBeVisible();
  await painted(page.locator('#battleOutcomeSeal'));
  await page.locator('#battleOutcomeContinue').hover();
  const contrast=await page.locator('#battleOutcomeContinue').evaluate(el=>{
    const style=getComputedStyle(el),lum=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
    const a=lum(style.color),b=lum(style.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({path:testInfo.outputPath(`combat-result-${width}.png`)});
  await page.locator('#battleOutcomeContinue').click();
  // Banish uses the existing consumable, and opens no unrelated scene or reward.
  await page.locator('#battleItems').getByRole('button',{name:/Posvěcená sůl/}).click();
  await page.locator('#battleActions').getByRole('button',{name:'Pokračovat →',exact:true}).click();
  await expect(page.locator('#battleDialog')).toBeHidden();
  expect(errors).toEqual([]);expect(failed).toEqual([]);
});

test('animated encounter hides result until dice stop; generated art never leaks future outcomes', async ({page}) => {
  await page.addInitScript(()=>{Math.random=()=>.5;});await choose(page);
  await page.clock.install();await page.locator('#draw').click();
  await page.locator('#choices button').first().click();
  await expect(page.locator('#outcomeDialog')).toBeHidden();
  await expect(page.locator('#result')).toHaveText('Osud rozhoduje…');
  await page.clock.fastForward(1200);
  await expect(page.locator('#outcomeDialog')).toBeVisible();
  await painted(page.locator('#outcomeArt'));
});

for(const [enemyId,asset] of [['enemy-drowned-sailor','drowned'],['enemy-fog-hound','fog-hound'],['enemy-hollow-orderly','hollow-orderly'],['enemy-bell-keeper','bell-keeper']]) {
 test(`saved combat restores the correct monster portrait: ${enemyId}`,async({page})=>{
  await page.goto(entry);
  await page.evaluate(async enemyId=>{
   const {newBlackwaterGame,blackwaterTransition}=await import('./src/engine/blackwater.js');
   const {saveBlackwater}=await import('./src/engine/blackwater-storage.js');
   let s=newBlackwaterGame();s=blackwaterTransition(s,{type:'selectInvestigator',investigatorId:'detective',revision:s.revision});
   // Fixture changes only the spawn; combat still starts through the production transition.
   s.myth.enemies=[{enemyId,locationId:s.game.locationId}];
   s=blackwaterTransition(s,{type:'startCombat',enemyId,revision:s.revision});
   saveBlackwater(localStorage,s);
  },enemyId);
  await page.reload();
  const before=await snapshot(page);
  await expect(page.locator('#battleDialog')).toBeVisible();
  expect(await painted(page.locator('#battleMonsterArt'))).toContain('/'+asset+'.webp');
  expect(await snapshot(page)).toBe(before);
 });
}
