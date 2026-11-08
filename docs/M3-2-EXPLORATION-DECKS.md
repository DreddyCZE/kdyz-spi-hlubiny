# M3.2 — Balíčky karet a průzkum lokací

Stav: implementováno ve větvi `feature/m3-2-exploration-decks`; PR #8 zůstává Draft.

## Balíčky a dobírání

Každá ze sedmi původních lokací má vlastní tematická metadata v `src/data/decks.js`. Definice karet zůstávají na jednom místě v `src/data/cards.js`; balíček lokace je jejich stabilní pořadí podle existujících definic. Karty používají všechny čtyři typy `event`, `encounter`, `item` a `evidence`. Původní ID karet, voleb i lokací, příběhové texty a mapové souřadnice zůstávají zachované.

Akce `draw` vyžaduje aktuální revizi, je zdarma a odhalí právě jednu dostupnou kartu. Engine nepoužívá `Math.random` a balíček nezamíchává: testy i reload proto mají stejné pořadí. Nesplněné podmínky kartu odloží, nikoli odstraní; po splnění zůstane dosažitelná i za kurzorem. `next` lze provést až po výsledku a pouze uzavře aktuální kartu. Neopakovatelná karta se spotřebuje. Opakovatelné karty se vrací až po vyčerpání ostatních dostupných karet a jejich pořadí se cyklí deterministicky.

Hráč může opustit lokaci s otevřenou kartou a po návratu pokračovat ve stejném rozhodnutí. Výsledky i odměny zůstávají připojené ke stabilnímu ID karty. Opakované požadavky se zastaralou revizí ani reloadem hod či efekt znovu nespustí.

## Veřejná projekce a UI

`explorationView` vrací pouze název, popis a agregované počty dostupných, odložených a vyřešených karet. Nezveřejňuje ID ani názvy budoucích karet. Před akcí `draw` se vykreslí pouze neutrální rub; po dobrání `currentCard` poskytne povolenou projekci bez výsledkových textů a efektů. `visibleResult` odhalí až dosažený následek.

Souhrn balíčku je přístupný, tlačítko Dobrat/Pokračovat má funkční stavy i po vyčerpání lokace a klávesový focus se přesouvá na nově odhalenou kartu nebo další tah. Stávající animace hodu zůstává; `prefers-reduced-motion` ji vypne. Chromium ověřuje šířky 1440, 390 a 320 px bez horizontálního přetečení.

## Ukládání a migrace

Save verze 4 používá klíč `hlubiny-v4` a ukládá `drawnCards` pro otevřenou kartu v každé navštívené lokaci společně s existujícími kurzory, výsledky a revizí. Validátor odmítá neznámou lokaci/kartu, chybný výsledek nebo nesoulad otevřené karty a výsledku.

Platná v3 se migruje na v4 rekonstrukcí dosud otevřené karty podle připnutého výsledku a kurzoru; v2 a v1 projdou dosavadními převody před doplněním karet. Původní klíče se nemění, při migraci se nespouštějí dedukce, efekty ani hody. Neprozkoumané lokace se předem nedobírají.

## Ověření

- Unit testy pokrývají pořadí, bezpečné veřejné počty, zamítnutí zastaralé revize, odložené podmínky, opakování, přesun, nedostatek AP, uložení/reload, migraci v3 a ochranu před opakováním odměn.
- E2E testy pokrývají dobírání klávesnicí, soukromí před a po odhalení, fokus, reload, vyčerpání balíčku, reduced motion a rozměry 1440/390/320 px.
- Příkazy: `npm test`, `npm run build`, `npm run test:e2e`, `git diff --check`.
- Snímky obrazovky jsou v [test-artifacts/m3-2](test-artifacts/m3-2/README.md).
