# Blackwater V3 — první souvislý playtest

Stav: experimentální rozhraní v PR #23. **Nejde o novou hru ani o nový save formát.** Herní pravidla, data scénáře a ukládání vlastní původní engine. Tento dokument slouží jako praktický scénář pro předání a ruční ověření.

## Jak otevřít V3

Po publikování příslušné verze webu otevři `index.html?ui=v3` na stejné doméně, kde běží hlavní scénář. Bez tohoto parametru je původní rozhraní beze změny. Dokud je PR #23 pouze Draft, veřejný web V3 nemusí obsahovat. Na PR větvi se v GitHub Actions → **Test and deploy Pages** vytváří také samostatný balíček `blackwater-v3-playable` a artefakt `blackwater-v3-screenshots`.

**Jak si zahrát V3 před sloučením (Windows):**
1. Otevři nejnovější úspěšný běh **Test and deploy Pages** u PR #23 a v sekci **Artifacts** stáhni `blackwater-v3-playable`.
2. Rozbal ZIP do prázdné složky; v ní musí být `index.html`, `src/`, `public/`.
3. Otevři PowerShell v této složce a spusť `py -m http.server 8000` (alternativně `python -m http.server 8000`).
4. V prohlížeči otevři **http://localhost:8000/index.html?ui=v3**.
5. Lokální server ukonči pomocí Ctrl+C. Uložené pozice z localhostu jsou oddělené od GitHub Pages; jejich přenos není automatický.

Nepouštěj `index.html` dvojklikem jako `file://`: ES moduly webové hry vyžadují webový server.

V prohlížeči můžeš použít novou hru, nebo pokračovat v kompatibilní scénářové pozici. Nezískané důkazy, výsledky voleb či skrytá data se nesmějí zobrazovat.

## Doporučený ruční průchod (10–20 minut)

1. Spusť novou hru a vyber vyšetřovatele. Na mobilu musí být výběr viditelný **před mapou**; po výběru se mapa přesune na první místo.
2. Na mapě vyber dostupnou lokaci. Ověř cenu přesunu, zamčená místa a přepočítání AP.
3. Otevři **Prozkoumat · karta**, dober kartu, vyber postup, hoď kostkami a přijmi výsledek. Před vyhodnocením nesmí být čitelný skrytý následek. Sleduj změny životů, SAN, AP, důkazů a hrozby.
4. Otevři **Důkazy a dedukce**. Vyzkoušej přepnutí Důkazy / Znalosti / Dedukce / Kronika. Karty musí zobrazovat pouze získané informace. Samotné prohlížení nesmí změnit uloženou pozici.
5. V **Inventáři** prohlédni použitelnou výbavu, pak bezpečně vyzkoušej `Sůl · snížit hrozbu` (pokud ji máš). Předmět se má po použití odebrat a změna se musí zachovat po obnovení stránky.
6. Vyhledej střetnutí s Mlžným psem v Knihovně. Na bojové obrazovce zkus návrat na mapu a znovu otevři aktivní souboj. Po akci se ukáže skutečný hod dvou kostek a výsledek střetu.
7. Ukonči kolo. Přechodová obrazovka musí zobrazovat skutečné hodnoty hrozby a rituálu. Po znovunačtení stránky musí kolo zůstat zachováno, ale přechodové okno se nesmí znovu samo otevřít.
8. Zkontroluj původní ilustrovaný režim a hlavní scénář bez `?ui=v3`. V3 nesmí poškodit jejich pozice, pravidla nebo UX.

## Kritéria hotové V3

- Desktopová i mobilní mapa jsou čitelné a navigovatelné i klávesnicí.
- Hráč se nikdy nezasekne v modálním okně bez zřejmé cesty zpět.
- Průzkum, souboj, deník, inventář a přechod kola fungují na **jednom skutečném herním stavu**.
- Neexistují dvě soutěžící ovládání téže akce ani duplicitní nadpisy.
- Uložená pozice a výsledky hodů zůstávají správné po reloadu.
- Chromium E2E včetně `V3 coherent playthrough` a `Scenario engine validation` musí být zelené na posledním HEAD.
- Porovnání skutečných screenshotů desktopu, mobilu, karet, boje, deníku a inventáře s vizuálním návrhem B + C.
- Ruční herní průchod alespoň jedním vyšetřovatelem; automatické testy nenahrazují lidský playtest.

## Co ještě není hotové

- Výsledné vizuální doladění všech obrazovek a typografie.
- Podrobná dostupnost pro klávesnici a čtečky obrazovky napříč všemi modálními okny.
- Rozšířený balance a ruční playtest napříč celým příběhem.
- Samostatné **veřejné** preview pro PR větev. PR testy vytvářejí lokálně hratelný ZIP a screenshoty, nikoli automatické Pages nasazení.

Technické detaily a průběh změn jsou popsány v PR #23.
