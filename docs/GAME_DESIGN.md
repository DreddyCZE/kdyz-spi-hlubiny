# Herní návrh M2.1

## Zachovaný koncept

Eleanor Whitmore vyšetřuje přímořské lokace pomocí příběhových karet. Základ vychází z [referenčního prototypu 0.3](../public/legacy-prototype.html). Druhý [referenční prototyp](../public/reference-prototype.html) zůstává samostatnou inspirací. Ani jeden se neupravuje. Tento milník nepřidává boj, systém více postav, dedukce, vítězství ani mobilní optimalizaci.

Počáteční stav, atributy, 3 AP, sedm lokací, HP/SAN a postup rituálu odpovídají M1. Limit zůstává **7 kol**, Hrozba končí na 10 a Rituál na 8. Nové kolo obnoví 3 AP a posune Rituál o 1. Po sedmém kole se Rituál dokončí; konec scénáře zablokuje další akce.

## Rozhodnutí a vyhodnocení

Každá volba má vlastní cenu, podmínky a volitelný test. Hod je `2d6 + atribut + modifier`. Přirozené `6+6` má vždy výsledek `criticalSuccess`, `1+1` vždy `criticalFailure`. Jinak zůstává rozdíl proti obtížnosti: ≥3 `greatSuccess`, ≥0 `success`, ≥−2 `partialSuccess`, níže `failure`. Volba bez testu vždy použije vlastní `success`.

Původních osm karet zachovává všechny příběhové texty, možnosti, obtížnosti a efekty. Nový kritický úspěch kopíruje jejich dosavadní velký úspěch. Důkazy a předměty jsou nyní oddělené registry se stabilními ID; české názvy odměn se zachovávají. Jediná nová karta „Poznámka na molu“ následuje po obou původních přístavních kartách. Nabízí bezplatný odchod, jistý opis s deníkem za 1 AP nebo studium za 2 AP s modifikátorem +1.

## Opakování a atomické provedení

Neopakovatelné karty se vyhodnotí jednou za celou hru, i při návratu, dalším kole nebo reloadu. Opakovatelné karty vyžadují výslovné `next` před dalším rozhodnutím. Každý požadavek nese ID karty, ID volby a očekávanou `revision` stavu. Stará nebo duplicitní žádost se odmítne. Neúspěšný přechod vrací původní stav. Karty mají samostatné pořadí v každé lokaci; nepřístupné karty se přeskočí, ale posun kurzoru za pozdější kartu je definitivní. Při nepřístupných nebo vyčerpaných kartách se zobrazí vysvětlení a lze se přesunout či ukončit kolo.

UI ukládá zaplacené rozhodnutí a výsledek před kosmetickou animací. Během animace jsou herní akce uzamčené. Reset zruší časovač a výslovně začne novou hru; reload zachová původní výsledek bez další odměny. Inventář a důkazy fungují jako unikátní sbírky ID, nikoli zásobníky množství.

## Uložený stav

Verze 2 používá klíč `hlubiny-v2`. Načítání ověřuje schéma, rozsahy, registry ID, kurzory, konec hry a přepočítává uložené hody podle definice volby. Z uložených dat se nenačítají vlastní efekty ani texty následků. Platné M1 save se převádí podle původních ID a názvů; zdrojový klíč zůstává nedotčený. Při chybě se použije nový stav. Úložiště nemá anti-cheat ochranu a synchronizace několika záložek není součástí M2.1.

## Ověření a další milník

Testy pokrývají regresi M1, šest výsledků, všechny podmínky a efekty, různé volby, postup bez hodu, nedostatek AP, atomický rollback, duplicity, opakovatelnost, validátor, veřejnou projekci a save/migraci. Texty migrace se automaticky porovnávají s nezměněným prototypem.

Pro M2.2 lze navrhnout bohatší vysvětlení podmínek v UI, explicitní balíčky s návratem k dříve nepřístupným kartám a automatické prohlížečové testy v CI. Případná délka 12 kol nebo jiné rituální pravidlo vyžaduje samostatné schválení návrhu; v M2.1 se neuplatňuje.
