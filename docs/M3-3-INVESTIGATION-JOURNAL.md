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


## Implementace M3.3 / Issue #11

Hotový deník má čtyři záložky Důkazy, Znalosti, Dedukce a Kronika s počty skutečně získaných záznamů. Připravené dedukce se oddělují od dokončených; zobrazují pouze veřejný název, popis a stav „Požadavky splněny“. Neveřejné podmínky ani chybějící požadavky nelze z veřejného API bezpečně zjistit a UI je nedoplňuje odhadem. Kronika řadí existující veřejný log od nejstaršího k nejnovějšímu.

- [journal.js](../src/ui/journal.js) přijímá výhradně `investigationView(state)` a `state.log`. `journalModel` kopíruje povolená prezentační pole, nepřenáší definice efektů, podmínek, karet či budoucích voleb. Veškeré texty se vkládají přes `textContent`.
- [journal.css](../src/ui/journal.css) izoluje papírové rozhraní, kontrastní záložky a focus. Na 320/390 px se záložky skládají do dvou sloupců; dialog může svisle rolovat. Reduced-motion vypíná animace i přechody deníku.
- Záložky používají `tablist`, `tab`, `tabpanel`, `aria-controls`, `aria-labelledby`, `aria-selected` a roving tabindex. Šipky vlevo/vpravo přepínají a cyklí záložky; Home/End skočí na první/poslední. Escape zavře existující dialog a obnoví focus na jeho původním tlačítku.
- Otevření, zavření i přepínání jsou lokální stav UI, který se neukládá a neposílá akci enginu. Tlačítka Znalosti/Dedukce ve spodní liště otevřou příslušnou záložku. Jedinou herní akcí zůstává již existující explicitní „Vyhodnotit důkazy“; to je za běhu hodu a po konci hry zakázané.
- Integrace: jeden nový stylesheet v [index.html](../index.html), veřejný log jako třetí parametr `journal.render` a výběr záložky při otevření v [app.js](../src/ui/app.js). Soubory enginu, save/migrací, scénáře, mapy a balíčků se nemění. Při integraci PR #8 stačí zachovat tento argument a výběr záložky, následně zopakovat testy.

## Ověření dokončení

- `npm test`: **46/46** úspěšných testů, z toho čtyři nové unit testy modelu deníku, reálné veřejné projekce a absence vedlejších efektů.
- `npm run build`: úspěch, včetně existující validace obsahu.
- `npm run test:e2e`: **33/33** úspěšných testů v Chromium, z toho šest nových testů deníku: prázdné stavy, reálné získání důkazů/dedukce, chronologie, bezpečný text, keyboard/focus, save/reload, readonly prohlížení i při dosud neuložené hře, reduced-motion a rozměry 1440/390/320 px.
- `git diff --check`: bez chyb.
- [Screenshoty a vizuální kontrola](test-artifacts/m3-3/README.md).

PR #10 zůstává Draft bez merge. Tato větev neobsahuje implementaci balíčků PR #8.
