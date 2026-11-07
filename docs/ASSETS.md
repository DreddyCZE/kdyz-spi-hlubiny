# Grafické podklady M3.0.2a

- [blackwater-map.webp](../src/assets/blackwater-map.webp): pracovní AI ilustrace vytvořená vestavěným image_gen podle promptu níže. Původní PNG bylo přímo převedeno do WebP, quality 90, method 6. Bez SVG/base64 obalu, ořezu či změny rozlišení. Všechny názvy a ovládání zůstávají HTML. Nejde o finální schválený art.
- `src/assets/paper-grain.svg`: vlastní procedurální SVG zrno, seed 8, pro jemné nepravidelnosti papíru.
- `src/ui/tokens.css`: vlastní CSS textury dřeva, pergamenu a tmavého potahu, barvy a typografie. Žádné vzdálené fonty ani hotlinky.
- Referenční screenshot uživatele nebyl vložen do aplikace; sloužil jako vizuální předloha rozložení, materiálů a palety. Existující referenční prototypy zůstaly beze změny.

## Prompt pro mapu (vestavěný image_gen, neprůhledné pozadí)

Use case: illustration-story. Create ONLY an illustrated game map background asset, not an app screenshot or UI. Landscape 5:4 aspect ratio, flat rectangular sheet filling image edge-to-edge, no perspective of the sheet. A detailed 1920s New England coastal town called Blackwater, sinister Lovecraft horror tabletop boardgame art, antique engraved ink and watercolor on distressed tan parchment, sepia rooftops, desaturated petrol green ocean, brass ochre street lights, intricate architectural detail with readable districts. Elevated bird's-eye/isometric buildings on a top-down cartographic town plan, coast runs down right side. Composition MUST place these landmarks at relative image coordinates (origin top left): harbor docks and fishing boats at x68% y69%, old town tightly packed gabled roofs at x42% y52%, grand library with classical columns at x29% y33%, ominous asylum with wings and wrought iron fence at x53% y20%, graveyard with tombs and bare trees at x19% y65%, tall lighthouse on rocky peninsula at x79% y23%, dark coastal cave opening at x83% y48%. Winding roads connect all districts; many individual Victorian and colonial houses, warehouse wharves, sea cliffs, waves, woodland around outskirts. A small compass rose near lower left. Weathered paper edges and faint cartographic hatching. Moody atmospheric hand-painted premium boardgame illustration, nuanced rich detail rather than geometric placeholders. All landmarks visible, no thick fog hiding streets. No text, no labels, no numbers, no buttons, no tokens, no card frames, no interface, no creatures, no external table border. This is a background behind real HTML map markers; keep room near landmarks for labels.

## Optimalizace po revizi PR #5

Původní SVG/base64: **6 001 452 B**. Vybraný WebP: **868 818 B**, úspora **5 132 634 B (85,52 %)**. Rozlišení **1402×1122 px**, bez resamplingu a ořezu. Souřadnice a kompozice zachovány.

Měřeno Pillow 13.0.0 proti původnímu PNG z commitu a3d40c0, dekódovanému do RGB. WebP: method 6; AVIF: speed 6; ostatní volby výchozí. PSNR přes všechny RGB kanály vůči zdrojovému PNG; nejde o náhradu vizuální kontroly.

| Varianta | Bajtů | Úspora proti SVG | PSNR |
| --- | ---: | ---: | ---: |
| WebP q85 | 720 614 | 87,99 % | 32,41 dB |
| **WebP q90 (vybráno)** | **868 818** | **85,52 %** | **33,50 dB** |
| AVIF q85 | 682 434 | 88,63 % | 33,40 dB |
| AVIF q90 | 830 177 | 86,17 % | 33,98 dB |

WebP q90 zůstává pod 1 MB a proti q85 zachovává více detailů. AVIF q90 je o 38 641 B menší; zvolen jednotný WebP bez alternativních zdrojů. Kvalita ověřena na ilustraci a snímcích desktopu i mobilu. SVG bylo pouze obalem rastru a nemá důvod zůstávat; odstraněno z aplikace i buildu, původní zdroj dostupný v historii a3d40c0.

Reprodukce: dekódovat base64 PNG z původního SVG, otevřít pomocí Pillow, převést na RGB a uložit přes `image.save('blackwater-map.webp', format='WEBP', quality=90, method=6)`. Pillow je jednorázový lokální nástroj, není závislostí aplikace ani buildu.

E2E ověřuje HTTP 200, MIME image/webp, cestu /dist/src/assets/blackwater-map.webp, dekódování 1402×1122 a velikost pod 1 000 000 B. Ověřuje princip podadresáře GitHub Pages proti produkčnímu buildu, nikoli veřejné nasazení PR.
