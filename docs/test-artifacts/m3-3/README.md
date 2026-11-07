# M3.3 – vyšetřovací deník

Skutečné screenshoty sestavené aplikace z `/dist/`, Chromium, 7. 11. 2026. Důkazy vznikly dvěma deterministickými hody 4 + 4 v běžném UI. Znalost vznikla až explicitním vyhodnocením důkazů.

| Šířka | Důkazy před dedukcí | Znalost po dedukci |
| --- | --- | --- |
| 1440 px | [Důkazy](journal-1440.png) | [Znalosti](journal-knowledge-1440.png) |
| 390 px | [Důkazy](journal-390.png) | [Znalosti](journal-knowledge-390.png) |
| 320 px | [Důkazy](journal-320.png) | [Znalosti](journal-knowledge-320.png) |

Vizuálně ověřeny všechny tři šířky: čitelný obsah, kontrastní focus, bez horizontálního přetékání. Dlouhý obsah používá svislý scroll dialogu. Záložky mají minimálně 44 × 44 px; na mobilu tvoří dva sloupce.

Ověření: 46 unit testů, 33 Chromium E2E testů, build a `git diff --check` prošly. Screenshoty pořídil [vlastní test deníku](../../../e2e/journal.spec.js), který kontroluje také klávesnici, reduced-motion, bezpečné texty, skutečné odměny, reload a zachování uloženého stavu při prohlížení.
