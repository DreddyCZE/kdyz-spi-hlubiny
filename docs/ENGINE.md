# Herní engine a vyhodnocování M2.2

## Vrstvy

- [game.js](../src/engine/game.js): čisté přechody herních akcí, cena a výsledek v jednom kroku.
- [investigation.js](../src/engine/investigation.js): obecné podmínky, validace registrů, závislosti a dedukce; bez importu scénáře.
- [content.js](../src/engine/content.js): adaptér výchozích dat, validace a neměnné definice. `createContent` lze napojit na jiné registry; samotný dedukční modul dostává všechny reference parametrem.
- [storage.js](../src/engine/storage.js): validace a převody historických uložených stavů.
- [journal.js](../src/ui/journal.js): dočasný deník; pracuje pouze s veřejnou projekcí a předává kliknutí enginu.

## Jednoznačný okamžik vyhodnocení

Jiný scénář může použít `createContent(cards, definitions, { items, locations, flags, itemEvidence })`. ID karet/voleb se odvozují z dodaných definic a ID informací z jejich registrů. `newState(content)`, `transition(state, action, content)`, `validState(state, content)`, `save(storage, state, content)` a `load(storage, content)` pak používají stejné reference. Testovací scénář s vlastními `room-a`, `e-a` a `k-a` prochází i uložením/načtením; ID Blackwater nejsou podmínkou běhu. Historická migrace M1 zůstává adaptérem pro původní názvy odměn a lokace původního prototypu.

Získání důkazu pouze zapíše informaci. Dedukce se spouštějí **výhradně akcí** `{ type: 'deduce', revision: state.revision }`, kterou hráč vyvolá tlačítkem „Vyhodnotit důkazy“. Akce je bez AP a bez hodu, neukončuje kolo. Během animace hodu a po konci hry ji UI nepovolí. Render, projekce i migrace jsou bez automatického dedukování.

Engine odmítne zastaralou revizi. V rámci jedné akce projde dedukce v deterministickém topologickém pořadí. Návazná dedukce může použít znalost vytvořenou dřívější dedukcí v téže akci. Každá se provede nejvýše jednou za akci; `repeatable: false` navíc nejvýše jednou za celou hru. `repeatable: true` dovoluje opakování další výslovnou akcí s novou revizí, nikoli duplicitním požadavkem. Počty jsou v mapě `deductions`.

Pracuje se na soukromé kopii stavu. Efekty, jejich ledger a zápis do logu tvoří jeden přechod; neplatný efekt nebo čítač vrátí původní stav bez částečné odměny. Validované modely jsou zmrazené. Neúčinná akce vrací původní referenci a nemění revizi. Úspěšná akce revizi zvýší právě jednou. Změna aktivní karty odemčením odstraní zastaralý výběr volby.

## Veřejná projekce

`investigationView(state)` vrací jen známé důkazy, známé znalosti, provedené dedukce a dedukce, jejichž podmínky už platí. Neobsahuje budoucí znalosti, nesplněné dedukce, podmínky ani efekty. U důkazů vrací také `carriedBy` pro zobrazení složených odměn bez duplicit. Metadata se záměrně do projekce nepřenášejí. Projekce stav nemění.

`currentCard` nadále neposkytuje následky. Nezpřístupněná karta se nevykreslí; volby čekající na znalost, dedukci nebo explicitní odemčení mají skryté i štítky. Již provedená volba zůstává viditelnou historií, i pokud její efekt změnil původní podmínku. `visibleResult` odhalí jediný dosažený výsledek.

Jde o řízení UI, nikoli utajení zdrojového kódu statické aplikace před DevTools. Ukládání není anti-cheat a neřeší souběžnou hru ve více záložkách.

## Uložený stav a migrace

Verze **3**, klíč `hlubiny-v3`. Nové položky jsou `knowledge`, `deductions`, `unlockedCards`, `unlockedChoices`. Znalosti a odemčení jsou unikátní pole registrovaných ID. Ledger musí mít kladné bezpečné čítače, nejvýše 1 u neopakovatelné dedukce; potvrzuje se i přítomnost trvalých přidělených znalostí/odemčení. Příznaky mohou později změnit jiné akce, proto se jejich historická hodnota nepřepočítává.

Načtení preferuje v3. Pokud chybí, převede platné M2.1 v2; pokud i v2 chybí, převede M1 v1. Převod zachová AP, kola, ukazatele, inventář a výsledky karet, u M2.1 také revizi. Doplní prázdné nové sbírky a informace ze složených předmětů. Žádná dedukce ani její efekty se při převodu nespustí. Původní klíče zůstanou nedotčené; v3 se uloží při další explicitní akci.

Vadná přítomná novější verze se nenahrazuje starší rozehranou hrou. Neplatný či příliš velký stav zahájí novou hru. Chyba úložiště je zachycená a UI pokračuje v paměti s upozorněním. Výsledkové texty a efekty se vždy berou z validovaných definic, nikdy z uložené hry.

## Ověření

`npm test`, `npm run test:e2e`, `npm run build`, `git diff --check`. Unit testy používají i jiné ID než Blackwater. Chromium průchody pokrývají získání důkazů, explicitní dedukci, znalost, zákaz opakování a reload po obyčejném, velkém i kritickém výsledku. Sedm kol a dosavadní rituál pokrývají původní regresní testy; v M2.2 se nepřelaďují.
