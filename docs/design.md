# Koncept a hranice refaktoringu

Autoritativní základ je kořenový prototyp v0.3, přesunutý beze změny do [reference](../public/legacy-prototype.html). [Soubor z Downloads](../public/reference-prototype.html) zachováváme jako druhou referenci; obsahuje odlišný systém více postav, dedukcí a událostí. Tyto mechaniky nejsou součástí v0.3 a nebyly do něj automaticky sloučeny.

## Pravidla v0.3

Eleanor má 6 HP, 8 SAN, atributy SÍ 1, OB 2, VĚ 3, VŮ 2, VN 2. Začíná v Přístavu, v kole 1, se 3 AP, Hrozbou 2 a Rituálem 1. Přesun a průzkum stojí po 1 AP. Volba postupu a dobrání další karty jsou zdarma. Další kolo obnoví 3 AP a zvýší Rituál o 1, i když zůstaly nevyužité akce.

Hod 2d6 + atribut proti obtížnosti: rozdíl ≥3 velký úspěch, ≥0 úspěch, ≥−2 částečný úspěch, jinak neúspěch. Dvě šestky vždy znamenají velký úspěch, dvě jedničky kritické selhání. Před hodem jsou následky skryté. Výsledek přidá předmět a provede explicitní změny HP, SAN, Hrozby a Rituálu.

Nulové HP/SAN, Hrozba 10, Rituál 8 nebo konec sedmého kola ukončí scénář porážkou. **Prototyp 0.3 neobsahuje vítěznou podmínku.** Uzavření brány, využití důkazů a vítězství vyžadují samostatný návrh pravidel; tento refaktoring je nevymýšlí.

## Opravené chyby a rozhodnutí

- Následky nejsou za běhu odvozovány regulárním výrazem z češtiny. Kombinovaná ztráta HP a SAN se aplikuje celá.
- Každá karta se vyhodnotí jednou za hru. Návrat do lokace a nové kolo ji neobnoví. Balíček se po poslední kartě vyčerpá; nepřetáčí se pro opakované odměny.
- Výsledek i cena akce se uloží společně před kosmetickou animací. Ovládání je během animace uzamčené; reset zruší časovač. Obnovení stránky zachová hod.
- Všechny akce kontroluje engine; po konci scénáře jsou neúčinné. Statistiky neklesnou pod nulu a nepřekročí limity.
- Uložený stav má verzi a validaci rozsahů, karet i hodů. Deník a výsledky přetrvají obnovení stránky.
- Skryté následky nejsou jen rozmazané v DOM; objeví se až vyhodnocený text. Texty se vkládají přes `textContent`.

## Architektura a kontrola

[Engine](../src/engine/game.js) nezná DOM, časovače ani úložiště. `transition` vrací nový stav při platné akci, jinak původní. Náhoda se předává jako hotové kostky. [Data](../src/data/locations.js) používají pojmenovaná pole a explicitní efekty. [UI](../src/ui/app.js) zajišťuje ovládání a persistenci.

Automatické testy: prahy hodů, kritické výsledky, ceny akcí, neměnnost vstupu, souběžné poškození, vyčerpání karet, konce hry, serializace a neplatné úložiště. Ručně kontroluj desktop i mobil: pohyb, výběr postupu, blokaci během hodu, reset během hodu, obnovu stránky, prázdnou lokaci, sedmé kolo a odmítnuté ukládání.
