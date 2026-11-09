# Stav autonomní stabilizace – 2026-11-09

## Ověřený výchozí stav

HEAD `097f05d`, větev `feature/d4-narrative-conflict`. Před prací existovaly necommitnuté definice konfliktu a jeho registrace; zachovány a dokončeny. Vstupních 188 unit testů prošlo. GitHub byl aktualizován pomocí fetch a veřejného API, nikoli odhadem z roadmapy.

Otevřené PR: #19 (sjednocené UI do main), #20 (draft výběru vyšetřovatele do UI), #21 (draft mechanik vyšetřovatele do UI), #16 (draft animací do main). #20 a #21 mají překrývající se implementace, ale #20 není předkem #21. Pracovní integrace používá úplnější #21, ne obě varianty. Poslední ověřený běh #21 `42607695688` selhal v Chromium E2E. Starší issues #7, #9 a #11 mají implementace už v main; jejich otevřený stav není dokladem chybějící funkce.

## Implementace a opravy

- D4 pilot: Hlídač u řetězu, čtyři přístupy s explicitními efekty; 25 regresních případů včetně skutečného dobrání, reloadu a pokračování po neúspěchu. Commit `8177e19`.
- Integrace historie větve #21 do pracovní větve: sjednocené UI, tři volitelné postavy s odlišnými HP/SAN, jednorázové schopnosti, vybavení a lokální souboje. Žádná změna main.
- Oprava pokračování rozehrané session s null postavou: výběr se nabízí jen u nedotčené nové hry; rozehrané pozice pokračují s původními statistikami.
- Validátor odmítá nadsazené a neceločíselné HP/SAN, zděděné názvy místo ID postavy a nemožný aktivní souboj s nulovým HP nebo třemi výměnami.
- Profil používá portrét i roli vybrané postavy.
- Umístění scénářových protivníků přesunuto z obecného enginu/UI do [dat setkání](../src/data/blackwater-encounters.js); engine i UI používají veřejný seznam dostupných střetnutí. Scénář bez definic nenabízí nepřátele Blackwateru.
- E2E doplněny pro všechny tři postavy, reload, použití schopnosti detektiva, skutečný souboj s pokračováním, konflikt na dvou šířkách a pravidla v obou režimech na 320/390/1440 px.
- Přehled Jak se hraje odpovídá aktivnímu režimu a nečte žádné skryté výsledky ani podmínky konců. Otevření i zavření zachovává save.

## Co zatím není hotovo

- D4 návrat vyřazené postavy: nulové HP/SAN jsou stále porážka. Žádné nové pravidlo návratu nebylo přidáno.
- D5: implementovaná je jedna hádanka (Tři znamení zvonu); zbývají další dvě pilotní hádanky a návazný obsah/epilogy.
- D6: úplný prolog a kontextový onboarding. Aktuální veřejná pravidla už jsou dostupná z herní lišty; starší návrh obsahuje zastaralé popisy runtime.
- D7: lidský playtest a finální balans. Simulace je kontrola dosažitelnosti, ne náhrada hraní.
- Postavy mají společné základní atributy pro testy a odlišné limity, výbavu a aktivní schopnosti; samostatné pasivní schopnosti nejsou dokončeny.
- Animace #16 a audio #13 zůstávají oddělené rozpracované větve. Nejsou bezpečně sloučené jen na základě existence PR.
- Online multiplayer a více plnohodnotných postav jsou mimo schválený rozsah V2.

## Nasazení a kontroly

Kořen i [preview](https://dreddycze.github.io/kdyz-spi-hlubiny/preview/) odpověděly HTTP 200. Neobsahují automaticky tuto pracovní větev. Jediný Pages publisher skládá main a preview z připnutých SHA. Projekt nemá samostatný lint ani typecheck script; používá nativní JavaScript ES moduly a obsahový validátor v buildu.

První Chromium běh: 69/73, čtyři selhání byla stará očekávání počtu přístavních karet po rozšíření balíčku; očekávání aktualizována. Následující integrační běh byl přerušen po nalezení kompatibilitní chyby null postavy a nahrazen novým během. Finální výsledky budou zapsány po jeho dokončení.

## Finální lokální ověření

- `npm test`: 232/232, bez přeskočených testů.
- `npm run test:e2e`: 85/85 Chromium testů, 2,3 minuty; včetně klávesnice, mobilu, Pages podadresáře a všech tří save režimů.
- `npm run build`: úspěch, obsah i rastrové assety validní.
- `git diff --check` a `git diff --cached --check`: bez chyb.
- Syntaxe 59 modulů ověřena přes `node --check`; samostatné lint/typecheck příkazy v projektu nejsou.
- Simulace / strategie / audit konců: každý pro 20 běhů od seedu 42, úspěšný návrat procesu. Výchozí strategie: 15× Zlomený zvon, 2× Tiché moře, 1× časová porážka, 2× konec na SAN; žádné vyčerpání limitu akcí. Audit alternativní strategie dosáhl i Ceny hlasu.
- Vizuálně zkontrolován skutečný snímek mobilního průchodu v šířce 320 px. Žádný zásah do public ani commit build výstupů.

Při stabilizaci #21 opraveny také puzzle/mapové fixture bez vybrané postavy, původní očekávání pevného jména a reset test, který nově správně provede opětovný výběr postavy. Odstraněna pouze redundantní druhá volba postavy s čekáním na timeout; původní beforeEach postavu vybírá dál.

## GitHub a nasazení

- Implementační commity: `8177e19`, `9462585`. Zachována i historie převzaté větve.
- Aktualizovaný [PR #21](https://github.com/DreddyCZE/kdyz-spi-hlubiny/pull/21) prošel [CI 42667083806](https://github.com/DreddyCZE/kdyz-spi-hlubiny/actions/runs/42667083806) a byl sloučen do `feature/unified-blackwater-ui`, merge `a3180c0`. Také integrační CI `42667588323` prošlo.
- [PR #19](https://github.com/DreddyCZE/kdyz-spi-hlubiny/pull/19) má aktualizovaný rozsah a zůstává otevřený do main. Main nebyl změněn.
- Ověřený `9462585` byl fast-forwardem publikován přes existující preview větev. [Pages workflow 42667598850](https://github.com/DreddyCZE/kdyz-spi-hlubiny/actions/runs/42667598850) úspěšně dokončil testy, sestavení i deploy.
- [Funkční preview](https://dreddycze.github.io/kdyz-spi-hlubiny/preview/). Veřejný `pages-build.json` potvrzuje `rootSha=097f05d1e326202b09e06b447f7ac122196f0e37`, `previewSha=9462585821d2bfe4e6326a2625f523116f4e50d6`. Ověřeno HTTP 200 pro vstup, nové moduly pravidel/konfliktu/setkání i portrét. Kořen zůstal na původní verzi.
- Žádný nový duplicitní PR. #20 a #16 zůstávají samostatné otevřené návrhy; nebyly nekriticky přidány k integraci.

Další konkrétní implementační krok: dopracovat D5 (zbývající dvě hádanky včetně skutečných zdrojů indicií, alternativních cest a příběhových důsledků), pak onboarding a pasivní schopnosti. Finální D7 vyžaduje také lidský playtest; dosavadní automatické průchody ho nenahrazují. Celá roadmapa není dokončena.
