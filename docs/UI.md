# Digitální herní stůl – M3.0.1

UI zachovává všechny přechody a veřejné projekce M2.2. Na desktopu má mapa a příběhová karta poměr 60:40; pod 760 px se skládají pod sebe. Karta na desktopu samostatně posouvá dlouhý obsah, mobil používá přirozený posun stránky. Spodní lišta otevírá nativní modální přehledy vyšetřovatele, inventáře, důkazů, znalostí, dedukcí a herního záznamu. Escape zavře přehled a vrátí focus na jeho otevírací tlačítko.

## Data mapy

[map.js](../src/data/map.js) obsahuje pouze prezentační metadata výchozího scénáře. Názvy, ID a popisy lokací zůstávají v [locations.js](../src/data/locations.js). [renderMap](../src/ui/map.js) přijímá celý aktivní registr lokací, volitelnou mapu, stav, příznak animace a callback přesunu. Nezná pravidla scénáře.

```js
{
  name: 'Blackwater',
  image: './src/assets/blackwater-map.svg',
  points: { 'location-0': { x: 68, y: 69 } }
}
```

`x` a `y` jsou konečná čísla 0–100: procenta šířky a výšky plochy mapy od levého horního rohu. Klíčem je stabilní ID lokace, nikoli pořadí. `image` je lokální cesta relativní k HTML stránce, kompatibilní s podadresářem GitHub Pages. Pokud mapa chybí nebo některý bod nemá platné souřadnice, všechny lokace se zobrazí jako čitelný seznam. Pro nový scénář předá hostitelské UI jeho vlastní registr a mapu; nepřidává ID do rendereru. Obrázek je dekorativní, stejné informace poskytují skutečná tlačítka s názvy a aktuálním stavem.

Aktuální lokace má `aria-current="location"` a světlý obrys; dostupné mají světlé štítky; zamčené tmavé přerušované rámy a explicitní text. Dostupnost přesunu vychází z AP, `unlockedLocations`, konce hry a animace. Kliknutí pouze předává `transition(move)`. Nová hra Blackwater nadále odemyká všech sedm lokací; test zamčení používá platnou uloženou fixture a nemění balanc.

## Hra a přístupnost

Příběh a volby pocházejí výhradně z `currentCard`, dosažený následek z `visibleResult`, deník z `investigationView`. Šest kategorií výsledků i ochrana revizí zůstávají v enginu. Během hodu se výsledek ani nový herní záznam nevkládají do DOM; akce hry a dedukce jsou zablokované. Výsledek je uložen před kosmetickou animací. `prefers-reduced-motion` vypíná pohyb a zkracuje čekání na odhalení. Reset ruší časovač.

Deník zachovává explicitní tlačítko **Vyhodnotit důkazy** a revizi akce; samotné otevření nic nevyhodnocuje. HP, SAN, AP, Kolo, Hrozba a Rituál jsou skutečné hodnoty stavu. Nevznikají nové zdroje, balíčky, boj ani vítězná podmínka. Schéma save v3, klíče a migrace M1/M2.1/M2.2 se nemění.

Klávesnice: Tab/Shift+Tab mezi ovládacími prvky, Enter/mezerník aktivuje tlačítka. Výběr volby zachovává focus; přesun zaměří nadpis příběhu. Přehledy používají nativní `dialog`, focus trap a Escape. Horní odkaz přeskakuje k příběhu. Texty se zapisují přes `textContent`.

## Grafika a kontrola

[Lokální SVG mapa](../src/assets/blackwater-map.svg) je původní stylizovaný dočasný podklad: pobřeží, uliční síť, domy, mola, maják a kompas. Materiály stolu a papíru tvoří CSS. Bez externích obrázků, fontů či nových závislostí. Finální ilustrace mohou tento podklad nahradit bez změny enginu.

E2E testy běží proti buildu pod `/dist/` a ověřují načtení SVG, mapové přesuny/AP/reload, zamčení, konec hry, fallback jiného scénáře, modální přehledy, dedukce, hody a reset během animace. Screenshoty desktopu 1440 px a mobilu 390 px se ukládají do `test-results/` a příloh Playwright reportu. Vybrané vizuálně zkontrolované snímky jsou v [testovacích artefaktech](../docs/test-artifacts/m3-0-1/).

## Upřesnění po revizi PR #4

### Konec hry a reload během hodu

Tlačítko `#roll` se explicitně zakazuje i při `state.ended`, nezávisle na dostupnosti projektované volby. E2E ověřuje konec sedmého kola s dosud nevyřešenou kartou, deaktivaci před i po reloadu a nezměněný save při syntetickém kliknutí.

Reload během animace **záměrně okamžitě odhalí již uložený výsledek**. Přechod, cena AP, odměna a kostky jsou zapsány před animací; příznak `rolling` a časovač jsou pouze v paměti UI. Po načtení se animace neobnovuje a žádný nový hod ani následek se neprovádí. Skrytí v DOM během animace není utajení výsledku v localStorage. Regresní E2E zastaví čas před hodem, zkontroluje skrytý DOM a uložené 4+4, reloaduje bez posunu času a ověří okamžité odhalení i byte-for-byte shodný save (včetně revize, AP a odměn).

### Mobilní mapa: ověřený rozsah a limity

Chromium E2E při šířkách 320 a 390 CSS px projde kliknutím všechny lokace včetně návratu do Přístavu. Při každé změně aktuální lokace změří obdélníky štítků a uloží seznam překryvů a přesahů jako JSON přílohu `mobile-map-overlaps` v Playwright reportu. Chybějící souřadnice ověří samostatně: celá mapa přejde na seznam sedmi tlačítek, dostupná tlačítka lze zasáhnout a stránka nepřetéká vodorovně.

Absolutně umístěné štítky **nemají automatické řešení kolizí**. S výchozími českými texty a fontem se částečně překrývají Staré město/Hřbitov; Knihovna/Ústav zejména při rozšíření aktuálního štítku. Při 320 px se navíc mohou překrýt Ústav/Maják a aktuální štítek Jeskyně mírně přesahuje pravý okraj mapy. Ověřené běžné kliknutí do každé lokace funguje, není však garantováno zasažení každého místa překrytého štítku. Delší názvy, text „zamčeno“, jiné systémové fonty, větší uživatelský text nebo další zúžení mohou kolize zvětšit. Validní souřadnice se kvůli překryvům samy nepřepínají na seznam. Klávesnicové ovládání tlačítek zůstává dostupné. Případné řešení kolizí nebo přepínač seznamu patří do budoucí úpravy prezentace; tato revize nemění souřadnice ani CSS.

### Budoucí refaktoring

Hlavní [app.js](../src/ui/app.js) v M3.0.1 nadále přímo importuje Blackwater mapu a lokace a zobrazuje Eleanor Whitmore. Obecný mapový renderer tuto vazbu nemá. Před podporou více scénářů bude potřeba bootstrap UI s aktivním scénářem a jeho vyšetřovatelem. Jde o budoucí refaktoring prezentace, nikoli o nové pravidlo nebo změnu enginu.
