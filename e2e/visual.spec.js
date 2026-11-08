import { test, expect } from '@playwright/test';
for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:844}]){
  test(`vizuální systém ${viewport.width}`,async({page},testInfo)=>{
    await page.setViewportSize(viewport);
    const mapResponse=page.waitForResponse(response=>new URL(response.url()).pathname==='/dist/src/assets/blackwater-map.webp');
    await page.goto('./');
    await page.locator('#draw').click();
    const response=await mapResponse;
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/webp');
    expect((await response.body()).length).toBeLessThan(1_000_000);
    await expect(page.locator('#cardTitle')).toHaveText('Ztracená loď');
    const dimensions=await page.evaluate(async()=>{
      const image=new Image();
      image.src=getComputedStyle(document.getElementById('places')).getPropertyValue('--map-art').trim().slice(5,-2);
      await image.decode();
      return [image.naturalWidth,image.naturalHeight];
    });
    expect(dimensions).toEqual([1402,1122]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`table-${viewport.width}.png`),fullPage:true});
    await testInfo.attach(`Herní stůl ${viewport.width}`,{path:testInfo.outputPath(`table-${viewport.width}.png`),contentType:'image/png'});
  });
}

test('jiný prezentační motiv mění pouze povolené tokeny',async({page})=>{
  await page.goto('./');
    await page.locator('#draw').click();
  const saved=await page.evaluate(()=>localStorage.getItem('hlubiny-v4'));
  await page.evaluate(async()=>{
    const {applyPresentation}=await import('./src/ui/presentation.js');
    applyPresentation(document.documentElement,{id:'test-theme',theme:{'--color-surface':'#112233','--unknown-token':'bad'}});
  });
  await expect(page.locator('html')).toHaveAttribute('data-theme','test-theme');
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim())).toBe('#112233');
  expect(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--unknown-token'))).toBe('');
  expect(await page.evaluate(()=>localStorage.getItem('hlubiny-v4'))).toBe(saved);
  await expect(page.locator('#cardTitle')).toHaveText('Ztracená loď');
});
