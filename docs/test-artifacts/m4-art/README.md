# M4 – skutečné UI a kontrola rastrů

Chromium, sestavená aplikace `/dist/blackwater.html`, 8. 11. 2026. Screenshoty pořídil [E2E test](../../../e2e/blackwater-art.spec.js) při skutečném průchodu herním UI s deterministickými hody 4 + 4. Nejde o mockup.

| Fáze | Desktop 1440 px | Mobil 390 px | Mobil 320 px |
| --- | --- | --- | --- |
| Výběr postavy | [1440](selection-1440.png) | [390](selection-390.png) | [320](selection-320.png) |
| Výsledek akce | [1440](outcome-1440.png) | [390](outcome-390.png) | [320](outcome-320.png) |
| Přesun | [1440](travel-1440.png) | [390](travel-390.png) | [320](travel-320.png) |
| Karta mýtu | [1440](myth-1440.png) | [390](myth-390.png) | [320](myth-320.png) |
| Souboj | [1440](combat-1440.png) | [390](combat-390.png) | [320](combat-320.png) |
| Bojový výsledek | [1440](combat-result-1440.png) | [390](combat-result-390.png) | [320](combat-result-320.png) |

Vizuálně zkontrolovány rozměry 1440/390/320 px a všechny skutečné rastry v kontrolních listech: [portréty a lokace](art-contact-0.png), [mýty a setkání](art-contact-16.png), [výsledky a předměty](art-contact-32.png). Kontrolní listy jsou pouze QA galerie; nikdy se nevkládají jako karty do hry.

**88 unit testů, 49 Chromium E2E testů, build a kontrola whitespace prošly.** Automatická kontrola kromě všech 44 cest/dekódování ověřuje stav save po reloadu, všechny 3 vyšetřovatele a 4 monstra, skutečné rozměry portrétů, animaci/skrytí výsledků, druhý mýtus po prvním, boj a ukončení solí, absenci 404/JS chyb a kontrast tlačítka při hoveru ≥ 4,5:1.

Lokálně se kopie buildu testuje pod `/kdyz-spi-hlubiny/preview/`, stejným způsobem jako Pages workflow skládá stabilní kořen a preview podsložku. Živý preview průchod se ověřuje samostatně po pushi.
