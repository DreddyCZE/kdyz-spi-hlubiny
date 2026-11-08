# M4.2 — Protivníci a jednoduchý boj (návrh)

## Design
Souboj je vzácnější, významná událost: 1–3 střetnutí za scénář, ne náhodný boj po každém přesunu. Hráč má vždy aspoň dvě cesty (boj/útěk/vyjednávání nebo rituál). Neúspěšný hod nikdy nesmí permanentně zablokovat důležitou stopu. Boj využívá existující 2k6, atributy SÍ, OB, VĚ, VŮ, VN, HP, SAN a Hrozbu.

## MVP pravidla (návrh, zatím neimplementováno)
- Nepřítel má ID, název, místo, HP (2–5), obranu (7–10), útok (1–2 HP nebo 1 SAN), vlastnosti a podmínku výskytu.
- Střetnutí má maximálně tři výměny; hráč v každé volí útok, útěk nebo zvláštní akci.
- Útok: 2k6 + SÍ + bonus zbraně vs obrana. Kritický úspěch 2 zranění; velký/obyčejný úspěch 1 zranění; částečný úspěch 1 zranění oběma; selhání protiútok. Kritické selhání protiútok a Hrozba +1.
- Útěk: 2k6 + OB vs obtížnost 8–10. Úspěch únik; částečný úspěch únik za cenu 1 HP nebo SAN; selhání protiútok a další možnost volby. Po třetí výměně automaticky únik za cenu, aby nevznikla nekonečná smyčka.
- Zvláštní akce: VĚ/VŮ nebo vyžadovaný důkaz/předmět; může protivníka zahnat bez zabití. Podmínky se vyhodnocují serverově/doménově, skryté výsledky se nikdy nevystavují v public projekci.
- Boj nestojí další AP za každý hod; celé střetnutí stojí 1 AP při vstupu. Nesmí dovolit opakovaným pokusem zdarma získávat zdroje.
- Výsledky a zranění se uloží atomicky. Při reloadu nelze přehodit kostky, duplikovat kořist ani změnit volbu po vyhodnocení.
- Žádný nový univerzální bonusový systém před ověřením, že stávající atributy stačí.

## První nepřátelé
| ID | Název | Lokace | HP | Obrana | Útok | Zvláštní možnost |
|---|---|---|---:|---:|---|---|
| enemy-drowned-sailor | Utopený námořník | Přístav | 3 | 8 | 1 HP | VĚ 8: rozpoznat znamení a zahnat |
| enemy-fog-hound | Mlžný pes | Opuštěná ulice | 2 | 9 | 1 HP | OB 8: proklouznout mezi domy |
| enemy-hollow-orderly | Prázdný ošetřovatel | Ústav | 3 | 8 | 1 SAN | VŮ 9: oslovit pravým jménem |
| enemy-bell-keeper | Zvoník bez tváře | Maják | 5 | 10 | 2 SAN | znalost rituálu: umlčet zvon bez boje |

## Herní předměty (návrh)
| ID | Název | Funkce | Způsob získání |
|---|---|---|---|
| item-rusty-revolver | Rezavý revolver | +1 k útoku, jednou za střetnutí | Přístav |
| item-salt-pouch | Sáček posvěcené soli | Jednorázově zahnat nadpřirozeného protivníka | Dům se solí |
| item-bell-key | Zvoníkův klíč | Zvláštní akce u majáku | Hřbitov |
| item-wax-cylinder | Fonografický váleček | Důkaz rytmu, umožní vyhnout se střetnutí | Ústav |
| item-tide-page | Stránka z knihy přílivů | Znalost o čase obřadu | Archiv |

Předměty jsou koncepty; **nejsou přidané do katalogu ani hry**. Současný engine nemá vybavení, nepřátelské HP ani bojové tahy. Přidat až po samostatných testech a promyšlené migraci save v4.

## Základní průběh
`explore → encounter preview → choose action → roll → apply atomic outcome → enemy defeated / escaped / continues → story`

Doménový stav nesmí prozrazovat výsledky dopředu. Při konci boje se vrací původní průzkum; hráč může pokračovat v příběhu i při útěku.

## Akceptační testy
- Všechny souboje jdou ukončit bez zabití protivníka; existuje dosažitelná alternativa.
- Neúspěšný hod neuzamkne klíčové vyšetřovací linie.
- Výsledek hodu je deterministický při testovacích kostkách; UI neobsahuje budoucí texty ani efekty.
- Opakovaný resolve, refresh a návrat do lokace nezdvojují škody ani odměny.
- Výchozí hra a existující save v4 fungují beze změn.
- Testy klávesnice, focus, reduced-motion, mobil 320/390 px.

## Implementační pořadí
1. Izolovaný `src/engine/combat.js` s čistými funkcemi a unit testy, bez zásahu do legacy engine.
2. Datový registr nepřátel a validace.
3. Perzistence a scénářové napojení, explicitní save migrace.
4. UI bojové karty a E2E.
5. Vyvážení pomocí simulací, žádné povinné souboje.
