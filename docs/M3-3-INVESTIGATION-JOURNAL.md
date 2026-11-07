# M3.3 — Vyšetřovací deník (paralelní workstream)

## Záměr
Vytvořit přehledný, atmosférický vyšetřovací deník v duchu investigativní deskové hry. Hráč v něm sleduje nalezené důkazy, znalosti, dostupné dedukce a chronologii událostí, bez úniku budoucích příběhových informací.

## Hranice vůči M3.2
- **Nevstupovat do** `src/engine/game.js`, `src/engine/content.js`, `src/data/cards.js`, `src/engine/schema.js` ani save/migračních souborů.
- Neimplementovat balíčky, shuffle, draw ani discard; to vlastní PR #8.
- Nové UI vytvářet v izolovaných souborech `src/ui/journal.js`, `src/ui/journal.css` a vlastních testech; minimální integrace v `index.html` a `src/ui/app.js` je přípustná, ale musí být malá a dobře oddělená, aby šla po merge M3.2 jednoduše rebasovat.
- Pokud chybí data pro nějakou položku, použít pouze bezpečnou veřejnou projekci existujícího `investigationView(state)`, `state.log` a veřejné názvy; **nevymýšlet neveřejné informace**.

## Funkce
1. Přepínatelné sekce **Důkazy / Znalosti / Dedukce / Kronika** s počty získaných položek.
2. Přehled stavu dedukcí a požadavků, ale bez zobrazení tajných výsledků, neodemčených textů a skrytých efektů.
3. Čitelné krátké popisy z existujících veřejných dat; prázdné stavy s vysvětlením.
4. Přístupné ovládání klávesnicí, focus, ARIA a reduced-motion. Mobil 320/390 px bez horizontálního scrollu.
5. Deník je pouze prezentace: otevření, filtr ani přepnutí záložek nesmí spotřebovat AP, měnit revision nebo ukládat nová herní data.
6. Vizuál tmavý inkoust, zažloutlý papír, mosazné akcenty; nepřebírat chráněné ilustrace cizích her.

## Testy
- Zobrazení skutečně získaných důkazů/znalostí/dedukcí, prázdný stav.
- Bez úniku neveřejných textů a efektů.
- Otevření/zavření bez změny herního stavu a save.
- Reload zachová obsah deníku na základě stávajícího stavu.
- Mobil 320/390 px a desktop 1440 px, keyboard focus, reduced motion.
- `npm test`, `npm run build`, `npm run test:e2e`, `git diff --check`.

## Výstup
Aktualizovat existující Draft PR #10, doložit testy a screenshoty. **Bez merge.**
