# D3 – ověření psí vyšetřovací linie

Ověřeno proti vstupnímu HEAD PR #17 `75cf79c` a navazujícím opravám. PR má základ ve větvi M4, nikoli přímo v main. Zůstává samostatným scénářovým režimem s 12 koly a 3 AP; starší Blackwater preview má vlastní režim i uložené pozice.

## Nálezy a opravy

- Původní journey testy vkládaly karty a přesouvaly postavu přímo. Zachovány jako izolované testy; nový `companion-public-journey.test.js` dobírá všechny předcházející karty a používá pouze veřejné přechody. Každý krok ověřuje validitu save.
- Podmíněnou nerozehranou kartu šlo vložit do `drawnCards` ve strukturálně validním save a zobrazit její příběh před odemčením. Projekce ji nyní odmítá a validátor takový save nepřijme. Otestováno také podvržení vybrané skryté volby: přechod znovu kontroluje podmínky a odmítne akci.
- Sůl na schodech neměla možnost odchodu. Před psím porovnáním tak v pořadí balíčku vynucovala další placený hod. Doplněna bezplatná volba pokračovat bez efektů.
- Text neúspěchu jednorázové jeskynní karty sliboval další pokus. Upraven podle skutečných pravidel; neúspěch neblokuje jiné karty, přesuny ani zakončení.
- Ověřeny kombinace `flagEquals` s `all`, `any`, `not`, přímé odmítnutí nepovolené akce, skryté výsledky před potvrzením hodu a jediný dosažený výsledek po něm.

## AP a čas

Deterministické průchody začínají v Přístavu a zahrnují skutečné pořadí balíčků. Předcházející karty volí nejlevnější možnost, při shodě první. Testy používají předané kostky 6+6, nikoli manipulaci stavem; jde o důkaz dosažitelnosti, nikoli odhad běžné úspěšnosti.

| Cesta | Přesuny | Cílové akce | Předcházející karty | Celkem | Dokončení |
| --- | ---: | ---: | ---: | ---: | --- |
| Pes → Staré město → Maják → Jeskyně | 3 AP | 3 AP | 9 AP | 15 AP | 5. kolo |
| Bez psa → Maják → Jeskyně | 2 AP | 2 AP | 6 AP | 10 AP | 4. kolo |
| Přímo Jeskyně, běžný průchod | 1 AP | 1 AP | 3 AP | 5 AP | 2. kolo |

Naverbování, schopnost, dobírání, volba, potvrzení a zavření výsledku jsou zdarma. AP stojí až vyhodnocení placené volby a přesun. Úplný rozpočet je 36 AP. Psí cesta stojí o 5 AP více než samostatná majáková cesta, ale odstraňuje náhodu z určení servisní cesty; neodstraňuje testy dřívějších karet. Samostatný test VN +2 / DC 9 poskytne informaci i při částečném úspěchu: 30/36 hodů, z toho 9/36 se ztrátou SAN. Bezplatné přehazování neexistuje; přehod stojí 1 SAN.

Další veřejný průchod dokončí psí odbočku, získá chybějící důkazy v Knihovně, Ústavu a na Hřbitově a zvolí Zlomený zvon v 8. kole při spotřebě 23 AP. Volí mechaniku světla u majáku a plány v knihovně. Zůstává 13 AP v celkovém rozpočtu. Psí příznaky nejsou součástí podmínek žádného konce; pes není povinný a sám hlavní vyšetřování nevyřeší.

Neúspěch majákového testu a následný kritický neúspěch v jeskyni neodemykají bezpečnou volbu. Test ověřuje další legální přesun do Knihovny a nové dobrání. Nejde o záruku vítězství při libovolných předchozích ztrátách: HP, SAN, hrozba a čas nadále platí.

## Ukládání a prohlížeč

Nové testy ověřují přesný round-trip celé session po zaznamenání stopy, včetně společníka, kola použití schopnosti, příznaků, vyřešených karet a kurzorů; následně pokračují k majáku a jeskyni. E2E prochází všechny tři cesty skutečnými tlačítky, kontroluje reload, chybějící skrytou volbu, výsledky až po potvrzení a chyby JavaScriptu.

Žádná změna schématu ani závislostí. Platné starší saves zůstávají přijímány, nepřítomné volitelné subsystémy nadále podporuje stávající adaptér. Záměrně poškozený save se podle stávající politiky vrací na novou session. Čistě klientská hra nemůže zabránit vlastníkovi prohlížeče přepsat všechny známé příznaky a historii; tato ochrana odmítá nekonzistentní karty a neautorizované akce, není kryptografickým ověřením historie.

## Zbývající doporučení

- Pravděpodobnost vítězství celé kampaně hodnotit nad více seeded průchody i lidským hraním; úspěšný deterministický průchod ji neprokazuje.
- Psí odbočka je delší, nepřináší samostatný bonus k finále. Zatím ponecháno jako volba jistoty a příběhu; bez zavádění nových mechanik. Zvážit později na základě hráčských testů.
- Pasivní Neklid je nyní prezentační schopnost, nikoli automatický nebezpečnostní trigger. Rozšiřování není součástí stabilizace této linie.

## Výsledky ověření

- `npm test`: 166/166 testů, včetně sedmi nových testů průchodů a ochrany informací.
- `npm run test:e2e`: 57/57 Chromium testů, včetně tří nových kompletních UI průchodů; před změnou 54/54.
- `npm run build`: úspěch, obsah i rastrové assety validní.
- `git diff --check`: bez chyb.
- Simulace, porovnání strategií a audit zakončení: všechny tři existující příkazy pro 20 běhů od seedu 42 dokončeny bez chyby. Základní strategie dosáhla 13× Zlomeného zvonu, 6× Tichého moře a 1× časové porážky; žádný běh nevyčerpal limit akcí. Tato strategie nevyužívá psa, nejde tedy o měření jeho přínosu.
