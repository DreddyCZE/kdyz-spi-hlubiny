# M3.3 — Vyšetřovací deník a integrace M3.2

## Záměr
Vytvořit přehledný, atmosférický vyšetřovací deník v duchu investigativní deskové hry. Hráč v něm sleduje nalezené důkazy, znalosti, dostupné dedukce a chronologii událostí, bez úniku budoucích příběhových informací.

## Integrace s M3.2
- Původní M3.3 workstream vznikal souběžně s M3.2 a jeho UI zůstává izolované v `src/ui/journal.js`, `src/ui/journal.css` a vlastních testech.
- Po sloučení PR #8 obsahuje větev PR #10 společný engine, definice balíčků, save v4 a integrované UI.
- Journal stále přijímá pouze bezpečnou veřejnou projekci a log; nevykonává akce balíčku ani nemění pravidla dobírání.
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

- [journal.js](../src/ui/journal.js) přijímá výhradně `investigationView(state)` a veřejný `state.log`. `journalModel` kopíruje povolená prezentační pole, nepřenáší definice efektů, podmínek, karet či budoucích voleb. Veškeré texty se vkládají přes `textContent`.
- [journal.css](../src/ui/journal.css) izoluje papírové rozhraní, kontrastní záložky a focus. Na 320/390 px se záložky skládají do dvou sloupců; dialog může svisle rolovat. Reduced-motion vypíná animace i přechody deníku.
- Záložky používají `tablist`, `tab`, `tabpanel`, `aria-controls`, `aria-labelledby`, `aria-selected` a roving tabindex. Šipky vlevo/vpravo přepínají a cyklí záložky; Home/End skočí na první/poslední. Escape zavře existující dialog a obnoví focus na jeho původním tlačítku.
- Otevření, zavření i přepínání jsou lokální stav UI, který se neukládá a neposílá akci enginu. Tlačítka Znalosti/Dedukce ve spodní liště otevřou příslušnou záložku. Jedinou herní akcí zůstává již existující explicitní „Vyhodnotit důkazy“; to je za běhu hodu a po konci hry zakázané.
- Integrace: stylesheet v [index.html](../index.html); veřejná projekce, log a výběr záložky jsou propojené v [app.js](../src/ui/app.js). UI balíčků zůstává samostatnou kartovou sekcí; ovládání dialogu, dobírání ani přesunů si vzájemně nepřebírají fokus. E2E ověřuje oba moduly v aplikaci se save v4.

## Ověření dokončení

- `npm test`: **55/55** úspěšných testů, včetně modelu deníku, balíčků, migrace a absence vedlejších efektů.
- `npm run build`: úspěch, včetně existující validace obsahu.
- `npm run test:e2e`: **37 Chromium E2E** po integračním běhu; sada zahrnuje deník i M3.2 dobírání, skryté výsledky, save/reload, keyboard/focus, reduced-motion a rozměry 1440/390/320 px.
- `git diff --check`: bez chyb.
- [Screenshoty a vizuální kontrola](test-artifacts/m3-3/README.md).

PR #10 zůstává Draft bez merge. Větev je rebazovaná na `main` po merge PR #8; zachovává zároveň balíčky M3.2 a deník M3.3.
