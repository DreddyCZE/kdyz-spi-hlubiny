import { test, expect } from '@playwright/test';

for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
  test(`mapa, přehledy a reload ${viewport.width}`, async ({page},testInfo)=>{
    await page.setViewportSize(viewport);
    await page.goto('./');
    const points=page.locator('#places button');
    await expect(points).toHaveCount(7);
    await expect(page.locator('[aria-current="location"]')).toContainText('Přístav');
    await page.getByRole('button',{name:'◇ Knihovna',exact:true}).click();
    await expect(page.locator('#placeTitle')).toHaveText('Knihovna');
    await expect(page.locator('#ap')).toHaveText('2');
    await page.reload();
    await expect(page.locator('#placeTitle')).toHaveText('Knihovna');
    await expect(page.locator('#ap')).toHaveText('2');
    await page.getByRole('button',{name:'Vyšetřovatel',exact:true}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#heroStats')).toContainText('Eleanor Whitmore');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Vyšetřovatel',exact:true})).toBeFocused();
    await page.getByRole('button',{name:'Deník · důkazy',exact:true}).click();
    await expect(page.locator('#journal-evidence')).toBeVisible();
    await expect(page.locator('#deduce')).toBeDisabled();
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Znalosti',exact:true}).click();
    await expect(page.locator('#journal-knowledge')).toBeFocused();
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Herní záznam',exact:true}).click();
    await expect(page.locator('#log')).toContainText('Přesun: Knihovna');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.evaluate(async()=>{
      const url=getComputedStyle(document.getElementById('places')).backgroundImage.slice(5,-2);
      const image=new Image();image.src=url;await image.decode();
    });
    await page.screenshot({path:testInfo.outputPath(`table-${viewport.width}.png`),fullPage:true});
    await testInfo.attach(`Herní stůl ${viewport.width}`,{path:testInfo.outputPath(`table-${viewport.width}.png`),contentType:'image/png'});
  });
}

test('zamčené body, žádné AP a konec hry blokují přesun',async({page})=>{
  await page.goto('./');
  await page.evaluate(async()=>{
    const {newState}=await import('./src/engine/game.js');
    const {save}=await import('./src/engine/storage.js');
    save(localStorage,{...newState(),unlockedLocations:['location-0','location-1']});
  });
  await page.reload();
  const locked=page.getByRole('button',{name:'▣ Knihovna · zamčeno',exact:true});
  await expect(locked).toBeDisabled();
  await expect(locked).toHaveClass(/locked/);
  await page.getByRole('button',{name:'◇ Staré město',exact:true}).click();
  await expect(page.locator('#ap')).toHaveText('2');
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('hlubiny-v3'));s.ap=0;localStorage.setItem('hlubiny-v3',JSON.stringify(s));});
  await page.reload();
  await expect(page.getByRole('button',{name:'◇ Přístav',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Další kolo',exact:true}).click();
  await expect(page.locator('#ap')).toHaveText('3');
  for(let i=0;i<6;i++)await page.locator('#endRound').click();
  await expect(page.locator('#gameStatus')).toContainText('Konec scénáře');
  await expect(page.getByRole('button',{name:'◇ Přístav',exact:true})).toBeDisabled();
});

test('scénář bez mapy má čitelný seznam a vlastní názvy',async({page})=>{
  await page.goto('./');
  await page.evaluate(async()=>{
    const {renderMap}=await import('./src/ui/map.js');
    renderMap(document.getElementById('places'),[{id:'room',name:'Čítárna'}],null,{locationId:'elsewhere',unlockedLocations:['room'],ap:1,ended:false},false,()=>{});
  });
  await expect(page.locator('#places')).not.toHaveClass(/mapped/);
  await expect(page.getByRole('button',{name:'◇ Čítárna',exact:true})).toBeVisible();
});

test('reset během hodu zruší animaci a zachová nový save',async({page})=>{
  await page.goto('./');
  await page.clock.install();
  await page.locator('#roll').click();
  await expect(page.locator('#reveal')).toBeEmpty();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#reset').click();
  await page.clock.fastForward(1100);
  await expect(page.locator('#ap')).toHaveText('3');
  await expect(page.locator('#reveal')).toBeEmpty();
  await page.reload();
  await expect(page.locator('#ap')).toHaveText('3');
  await expect(page.locator('#roll')).toBeEnabled();
});

test('omezený pohyb odhalí výsledek bez animace a výběr zachová focus',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('./');
  const choice=page.locator('#choices button').first();
  await choice.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#choices button').first()).toBeFocused();
  await page.locator('#roll').click();
  await expect(page.locator('#reveal')).toBeVisible();
  expect(await page.locator('#die1').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
