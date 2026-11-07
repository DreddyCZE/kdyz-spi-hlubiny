# M3.2 — Balíčky karet a průzkum lokací

Stav: návrh implementace, žádné změny pravidel dosud nejsou hotové.

## Výchozí stav (M3.1)
`src/engine/game.js` používá `deck(state)` jako seznam karet lokace a `cursors[locationId]` jako postupné procházení. `activeDefinition` respektuje podmínky a odemčení dříve přeskočených karet. `currentCard` vrací bezpečnou veřejnou projekci bez tajných výsledků. `transition` spravuje akce, revize a ukládání. Tuto kompatibilitu zachovat.

## Cíl M3.2
Hráč na mapě vybere lokaci, uvidí její tematický balíček a dobírá neznámé příběhové karty. Každá karta přinese scénu, volby a hod kostkami. Karty mohou být typu událost, setkání, předmět a důkaz. Po vyhodnocení se zobrazí jen konkrétní následek; ostatní zůstávají tajné. Hra musí zůstat deterministicky testovatelná a odolná vůči reloadu.

## Invarianty
- ID karet, voleb a lokací jsou trvalá; sedm lokací a jejich mapové souřadnice beze změny.
- Nikdy nedávat skryté texty ani efekty do DOM, logu ani veřejné projekce před vyhodnocením.
- Žádná duplicitní odměna ani opakovaný hod po reloadu.
- Neodstraňovat existující migraci/save verze 3 bez explicitního migračního testu.
- Odemčená karta, kterou hráč přeskočil, musí zůstat dosažitelná.
- Nevyužívat `Math.random` přímo uvnitř čisté `transition`; náhodu předat jako validovaný výsledek akce nebo oddělený seed.

## Implementační fáze
1. **Audit:** sepsat přesné chování `deck`, `activeDefinition`, `next`, `resolve`, `repeatable`, `cursors`, `unlockedCards`, `unlockedChoices`, ukládání a UI. Navrhnout migrační strategii.
2. **Balíčky:** přidat explicitní metadata balíčků podle lokací a typů, aniž by se kopírovaly definice karet nebo porušila validace. Zachovat původní pořadí jako bezpečný fallback.
3. **Dobírání:** definovat deterministický mechanismus pořadí/dobírání, spotřebování a zamíchání; případné nové save položky opatřit migrací a testy. Před akcí neprozrazovat příští kartu.
4. **UI:** viditelné počty dostupných a odložených karet pouze pokud je lze bezpečně zveřejnit; ovládání Dobrat / Pokračovat / Prozkoumat; bez nefunkčních tlačítek. Animace respektuje reduced motion a klávesnici.
5. **Obsah:** využít existující události, setkání, předměty a důkazy; doplnit malý počet kvalitních, originálních karet pouze po kontrole lore, ekonomiky a validace.
6. **Testy:** unit pro determinismus, odemykání, spotřebování, opakování, podmínky, nedostatek AP, uložení/reload, duplicitní odměny a tajné výsledky; E2E na 1440/390/320 px; build a diff check.

## Akceptační kritéria
- `npm test`, `npm run build`, `npm run test:e2e`, `git diff --check` prochází.
- UI funguje i na 320 px bez horizontálního scrollu.
- Scénář po reloadu pokračuje ve stejném pořadí karet, se stejnými odměnami a bez opakovaného vyhodnocení.
- Změny do PR se dokládají screenshoty a shrnutím migrace.
- Pracovat výhradně ve větvi `feature/m3-2-exploration-decks`; PR ponechat Draft, bez merge.
