# M3.3 – vyšetřovací deník

Skutečné screenshoty sestavené aplikace z `/dist/`, Chromium. Důkazy vznikly dvěma deterministickými hody 4 + 4 v běžném UI; každá karta byla výslovně dobrána z balíčku. Znalost vznikla až explicitním vyhodnocením důkazů. Snímky byly obnoveny po integraci balíčků M3.2 a save v4.

| Šířka | Důkazy před dedukcí | Znalost po dedukci |
| --- | --- | --- |
| 1440 px | [Důkazy](journal-1440.png) | [Znalosti](journal-knowledge-1440.png) |
| 390 px | [Důkazy](journal-390.png) | [Znalosti](journal-knowledge-390.png) |
| 320 px | [Důkazy](journal-320.png) | [Znalosti](journal-knowledge-320.png) |

Vizuálně ověřeny všechny tři šířky: čitelný obsah, kontrastní focus, bez horizontálního přetékání. Dlouhý obsah používá svislý scroll dialogu. Záložky mají minimálně 44 × 44 px; na mobilu tvoří dva sloupce.

Ověření po integraci: 55 unit testů, 37 Chromium E2E, build a `git diff --check`. Screenshoty pořídil [vlastní test deníku](../../../e2e/journal.spec.js), který kontroluje také klávesnici, reduced-motion, bezpečné texty, skutečné odměny, reload a zachování uloženého stavu při prohlížení.
