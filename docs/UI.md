# Digitální herní stůl – M3.0.2a

## Čitelný průchod B/C – 2026-11-18

Základ je nasazený commit `1ac4a02`. Balíček neotevřené lokace má podobu malého stohu a akci **Prozkoumat lokaci**. Přehled uvádí skutečnou aktuální lokaci a dostupnost další karty; dobraná karta zůstává vedle mapy a ceny voleb jsou přímo v tlačítkách.

Po potvrzení hodu se pod dosaženým výsledkem zobrazí rozdíl skutečného stavu před a po přechodu: HP/SAN/AP/hrozba a nově získané stopy, znalosti či výbava. [result-changes.js](../src/ui/result-changes.js) neodvozuje efekty z textu ani obsahových definic. Volitelná pomocná cache v `sessionStorage`, oddělená od herního save, uchová souhrn pouze pro odpovídající revizi a výsledek. Její chyba neovlivní hru. Reload neprovádí akci ani neopakuje zvýrazňovací animaci; starší výsledek bez pomocného souhrnu zůstane čitelný bez domýšlení změn. Formát herního ukládání ani pravidla se nemění.

Mlha se zvedá má vlastní ilustrovanou kartu s výslovným místem dopadu a termínem. Zavření nezmění uložené ohrožení ani značku a text u mapy. Kronika obsahuje samostatný přehled již vyhodnocených mýtů včetně dosaženého následku. Nový [clear-journey.spec.js](../e2e/clear-journey.spec.js) ověřuje celý průchod na 320/390/1440 px, klávesnici, reload během hodu i po potvrzení a zachované varování po zavření mýtu.

## Živý mýtus – Mlha se zvedá (2026-11-17)

Existující fáze Mýtus po 1. kole ukáže ilustrovanou kartu Mlha se zvedá. Přístav dostane výstražný obrys a značku; text u mapy i karta výslovně uvádějí termín při ukončení 2. kola, ztrátu 1 SAN a možnost odejít běžným přesunem za 1 AP. Varování u mapy přetrvá zavření karty a reload. Po reloadu pending události se znovu otevře informační karta bez herního přechodu. Po vyhodnocení značka zmizí; varování i výsledek jsou v Kronice Deníku.

Pravidlo a kompatibilita starších pozic jsou popsány v [design.md](design.md). Testy [delayed-threats.test.js](../tests/delayed-threats.test.js) ověřují setrvání, odchod, návrat, smrtelnou ztrátu SAN, revize, validaci, starší save a skutečné získání přístavních důkazů bez blokace mlhou. [live-myth.spec.js](../e2e/live-myth.spec.js) pokrývá setrvání i odchod, reload před i po vyhodnocení, starší save a kroniku na 320/1440 px.

Finální ověření: **262/262 unit testů, 19/19 souvisejících Chromium testů** (1,1 minuty), build a `git diff --check`. Zahrnuty jsou všechny tři vítězné příběhové průchody i mobilní průchody na 320/390 px. Ilustrovaná karta a značka ohrožení byly vizuálně zkontrolovány na 320 a 1440 px. Dřívější simulace vyvážení se s novou ztrátou SAN znovu nespouštěly; nejde o nové potvrzení celkového balansu. Commit ani publikace tohoto kroku neproběhly.

## Sjednocený deník B/C – 2026-11-17

Spodní přehledy hlavního Blackwateru sjednocuje jediné tlačítko **Deník**. Dialog má záložky **Vyšetřovatel**, **Důkazy a znalosti**, **Dedukce**, **Výbava** a **Kronika**. Vyšetřovatel ukazuje stávající portrét, HP/SAN s limity, atributy, popis aktivní schopnosti, její použitelnost a pasivní schopnost. Důkazy a znalosti sdílejí záložku, ale zachovávají oddělené seznamy získaných informací. Dedukce a kronika používají dosavadní veřejné projekce.

Schopnosti a vybavení zůstávají stejnými komponentami se stejnými akcemi: při otevření se přesunou do deníku a při zavření zpět ke stolu. Nevznikají duplicitní akce ani další uložený stav. Původní režim si zachovává své přehledy. Šipky, Home a End přepínají záložky; Escape i Zavřít přehled vracejí fokus na konkrétní otevírací tlačítko. Po použití schopnosti se fokus zachová na záložce vyšetřovatele.

Aktivní souboj nabízí vlastní tlačítko Deník. Deník se otevře nad soubojem, ponechá herní akce zablokované podle současného veřejného stavu a po zavření vrátí fokus do souboje. Prohlížení, přepínání záložek ani zavření nemění save. Během animace zůstávají HP/SAN u předchozího veřejného stavu.

Ověření: **256/256 unit testů, 32/32 souvisejících Chromium testů** (deník, herní stůl, postavy, karetní výsledky a dialog souboje). Po závěrečné úpravě nadpisu a fokusu znovu prošly **4/4 nové regrese deníku**. Mobilní šířky 320/390 px a desktop 1440 px ověřují záložky, rozměry, schopnost, nezměněný save při čtení, reload, klávesnici i návrat fokusu v souboji. Snímky 320 a 1440 px byly vizuálně zkontrolovány. `npm run build` a `git diff --check` procházejí. Engine, pravidla, formát save a referenční prototypy se nemění.

## Dialog souboje – 2026-11-17

Aktivní souboj hlavního scénáře se otevírá v nativním dialogu s portréty vyšetřovatele a protivníka, jejich HP a vyšetřovatelovým SAN. Útok a únik používají původní atomický přechod i zakryté kostky během animace. Po dokončení souboje se dosažený výsledek vrací na stůl a fokus na nadpis příběhu. Reload aktivní souboj znovu otevře bez další platby nebo hodu.

Escape a tlačítko **Zpět ke stolu** pouze skryjí dialog a vrátí fokus na **Pokračovat v souboji**. Tento přehledový krok nemění save ani nenahrazuje herní únik. Dialog lze znovu otevřít klávesnicí; ovládání útoku a úniku zůstává dostupné na 320 px. Životní cyklus prezentace spravuje [combat-dialog.js](../src/ui/combat-dialog.js), bez změny enginu a formátu save. Regrese jsou v [combat-dialog.spec.js](../e2e/combat-dialog.spec.js).

## Aktuální herní stůl B/C – 2026-11-12

Hlavní scénář používá dominantní ilustrovanou mapu a souvislou pergamenovou plochu pro průzkum, testy, souboj a hádanky. Desktopový poměr sloupců je 1,55 : 1; kompaktní panel u mapy ukazuje portrét, roli a skutečné HP/SAN/AP včetně limitů zvolené postavy. Výbava a schopnost jsou u mapy, mimo příběh. Spodní přehledy tvoří nízkou lištu. Na mobilu zůstává mapa s dvousloupcovým seznamem míst; přichycené odkazy Mapa / Příběh a akce / Výbava umožňují rychle přejít k ovládání bez změny save.

[table.css](../src/ui/table.css) rozšiřuje společné tokeny; [table.js](../src/ui/table.js) prezentuje jen veřejný scénářový pohled a dosažené hodnoty. Lišta fází ukazuje průzkum, mýtus, souboj a dostupné hádanky. Krátké vstupní animace jsou kosmetické a `prefers-reduced-motion` je vypíná. Mýtus je přehled skutečně dokončeného kola a aktuálních hodin, nikoli nové losování události. Jeho zavření ani reload nepřepočítávají stav.

První hod i přehod ukazují během animace zakryté kostky a zamknuté potvrzení. Po zastavení zůstávají kostky viditelné; následky odhalí až Přijmout výsledek. Souboj používá ilustraci nepřítele a stejný rytmus kostek. Po dobu animace se zobrazuje předchozí veřejný stav souboje a další akce jsou zamčené. Dokončená výměna je uložená atomicky před kosmetickou animací; reload ji obnoví bez dalšího hodu. Reset animaci ruší. Ukládací schéma a herní pravidla se nemění.

Následující popis dokumentuje původní milník M3; aktuální potvrzovaný hod a scénářové save mají přednost před historickým popisem okamžitého odhalení.

Rozhraní zachovává přechody, pravidla, veřejné projekce, ukládání v3 a migrace M1/M2.1/M2.2. Desktop má mapu a skutečnou příběhovou kartu v poměru 60:40, pod 760 px se skládají pod sebe. Mapa, pergamenová karta, žetony stavu a spodní komponenty jsou samostatné HTML/CSS prvky. Referenční obrázek slouží pouze jako vizuální směr.

## Design tokeny

[tokens.css](../src/ui/tokens.css) je centrální zdroj vzhledu, [styles.css](../src/ui/styles.css) obsahuje rozložení a komponenty. CSS import je relativní a funguje pod adresářem GitHub Pages.

| Skupina | Tokeny / účel |
| --- | --- |
| Barvy | `--color-surface`, `--color-surface-raised`, `--color-petrol`, `--color-wine`, `--color-paper*`, `--color-brass*`, `--color-frame`, `--color-ink`, `--color-muted` |
| Stavy | `--color-current`, `--color-available`, `--color-locked`, `--color-focus`, `--color-health`, `--color-sanity` |
| Typografie | `--font-story` (lokální Georgia/Times), `--font-label` (systémový sans), `--text-small/body/story/title` |
| Rozestupy | `--space-1` až `--space-6`: 4, 8, 12, 16, 24, 32 px |
| Rámy a stíny | `--frame`, `--radius`, `--shadow-piece`, `--shadow-panel` |
| Materiály | `--texture-wood`, `--texture-paper`, `--texture-leather` |

Textury používají statické CSS gradienty a lokální jemné SVG zrno, bez animace pozadí nebo externích fontů. Stíny a rámy oddělují komponenty od mapové ilustrace. Neprůhledné pergamenové štítky udržují čitelnost názvů na složitém podkladu; aktuální lokace má světlý dvojitý obrys, zamčená přerušovaný rám a explicitní text. Stav je vyjádřen i textem, ne pouze barvou. Horní žetony zobrazují skutečné Kolo, Hrozbu, Rituál, HP, SAN a AP, bez nových zdrojů. Dekorativní symboly ve skutečných elementech mají `aria-hidden`.

## Prezentace scénáře

[presentation.js](../src/data/presentation.js) spojuje mapu, registr lokací a barevný motiv výchozího Blackwater. [applyPresentation](../src/ui/presentation.js) nastavuje `data-theme` a povolené vizuální CSS tokeny na kořenovém elementu; při změně vyčistí staré přepisy. Motiv může měnit barvy a materiály bez úprav komponent. `--texture-paper` a `--texture-wood` dovolují jiné lokální textury; ilustraci mapy dodává `map.image`. Nejde o pravidla ani ukládaná data.

Bootstrap [app.js](../src/ui/app.js) nadále vybírá jedinou výchozí prezentaci a Eleanor Whitmore; podpora více scénářů bude vyžadovat výběr aktivního obsahu a vyšetřovatele. Tato příprava vizuální konfigurace nepřidává přepínač scénářů ani nový engine API.

## Mapová metadata a assety

[map.js](../src/data/map.js) zachovává stejná ID, `name` a procentní souřadnice; pouze `image` nyní odkazuje na optimalizovaný WebP. Názvy a popisy zůstávají v [locations.js](../src/data/locations.js). Klíčem bodu je stabilní ID; `x/y` jsou konečná čísla 0–100 od levého horního rohu. [renderMap](../src/ui/map.js) přijímá registr lokací, mapu, stav, příznak animace a callback přesunu. Kliknutí pouze předává existující `transition(move)`, dostupnost respektuje AP, odemčení, animaci i konec hry. Blackwater má od začátku stejných sedm odemčených lokací.

[blackwater-map.webp](../src/assets/blackwater-map.webp) je přímo kódovaná rasterová ilustrace 1402×1122 px, 868 818 B (úspora 85,52 % proti SVG/base64). Bez resamplingu či ořezu; původní SVG odstraněno. Kompozice, procentní souřadnice a mobilní seznam se nemění. Mobilní náhled explicitně používá background-size 100% 100%, aby WebP zachovalo původní roztažení SVG bez ořezu. Jde o pracovní AI art, nikoli finální schválenou ilustraci. Původ, prompt a měření WebP/AVIF v [ASSETS.md](ASSETS.md). [paper-grain.svg](../src/assets/paper-grain.svg) zůstává původní drobnou texturou.

## Mobilní a úzká mapa

Při šířce viewportu **1100 CSS px a méně** se všechny mapové ovladače přepnou pomocí CSS do jednosloupcového seznamu pod dekorativním náhledem mapy. Mezi 761 a 1100 px zůstává hlavní rozložení 60:40, ale úzký mapový sloupec už používá seznam. Pod 760 px jsou hlavní panely pod sebou. Nevznikají duplicitní tlačítka: stejný element mění pouze způsob rozložení. Žádný resize handler, změna souřadnic, složitý kolizní algoritmus ani změna uložené hry.

Štítky v seznamu mají nejméně 44 px, normálně zalamují text a nejsou absolutně umístěné. Aktuální, dostupné i zamčené lokace zůstávají jasně rozlišené. Tím se odstraňují známé mobilní překryvy M3.0.1 (Staré město/Hřbitov, Knihovna/Ústav, Ústav/Maják a přesah Jeskyně). Při chybějící mapě nebo neplatných/neúplných souřadnicích se seznam používá na všech šířkách, bez náhledu. CSS proměnná `--map-art` obsahuje URL vyřešené vůči HTML dokumentu, aby fungovala i z vložených stylů v podadresáři.

Nad 1100 px se používají původní souřadnice; nejde o obecný algoritmus řešení kolizí pro libovolně dlouhé názvy budoucích scénářů. Nový scénář musí otestovat názvy a vlastní mapu, případně zvolit vhodný breakpoint. Testy při 320, 390 a 1440 px procházejí všechny lokace kliknutím a měří nulové překryvy a přesahy pro aktuální Blackwater.

## Hra a přístupnost

Příběh a volby pocházejí pouze z `currentCard`, dosažený výsledek z `visibleResult`, deník z `investigationView`. Skrývání během hodu včetně logu, všech šest kategorií, ochrana před dvojím provedením a explicitní akce **Vyhodnotit důkazy** s revizí zůstávají beze změny. `#roll` respektuje i `state.ended`. Reset ruší časovač; přehledy, konec kola, log a automatické ukládání fungují dál.

Reload během animace záměrně **okamžitě odhalí již uložený výsledek**. Přechod, AP, odměna a kostky jsou uložené před kosmetickou animací. `rolling` a časovač žijí pouze v UI a neobnovují se. Neproběhne nový hod, platba ani následek; skrytí v DOM neznamená utajení localStorage. Regresní test zastaví čas, reloaduje před koncem animace a porovná nezměněný save.

Tab/Shift+Tab prochází ovládání, Enter/mezerník aktivuje tlačítka. Výběr zachovává focus a přesun zaměří nadpis příběhu. Přehledy jsou nativní `dialog`: Escape zavírá, focus se vrací na otevírací tlačítko. Horní odkaz přeskočí k příběhu. Texty se zapisují přes `textContent`. Dlouhá karta se na desktopu posouvá samostatně, na mobilu přirozeně se stránkou. `prefers-reduced-motion` vypíná pohyb a zkracuje čekání na výsledek; nové dekorace žádné animace nepřidávají.

## Ověření a porovnání

`npm test`, `npm run test:e2e`, `npm run build`, `git diff --check`. E2E běží proti produkčnímu buildu pod `/dist/` a pokrývá původní mechaniky, reload během hodu, koncový stav, fallback, dedukce a focus. Mapové testy navíc měří nulové překryvy/přesahy a ověřují klikání na všechny lokace při 320, 390 a 1440 px.

Screenshoty před úpravami pocházejí z main `ce14593`, po úpravách ze stejné počáteční hry a stejných viewportů. [Porovnání před/po](test-artifacts/m3-0-2a/README.md): 1440×1000, 390×844 a 320×844. E2E je znovu generuje do `test-results` a příloh reportu. Kontrolované kopie jsou záměrné testovací artefakty v dokumentaci; `dist` a běžné výstupy testů zůstávají ignorované.

Při budoucím načítání externích prezentačních definic bude nutné omezit také hodnoty CSS tokenů. Nynější allow-list kontroluje jen názvy a konfigurace je lokální a důvěryhodná; tato optimalizace mechanismus motivů nemění.
