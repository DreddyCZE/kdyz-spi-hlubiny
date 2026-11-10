# Stav Blackwater – 2026-11-10

## Vydávaná obsahová verze a ověření

GitHub znovu ověřen 10. 11. 2026. Integrační PR #19 sloučen do main jako `6a2efdf3729fdab98e4b978b341f0658e71c388a`; obsahuje celý PR #21 (9462585). Před sloučením přesný integrační HEAD prošel `npm ci`, 232/232 unit testy, buildem, 85/85 Chromium E2E a diff checkem. Oba původní workflow PR #19 byly zelené. Draft #20 byl po porovnání všech pěti souborů uzavřen jako redundantní s vysvětlením; větev ani historii nemažeme.

Navazující obsahový PR dokončuje tři hádanky, placené alternativy bez nevratného zámku po chybě, persistenci nastavení, pět příběhových karet a variantní epilogy. Všechny tři postavy mají aktivní i pasivní schopnost. Prolog a nápovědy lze přeskočit, vypnout a znovu otevřít bez resetu. Rozhraní rozlišuje výsledky textem i barvou, ukazuje směr pátrání a poslední bojovou výměnu. Oddělené save režimy a public prototypy jsou zachované.

Před obsahovou integrací: **255/255 unit testů, 95/95 Chromium E2E**, `npm ci`, build a `git diff --check`. Testy pokrývají všechny postavy, tři vítězná zakončení, časovou i HP/SAN porážku, 320/390/1440 px, klávesnici, reduced motion, reload testu, boje, hádanek a zakončení. Žádný test není vypnutý. Běhy sdílející výstupní adresář se nepoužívají souběžně.

Reprodukovatelný [audit vyvážení](BALANCE-2026-11-10.md): **4 200 her**, dvě sady seedů, tři postavy, čtyři strategie a cílené volby všech vítězných konců. Každý konec je dosažitelný každou postavou. Základní strategie neměly vyčerpání limitu akcí ani živý neterminální stav. Simulace není lidský playtest; nezaručuje neexistenci všech možných slepých uliček. Obtížnost se jen podle heuristické úspěšnosti nemění.

Aktuální [pravidla bez spoilerů](PLAYING-BLACKWATER.md), [pravidlová rozhodnutí](design.md), [roadmapa a hranice rozsahu](ROADMAP-GAMEPLAY.md). Finální stav publikace se ověřuje podle GitHub Actions a manifestu `pages-build.json`, ne jen podle HTTP 200.

### Otevřené problémy

- **P2 – lidský playtest:** změřit délku partie, porozumění cílům a hospodaření se SAN. Cíl 60–90 minut zatím není ověřen lidským hraním. Zejména námořník má v soubojových strategiích vyšší riziko konce na SAN.
- **P2 – redakce obsahu:** dále rozšířit smyslové detaily a rozmanitost následků; současná implementace není dokončením všech dlouhodobých příběhových návrhů.
- **P3 – animace/audio:** PR #16 zůstává oddělený draft se starým zapojením hodu. Audio větev neobsahuje vlastní implementaci. Nepřebírat starší app přes aktuální potvrzovaný hod.
- **Záměrné hranice:** žádný online multiplayer, více plnohodnotných současných postav ani návrat při 0 HP/SAN. Rozhodnutí o vyřazení je v designu. Známá blokující chyba veřejného průchodu nebyla nalezena.

Následující záznamy jsou **historie předchozích lokálních kroků**, nikoli aktuální seznam chybějících funkcí nebo stav nasazení.

## Navázání 2026-11-10 – pracovní větev D5–D7

Původní audit níže je historický. Rozpracovaná implementace nyní obsahuje tři hádanky, placené náhradní cesty, persistenci jejich nastavení, pět navazujících příběhových karet a epilogy podle dosažených příznaků. Připojen je přeskočitelný prolog a kontextové nápovědy s vlastním úložištěm. Opravena chyba vykreslení společníka způsobená odkazem na proměnnou hádanky a uzamčení potvrzení hodu během animace.

Pasivní schopnosti postav byly v navazujícím kroku připojeny k přechodům scénáře, validaci save i veřejnému UI. Detektiv získává podmíněný bonus k VĚ/VN; okultistka má první přehod za kolo zdarma; námořník první HP zranění z karty nebo bojové výměny za kolo sníží o 1. Uložené výsledky se zpětně nepřepočítávají. D7 lidský playtest a finální balans zůstávají otevřené. Žádný commit, push ani nasazení této práce neproběhly.

Unit testy: 248/248. Build a kontrola whitespace procházejí. Samostatné testy průvodce ověřily persistenci nastavení a nedostupné úložiště; mobilní prolog byl vizuálně zkontrolován na 390 px. První celou E2E sadu znehodnotily souběžné buildy a běhy sdílející výstupní adresář; rozhodující je následný samostatný běh.

Závěrečný samostatný Chromium běh: **92/92**, 2,9 minuty, bez opakování testů. Obsahuje průchody ke třem vítězným zakončením, mobil 320/390 px, reload hádanek, prolog, ochranu cizích save a původní herní režimy. `npm run build` a `git diff --check` úspěšné.

Po připojení pasivních vlastností: **254/254 unit testů**, **94/94 Chromium testů** v celé sadě (2,9 minuty). Dodatečný cílený běh všech tří pasivních UI testů: **3/3**, včetně následně doplněné kontroly detektivova bonusu, shodné úrovně/součtu a reloadu. Screenshot detektivovy vlastnosti vizuálně zkontrolován. Námořník má regrese pro smrtelné zranění, rozhodnutí bez hodu, sdílený limit mezi kartou a bojem a obnovení dostupnosti v dalším kole; okultistka pro 1 SAN, cenu dalších přehodů a persistenci využití. Starší save bez volitelných polí zůstávají platné. Průchody D5 používají pro srovnání postav veřejný bonus při volbě deterministických kostek, aby zachovaly stejné úrovně výsledků.

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
