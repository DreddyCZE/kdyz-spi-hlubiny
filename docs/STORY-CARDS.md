# M3.1 – ilustrované příběhové karty

Dokončení Issue #7 v PR #6. Ilustrace jsou dekorativní, příběh, volby, hod a výsledek zůstávají živé HTML. Pravidla, ekonomika, save v3, sedm ID lokací a souřadnice mapy se nemění.

## Integrované ilustrace

Původní obrázky vytvořené vestavěným nástrojem `image_gen` 7. 11. 2026 bez referenčního cizího artworku. PNG byly zmenšeny pomocí Pillow na 1200 × 800 a převedeny do WebP (quality 82, method 6). Nejde o mockupy rozhraní.

| Stabilní ID | Karta | Soubor | Rozměry | Velikost |
| --- | --- | --- | --- | --- |
| `0-0` | Ztracená loď | [lost-ship.webp](../src/assets/cards/lost-ship.webp) | 1200 × 800 | 209 136 B |
| `0-1` | Muž z mlhy | [man-in-fog.webp](../src/assets/cards/man-in-fog.webp) | 1200 × 800 | 217 874 B |

[Registr](../src/data/story-art.js) dává přednost ID karty, potom lokaci a nakonec existující WebP mapě. Ostatní karty mají tento přiznaný fallback. Relativní URL se řeší proti `document.baseURI`; build kopíruje assety do podadresáře aplikace. E2E ověřuje HTTP 200, WebP signaturu i dekódování všech registrovaných cest z `/dist/`.

### Použité prompty (vestavěný nástroj)

**Ztracená loď:** Use case: illustration-story. Create an original atmospheric illustration for a Czech investigative card game set in fictional Blackwater in the 1920s. A small abandoned wooden fishing boat bumps against rotten harbor pilings in dense sea mist, its name scratched away (no legible writing), dark open hatch descending into the hold. Ink etching with restrained watercolor washes, aged ivory, deep petrol green, muted brass, subtle grain, eerie investigative mood. Wide cinematic composition, no typography, no UI, no borders, no logos, no watermark. Landscape 1536x1024. Save the generated asset for integration into a game.

**Muž z mlhy:** Use case: illustration-story. Original artwork for a 1920s fictional Blackwater investigative horror card game. A lone fisherman emerges from thick harbor fog, wearing a period oilskin coat, cloudy pale eyes, strange subtle marks on his neck, wet cobblestones and distant pilings. Ink etching with restrained watercolor washes, aged ivory, deep petrol green, muted brass; same vintage illustrated mystery aesthetic. Wide cinematic landscape composition 1536x1024; no typography, UI, borders, logos or watermark. Depict the encounter only, no clue rewards or outcomes.

## Náhled a odhalení

Schéma testované volby definuje šest stupňů, ale ne všechny musejí být dosažitelné. [Prezentační helper](../src/ui/story-card.js) z veřejného testu projde 36 kombinací kostek pomocí existujícího `evaluate`. Nepřistupuje k definicím skrytých následků. Například první volba `1-0` (Obálka pod prahem) má pět dosažitelných stupňů, druhá šest. Totéž omezení se týká první volby `2-0` a druhé `3-0`. Volba bez testu nemá kostkový náhled.

Náhled obsahuje pouze české názvy dosažitelných stupňů. Texty ani efekty následků nejsou v DOM před hodem ani během animace. Po animaci se vloží jediný dosažený následek. Uložení probíhá atomicky při vyhodnocení; reload během animace zobrazí uložený výsledek bez další odměny nebo platby.

## Ověření

- `npm test`: 42 úspěšných testů.
- `npm run build`: úspěšný build a validace obsahu.
- `npm run test:e2e`: 27 testů v Chromium; skrytí v celém DOM, dosažitelných pět/šest stupňů, assety pod `/dist/`, save/reload, ovládání klávesnicí, focus a reduced-motion.
- `git diff --check`: bez chyb.
- Vizuální kontrola 1440/390/320 px: bez horizontálního přetékání, čitelné názvy a volby. Desktopová karta roste s obsahem, ovládání se neschovává do vnitřního scrollu.

[Screenshoty finálního stavu](test-artifacts/m3-1/README.md) jsou součástí větve. Lokální Chromium kontroluje sestavenou aplikaci; skutečný produkční deploy se tímto PR nespouští a sloučení není součástí zadání.
