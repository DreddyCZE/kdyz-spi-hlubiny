# Herní návrh M2.1 / M2.2

## Zachovaný koncept

Eleanor Whitmore vyšetřuje přímořské lokace pomocí příběhových karet. Základ vychází z [referenčního prototypu 0.3](../public/legacy-prototype.html). Druhý [referenční prototyp](../public/reference-prototype.html) zůstává samostatnou inspirací. Ani jeden se neupravuje. M2.2 doplňuje obecný systém důkazů, znalostí a dedukcí s dočasným deníkem. Nepřidává boj, systém více postav, vítězství ani mobilní optimalizaci.

Počáteční stav, atributy, 3 AP, sedm lokací, HP/SAN a postup rituálu odpovídají M1. Limit zůstává **7 kol**, Hrozba končí na 10 a Rituál na 8. Nové kolo obnoví 3 AP a posune Rituál o 1. Po sedmém kole se Rituál dokončí; konec scénáře zablokuje další akce.

## Rozhodnutí a vyhodnocení

Každá volba má vlastní cenu, podmínky a volitelný test. Hod je `2d6 + atribut + modifier`. Přirozené `6+6` má vždy výsledek `criticalSuccess`, `1+1` vždy `criticalFailure`. Jinak zůstává rozdíl proti obtížnosti: ≥3 `greatSuccess`, ≥0 `success`, ≥−2 `partialSuccess`, níže `failure`. Volba bez testu vždy použije vlastní `success`.

Původních osm karet zachovává všechny příběhové texty, možnosti, obtížnosti a efekty. Nový kritický úspěch kopíruje jejich dosavadní velký úspěch. Důkazy a předměty jsou nyní oddělené registry se stabilními ID; české názvy odměn se zachovávají. Jediná nová karta „Poznámka na molu“ následuje po obou původních přístavních kartách. Nabízí bezplatný odchod, jistý opis s deníkem za 1 AP nebo studium za 2 AP s modifikátorem +1.

## Opakování a atomické provedení

Neopakovatelné karty se vyhodnotí jednou za celou hru, i při návratu, dalším kole nebo reloadu. Opakovatelné karty vyžadují výslovné `next` před dalším rozhodnutím. Každý požadavek nese ID karty, ID volby a očekávanou `revision` stavu. Stará nebo duplicitní žádost se odmítne. Neúspěšný přechod vrací původní stav. Karty mají samostatné pořadí v každé lokaci; nepřístupné karty se přeskočí, ale posun kurzoru za pozdější kartu je definitivní. Při nepřístupných nebo vyčerpaných kartách se zobrazí vysvětlení a lze se přesunout či ukončit kolo.

UI ukládá zaplacené rozhodnutí a výsledek před kosmetickou animací. Během animace jsou herní akce uzamčené. Reset zruší časovač a výslovně začne novou hru; reload zachová původní výsledek bez další odměny. Inventář a důkazy fungují jako unikátní sbírky ID, nikoli zásobníky množství.

## Uložený stav

Verze 3 používá klíč `hlubiny-v3` a bezpečně migruje M1/v1 i M2.1/v2. Nové sbírky a ledger dedukcí jsou validované, informace ze složených předmětů zůstávají známé nezávisle na fyzickém inventáři. Převod nespouští dedukce a zachová původní klíče. Schéma, rozsahy, registry ID, kurzory, konec hry a přepočet uložených hodů se nadále kontrolují. Viz [ENGINE.md](ENGINE.md).

## Ověření a další milník

Oprava připomínky PR #1: „Deník a přívěsek“ datově obsahuje důkaz „Deník“. Porovnání poznámky je proto dostupné po běžném, velkém i kritickém úspěchu na Ztracené lodi a po načtení starších her. Žádný předmět ani důkaz se při načtení nepřidává; stav a jeho verze zůstávají kompatibilní.

Testy pokrývají regresi M1, šest výsledků, všechny podmínky a efekty, různé volby, postup bez hodu, nedostatek AP, atomický rollback, duplicity, opakovatelnost, validátor, veřejnou projekci a save/migraci. Texty migrace se automaticky porovnávají s nezměněným prototypem.

## Dedukce M2.2

Dedukování je explicitní bezplatná akce v deníku, nikdy skrytý důsledek renderování. Datové podmínky kombinují `all`, `any`, `not`, důkazy, znalosti a příznaky světa. Výsledkem může být znalost, odemčení volby/karty/lokace nebo příznak. Cyklické definice jsou odmítnuté. Jednorázové dedukce se neopakují; další výslovná akce může zopakovat jen definici s `repeatable: true`.

Testovací Blackwater obsah používá Deník + Svědectví rybáře nebo Deník + Opis poznámky pro odvození „Spojení s majákem“. Tato znalost nemění obtížnost, lokace ani postup rituálu. Podrobnosti: [DEDUCTION_SCHEMA.md](DEDUCTION_SCHEMA.md). Dvanáct kol, tempo příběhu a jiné rituální pravidlo zůstávají mimo tento milník.
