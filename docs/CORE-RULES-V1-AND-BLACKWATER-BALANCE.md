# Když spí hlubiny — ZÁKLADNÍ PRAVIDLA V1.0 A BALANC BLACKWATERU
> Návrhová specifikace pro Codex, 2026-11-08. NENÍ IMPLEMENTOVÁNO. Navazuje na GAME-SYSTEM-REVIEW-AND-SCENARIO-FRAMEWORK.md. Neměnit legacy hru bez migrace a testů.

## 1. Rozsah a invariants
Jádro: 2k6 testy, AP, HP, SAN, karty, podmínky, důkazy, znalosti, NPC flags, scénářové zakončení. Moduly: clock a podmíněné události pro Blackwater; jiné moduly pouze budoucí. Každý scénář je deklarativní balík dat s registry, schématem a verzí. Engine bez hardcoded `blackwater` větví. Jediná aktuální hlavní obrazovka, nejvýše 2–3 volby, deník automaticky zapisuje stopy.

## 2. Ověřená existující pravidla
`src/engine/schema.js`: SÍ=1, OB=2, VĚ=3, VŮ=2, VN=2. `src/engine/game.js`: 2k6+atribut+modifier; 6+6 kritický úspěch, 1+1 kritické selhání; jinak rozdíl proti obtížnosti >=3 velký, >=0 úspěch, >=-2 částečný, jinak neúspěch. `newState`: HP=6, SAN=8, threat=2, ritual=1, 3 AP/kolo, 7 kol; přesun 1 AP; endRound zvyšuje ritual o 1; end na hp/san=0, threat=10, ritual=8. `resolve` dnes provádí celý hod atomicky. Důkazy se zapisují, dedukce jen explicitním `deduce`. Balíčky mají pevné pořadí. Stávající M4 karty jsou volitelný obsah, nikoliv automaticky aktivní výchozí scénář.

## 3. Pravidla hráče (návrh)
### Tah a akce
Kolo = 3 AP; přesun 1 AP, volba na kartě typicky 1 AP, příprava/odpočinek 1 AP, boj dle stávajícího modulu. Dobírání karty zdarma. Nedostatek AP = volba deaktivována, hráč může ukončit kolo. Kolo nelze bez vysvětlení ukončit v rozpracovaném hodu.

### Výsledek zkoušky
Hod 2k6 + atribut + situační modifikátor; zachovat 6 stupňů. Částečný úspěch typicky dá informaci za cenu, čistý neúspěch dá směrové vodítko (bez plné odměny), kritický neúspěch je výraznější riziko, ale nesmí jediným hodem zničit možnost dohrání. Žádné automatické snižování rituálu za kritický úspěch mimo konkrétně zdůvodněnou akci.

### Sebrat odvahu
Po prvním hodu hráč vidí jen stupeň a kostky; výsledkové texty/efekty skryté. Může potvrdit nebo při SAN>=2 zaplatit 1 SAN a přehodit obě kostky jednou. Platí lepší stupeň; při shodě první. AP, karta a efekty se aplikují přesně jednou až po potvrzení. Přehod se týká pouze necombatových testů s `allowReroll`; žádný při obraně, souboji, automatických událostech a finální oběti. Pro první Blackwater default true na vyšetřovací volbě, s výjimkami deklarovanými v datech. `pendingTest` má cardId, choiceId, firstRoll, secondRoll?, costPaid, revision/nonce a musí být validován a uložen; nelze reroll opakovat ani měnit výsledek reloadem. RNG pro další hod se musí spotřebovat jen při skutečném přehodu. Výsledek nikdy nesmí být v veřejné projekci před potvrzením.

### Příprava
Nejvýše jedna aktivní jednorázová příprava. Dává +1 k vybranému testu nebo ochranu před 1 HP/SAN, ne obojí. Má typ/zdroj/platnost, spotřebuje se atomicky. Nevyžaduje ruční kombinování inventáře. Pozor: +1 k hodu zvyšuje pravděpodobnost, proto testovat spolu s přehodem.

### Zotavení
Pouze explicitně označené bezpečné místo/karta; 1 AP za +1 HP **nebo** +1 SAN, maximálně 1 použití za scénář pro standardní odpočinek (další léčba z předmětů či karet). Ne při pendingTest a aktivním boji. HP max 6, SAN max 8; nulové HP/SAN končí dřív, než lze odpočívat.

### Spojenci
Stav `unknown/helped/ally/lost` dle příběhu; žádné reputační body. Jednorázová asistence může dát +1, snížit cenu bezpečné cesty nebo odemknout alternativu. Změny musí být viditelné jako jasný důsledek, ale neprozradit budoucí scénu.

### Boj
Stávající boj neměnit v první etapě. Pro každé povinné nebezpečné setkání navrhnout aspoň jednu alternativu (útěk, přesvědčení, prostředí, oběť zdroje); přesné bojové schéma až po samostatném auditu bojové větve.

### Deník
Dvě části: Záhada a Stopy. Záhada ukazuje jednu aktuální otázku, poslední zjištění a max dvě smysluplné lokace. Stopy se zapisují automaticky. Dedukce mohou být pro nové scénáře auto při explicitní akci resolve/draw/move (nikdy render); starší M2.2 manuální režim zůstává. `deductionMode` verzovaný scénářový parametr. Nezobrazovat interní knowledge flags.

### Prohra a výhra
Konec `endingId` s kategorií victory/costlyVictory/sacrifice/defeat; uložen atomicky. HP/SAN=0 může dát jiný text než porážka rituálem. Finální volba nesmí být automaticky provedena dobráním `bw-06-04`. Dvě nezávislé znalostní cesty stačí k některému konci, všechny tři k nejlepší variantě (plus nutné konkrétní přípravy); prohry jsou možné, ale ne kvůli jedinému náhodnému testu.

## 4. Exaktní šance současných kostek
Tabulka udává procenta ze 36 stejně pravděpodobných kombinací; `partial+` zahrnuje partialSuccess, success, greatSuccess, criticalSuccess. `success+` nezahrnuje partial.
| Atribut | DC | partial+ | success+ |
|---|---:|---:|---:|
| +1 | 8 | 83.3 % | 58.3 % |
| +1 | 9 | 72.2 % | 41.7 % |
| +1 | 10 | 58.3 % | 27.8 % |
| +2 | 8 | 91.7 % | 72.2 % |
| +2 | 9 | 83.3 % | 58.3 % |
| +2 | 10 | 72.2 % | 41.7 % |
| +3 | 8 | 97.2 % | 83.3 % |
| +3 | 9 | 91.7 % | 72.2 % |
| +3 | 10 | 83.3 % | 58.3 % |
Výsledky zahrnují automatické kritiky. U dvou nezávislých hodů s výběrem lepšího stupně platí pro práh úspěchu P2=1-(1-P1)^2; není však zdarma, stojí 1 SAN. Například +2 DC9 success+ 58.3 % → 82.6 % s přehodem; partial+ 83.3 % → 97.2 %. Hráč může přehodit až po prvním výsledku, proto reálná četnost přehodů závisí na strategii. Doporučení: většina zkoušek DC9, obtížné DC10, lehké DC8; neřetězit povinné DC10 na slabém atributu.

## 5. Blackwater: AP modely, ne skutečné playtesty
Pilotní konfigurace 12 kol × 3 AP = 36 AP. Rituál nesmí zůstat +1 za kolo s koncem na 8. Modelujeme tři ručně sestavené trasy; jde o **rozpočtové scénáře**, ne o simulaci skutečného runtime.
| Trasa | Přesuny | Karty/rozhodnutí | Boj/příprava/zotavení | Rezerva | Celkem |
|---|---:|---:|---:|---:|---:|
| Rychlé vyšetření, 2 znalosti | 6 | 11 | 3 | 16 | 20 |
| Standard, 2–3 znalosti | 8 | 14 | 7 | 7 | 29 |
| Důkladné, 3 znalosti | 10 | 16 | 9 | 1 | 35 |
Pozor: jeden řádek karty předpokládá 1 AP, ale existující volby mohou mít 0–3 AP. Tyto modely je nutno ověřit proti skutečným vybraným kartám, průchodnosti a boji. Pokud musí hráč čekat na konkrétní kartu ve fixním pořadí, je nutno započítat všechny předchozí karty. Pokud 30 karet tvoří pool, potřebujeme podmíněné priority či výběr relevantních scén, ne lineární povinné dobírání všech čtyř na každé lokaci.

## 6. Sedm úderů: návrh hodin (odděleně od 12 kol)
`clock: tide-bells`, hodnoty 0..7; při dosažení 7 nastane tragický konec, pokud již nebylo dokončeno finále. Posun podle scénářových milníků, ne každé kolo. Prototyp spouštěčů: první úder v prologu (hodnota 1); druhý při vstupu do kola 3; třetí při vstupu do kola 5; čtvrtý při vstupu do kola 7; pátý při vstupu do kola 9; šestý při vstupu do kola 11; sedmý po konci kola 12. Karty mohou způsobit předčasný posun či odklad **příštího plánovaného úderu**, nikdy nesmějí bez limitu snižovat počítadlo; pozor na nemožnost dobrého konce při předčasném úderu. `threat` nadále značí bezprostřední tlak a má limit 10, ale oba ukazatele potřebují UI vysvětlení. Tyto triggery jsou hypotéza k simulaci, ne schválený balanc.
- Kritické upozornění: sedmý úder po konci 12. kola dává hráči přesně 12 kol, ale při předčasném posunu musí mít dost času na reakci. Navrhnout cap na 1 neplánovaný posun za 2 kola a jasné varování od pátého úderu.
- Doporučená alternativa k odkladu: snížit Hrozbu či zabránit konkrétnímu dalšímu posunu, **nikoli** snížit už zaznělé údery.

## 7. Konkrétní pravidla průchodnosti
- Všechny 7 lokace nemají být od začátku dostupné v Blackwateru; otevřít Přístav + Ulici, další postupně skrze explicitní indicie; minimálně dvě alternativní cesty k zásadním lokacím.
- HLAS: Přístav/Ústav/Maják nebo Archivní fonograf/Maják; JMÉNO: Ulice/Archiv/Hřbitov nebo Voss/Eleanor + matrika; TĚLO: Jeskyně/Maják nebo Atlas/Tunely/Jeskyně. Ověřit graf, žádná kruhová závislost.
- Finále lze zahájit po dvou znalostech; možnost zničení zvonu vyžaduje přístup k fyzickému mechanismu či alternativní přípravu. Oběť je vědomé rozhodnutí. Nejlepší konec vyžaduje tři znalosti a přerušení signálu, nikoli jeden finální náhodný hod.
- Každý důležitý důkaz musí mít 2 zdroje nebo jisté fallback vodítko. Falešné stopy jsou ověřitelné.
- Časové milníky nesmějí spustit událost dvakrát po reloadu; `eventLedger` v uloženém stavu.

## 8. Kontinuita před kódováním
- `bw-05-03` Strážce přílivu = zjevení/strážce, ne samotný stroj.
- `bw-04-03` Zvoníkova dcera = zjevení, jehož pravost je nejistá; neplést s první obětí.
- `bw-06-04` Poslední zvon = přípravná karta, finále zvláštní akce.
- Eleanor je v aktuálním prototypu hratelná, zatímco v novém prologu píše vyšetřovateli. Nevyřešeno: vyžaduje rozhodnutí před finálním scénářem; doporučení: pro první iteraci zachovat hratelnou Eleanor a přepsat prolog jako její vlastní poznámku nebo zprávu od jiné postavy.
- Jednotlivé pozdější kapitoly se místy rozcházejí s 30-card outline; story bible + schválené rozhodnutí mají přednost před jednotlivými koncepty.

## 9. Technický kontrakt a implementační pořadí
1. `scenarioDefinition` s `id`, `version`, `rules`, `modules`, `decks`, `clocks`, `events`, `endings`. Validace referencí a parametrů, feature flag legacy.
2. `scenarioState`: clock counters, eventLedger, pendingTest, preparation, restUsed, allyFlags, endingId; verze a migrace. Nepřidávat duplicitu `ritual` bez rozhodnutí o jediném zdroji pravdy.
3. Reroll: startTest → rerollTest/acceptTest → resolve once; revize/nonce, save, výsledky v projekci.
4. Dedukce: manual legacy, auto explicitně při herním přechodu pro nové scénáře.
5. Ending transition, přechody událostí, epilog; idempotence.
6. Příprava, odpočinek, spojenci; alternativy boje po samostatném auditu.
7. Obsah, graf průchodnosti, 1000+ seeded Monte Carlo průchodů se strategií, E2E, přístupnost, mobil.
8. Každá změna v samostatném PR, bez merge do main bez schválení.

## 10. Testovací akceptace
- Dvě odlišné trasy k finále i při jednom ztraceném klíčovém hodu; žádný povinný boj.
- Všechny 4 konce dosažitelné deterministickými testy; 3 knowledge nejsou nutné pro každý konec.
- Reroll: platba SAN právě jednou, AP právě jednou, efekty právě jednou; reload mezi hody zachová stav.
- Při SAN=1 reroll zakázán; při SAN=0 konec; při kritice 1+1 a 6+6 se zachovává klasifikace.
- Události 1×, žádné opakované rewardy, žádný hidden outcome v veřejné projekci.
- Scénář 2 s jinými ID a jiným modulem běží bez úprav jádra.
- Reálné playtesty: cíl 60–90 min; změřit čtení, kliknutí, AP, SAN, úspěšnost, využití přehodu a podíl hráčů, kteří nevědí kam dál.
- Zatím **neprováděli jsme runtime Monte Carlo ani E2E**; zde jsou pouze exaktní pravděpodobnosti kostek a aritmetické AP rozpočty.
