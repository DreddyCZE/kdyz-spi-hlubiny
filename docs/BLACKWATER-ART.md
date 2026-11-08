# M4 – audit a integrace ilustrací Blackwateru

## Zjištěný stav

Audit větve PR #15 a živého `/kdyz-spi-hlubiny/preview/blackwater.html` potvrdil, že problém nebyl jen v cestách. SVG portréty fyzicky existovaly a URL se řešily pod správným preview prefixem, ale šlo o geometrické zástupce. Prázdný `#characterGlyph` měl v živém prohlížeči rozměr **0 × 0 px**. Navíc pět pravidel `.battle-dialog … .battle-art` používalo `background: radial-gradient(…) !important`, čímž přepisovalo inline URL portrétů. ByLocation registr opakoval loď/rybáře mezi nesouvisejícími lokacemi; mýty si tyto náhrady dále půjčovaly. Výsledky a předměty používaly jen glyfy a gradienty.

Aktuální runtime obsahuje **14 setkání**, 3 vyšetřovatele, 4 monstra, 7 lokací, 6 karet mýtu a 7 definic předmětů. Grafika je přiřazena ke skutečným stabilním ID; nový obsah ani mechaniky se nepřidávají.

## Dodaný ZIP a původ

ZIP `blackwater_grafika_k_uploadu.zip` byl dostupný a rozbalen do [src/assets/blackwater](../src/assets/blackwater/). Sedm původních PNG a README jsou zachovány beze změny. Portréty měly původně jen 283 × 140 a 274 × 141 px; výřezy obsahovaly části jmenovek, rámečky nebo emblémy. `full_design_reference.png` zůstává pouze referencí a **není v runtime registru**.

Šest dodaných výřezů bylo vestavěným `image_gen` generativně vyčištěno a rozšířeno na samostatné ilustrace; nejde o pouhé zvětšení původních pixelů. Zůstaly rozpoznatelné motivy detektiva, utopeného námořníka, přístavu, majáku, Prvního úderu a nalezené stopy. Textové pásy, velké emblémy a rámečky návrhu se nepoužívají v herních obrázcích. Zbylých **38 původních rastrů** bylo vytvořeno samostatně podle veřejných scén a identit, bez cizího artworku. Přesné prompty, původ, rozměry, velikosti a SHA-256 jsou v [manifestu](BLACKWATER-ART-MANIFEST.json).

Finální soubory byly převedeny přes Pillow do WebP, quality 82, method 6, maximálně 1008 × 672 px. PNG originály ze ZIPu se nikdy nepoužívají jako celé UI karty.

## Registr a použití

[story-art.js](../src/data/story-art.js) obsahuje neměnný `blackwaterArt` se skupinami `investigators`, `monsters`, `locations`, `myths`, `encounters`, `results`, `items`. Každá postava, monstrum, lokace, mýtus, setkání a předmět má vlastní soubor. Úspěšné stupně výsledku sdílejí příbuzné zátiší objevu, částečný úspěch má vlastní scénu ceny a neúspěšné stupně scénu nebezpečí. Bojový výsledek ukazuje právě dosaženého protivníka, nikoli univerzální přístav.

URL se v [blackwater.js](../src/ui/blackwater.js) řeší proti `document.baseURI`. Proto mají stejnou sémantiku v kořeni, pod `/dist/` i `/kdyz-spi-hlubiny/preview/`. Obrázek setkání se nevyžaduje, dokud není karta dobraná; výsledková ilustrace se nastavuje až po skutečném vyhodnocení.

[Build](../scripts/build.mjs) spouští [kontrolu všech registrovaných cest a WebP signatur](../scripts/check-blackwater-assets.mjs) ještě před kopírováním. Chybějící či neplatný soubor build zastaví. E2E navíc dekóduje každý rastr pod nasimulovaným vnořeným Pages prefixem a totéž lze spustit proti skutečnému preview přes `BLACKWATER_PREVIEW_URL`.

## UI a zachování hry

Odstraněny konfliktní `!important` background shorthandy, portrét detailu má skutečné rozměry. Emblémy mýtu/přesunu jsou malé a leží v rohu. Souboj má oddělené portréty, žetony na vlastních kartách, dostupné předměty a kompaktní akce. Modal se po reloadu aktivního boje znovu otevře bez opakování hodu či změny save. Reset uzavírá všechna předešlá modální okna. Dostupnost předmětů v UI odpovídá existujícím pravidlům použití.

**Engine, ekonomika, mapové souřadnice, schéma a uložené pozice se nemění.** Symboly mapy a kostek zůstávají herními značkami, nikoli náhradou portrétů či malovaných scén.

## Inventář skutečně integrovaných rastrů

| Asset / ID | Soubor | Rozměry | Velikost |
| --- | --- | --- | --- |
| `detective` | [detective.webp](../src/assets/blackwater/detective.webp) | 1008 × 567 | 93,768 B |
| `drowned` | [drowned.webp](../src/assets/blackwater/drowned.webp) | 1008 × 567 | 129,492 B |
| `harbor` | [harbor.webp](../src/assets/blackwater/harbor.webp) | 1008 × 482 | 131,032 B |
| `lighthouse` | [lighthouse.webp](../src/assets/blackwater/lighthouse.webp) | 1008 × 476 | 98,016 B |
| `myth-bell` | [myth-bell.webp](../src/assets/blackwater/myth-bell.webp) | 1008 × 592 | 138,868 B |
| `evidence` | [evidence.webp](../src/assets/blackwater/evidence.webp) | 1008 × 504 | 127,126 B |
| `occultist` | [occultist.webp](../src/assets/blackwater/occultist.webp) | 1008 × 672 | 69,020 B |
| `sailor` | [sailor.webp](../src/assets/blackwater/sailor.webp) | 1008 × 672 | 88,368 B |
| `fog-hound` | [fog-hound.webp](../src/assets/blackwater/fog-hound.webp) | 1008 × 672 | 84,614 B |
| `hollow-orderly` | [hollow-orderly.webp](../src/assets/blackwater/hollow-orderly.webp) | 1008 × 672 | 74,716 B |
| `bell-keeper` | [bell-keeper.webp](../src/assets/blackwater/bell-keeper.webp) | 1008 × 672 | 83,226 B |
| `old-town` | [old-town.webp](../src/assets/blackwater/old-town.webp) | 1008 × 672 | 123,326 B |
| `library` | [library.webp](../src/assets/blackwater/library.webp) | 1008 × 672 | 110,784 B |
| `asylum` | [asylum.webp](../src/assets/blackwater/asylum.webp) | 1008 × 672 | 86,012 B |
| `cemetery` | [cemetery.webp](../src/assets/blackwater/cemetery.webp) | 1008 × 672 | 111,206 B |
| `caves` | [caves.webp](../src/assets/blackwater/caves.webp) | 1008 × 672 | 89,616 B |
| `myth-fog` | [myth-fog.webp](../src/assets/blackwater/myth-fog.webp) | 1008 × 672 | 50,432 B |
| `myth-knock` | [myth-knock.webp](../src/assets/blackwater/myth-knock.webp) | 1008 × 672 | 93,220 B |
| `myth-hound` | [myth-hound.webp](../src/assets/blackwater/myth-hound.webp) | 1008 × 672 | 98,428 B |
| `myth-lantern` | [myth-lantern.webp](../src/assets/blackwater/myth-lantern.webp) | 1008 × 672 | 64,496 B |
| `myth-orderly` | [myth-orderly.webp](../src/assets/blackwater/myth-orderly.webp) | 1008 × 672 | 68,248 B |
| `bandage` | [bandage.webp](../src/assets/blackwater/bandage.webp) | 1008 × 672 | 98,028 B |
| `laudanum` | [laudanum.webp](../src/assets/blackwater/laudanum.webp) | 1008 × 672 | 84,864 B |
| `salt` | [salt.webp](../src/assets/blackwater/salt.webp) | 1008 × 672 | 91,480 B |
| `revolver` | [revolver.webp](../src/assets/blackwater/revolver.webp) | 1008 × 672 | 84,398 B |
| `bell-key` | [bell-key.webp](../src/assets/blackwater/bell-key.webp) | 1008 × 672 | 97,392 B |
| `cylinder` | [cylinder.webp](../src/assets/blackwater/cylinder.webp) | 1008 × 672 | 83,458 B |
| `tide-page` | [tide-page.webp](../src/assets/blackwater/tide-page.webp) | 1008 × 672 | 114,076 B |
| `result-cost` | [result-cost.webp](../src/assets/blackwater/result-cost.webp) | 1008 × 672 | 140,006 B |
| `result-danger` | [result-danger.webp](../src/assets/blackwater/result-danger.webp) | 1008 × 672 | 90,510 B |
| `bw-00-01` | [bw-00-01.webp](../src/assets/blackwater/bw-00-01.webp) | 1008 × 672 | 66,832 B |
| `bw-00-02` | [bw-00-02.webp](../src/assets/blackwater/bw-00-02.webp) | 1008 × 672 | 84,046 B |
| `bw-01-01` | [bw-01-01.webp](../src/assets/blackwater/bw-01-01.webp) | 1008 × 672 | 95,418 B |
| `bw-01-02` | [bw-01-02.webp](../src/assets/blackwater/bw-01-02.webp) | 1008 × 672 | 89,440 B |
| `bw-02-01` | [bw-02-01.webp](../src/assets/blackwater/bw-02-01.webp) | 1008 × 672 | 85,868 B |
| `bw-02-02` | [bw-02-02.webp](../src/assets/blackwater/bw-02-02.webp) | 1008 × 672 | 130,970 B |
| `bw-03-01` | [bw-03-01.webp](../src/assets/blackwater/bw-03-01.webp) | 1008 × 672 | 67,526 B |
| `bw-03-02` | [bw-03-02.webp](../src/assets/blackwater/bw-03-02.webp) | 1008 × 672 | 92,926 B |
| `bw-04-01` | [bw-04-01.webp](../src/assets/blackwater/bw-04-01.webp) | 1008 × 672 | 106,958 B |
| `bw-04-02` | [bw-04-02.webp](../src/assets/blackwater/bw-04-02.webp) | 1008 × 672 | 93,872 B |
| `bw-05-01` | [bw-05-01.webp](../src/assets/blackwater/bw-05-01.webp) | 1008 × 672 | 98,148 B |
| `bw-05-02` | [bw-05-02.webp](../src/assets/blackwater/bw-05-02.webp) | 1008 × 672 | 85,936 B |
| `bw-06-01` | [bw-06-01.webp](../src/assets/blackwater/bw-06-01.webp) | 1008 × 672 | 95,798 B |
| `bw-06-02` | [bw-06-02.webp](../src/assets/blackwater/bw-06-02.webp) | 1008 × 672 | 99,112 B |

Pro všechny aktuálně registrované objekty je hotový rastr; žádná požadovaná runtime ilustrace nezůstává nahrazena SVG/gradientem. Pokud se později doplní další karty z širšího návrhu scénáře, budou potřebovat vlastní ilustrace a registr je nebude vydávat za hotové.


## Ověření implementace

- `npm test`: 88 úspěšných testů.
- `npm run build`: úspěch včetně kontroly 44 WebP souborů.
- `npm run test:e2e`: 49 úspěšných Chromium testů, včetně 12 nových testů Blackwateru.
- `git diff --check`: bez chyb.
- Vizuální kontrola skutečných rastrů a UI na 1440/390/320 px, [galerie](test-artifacts/m4-art/README.md).
- Reprodukční příkaz pro stejné Blackwater testy nad živým preview: nastavit `BLACKWATER_PREVIEW_URL=https://dreddycze.github.io/kdyz-spi-hlubiny/preview/blackwater.html` a spustit `npm run test:e2e -- e2e/blackwater-art.spec.js`.
