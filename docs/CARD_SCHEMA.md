# Schéma karet M2.1

Zdrojové definice: [cards.js](../src/data/cards.js), [example-card.js](../src/data/example-card.js). Validátor: [schema.js](../src/engine/schema.js). Datové definice neobsahují funkce, kód ani `eval`.

## Identifikátory a registry

ID je neprázdný řetězec odpovídající `[a-z0-9][a-z0-9-]*`. ID karty a ID volby jsou každé globálně unikátní ve svém prostoru; nemění se při přejmenování textů nebo přesunu v poli. Původní ID `0-0` až `6-0` a `location-0` až `location-6` zůstávají. Volby mají ID například `0-0-choice-1`. Předměty a důkazy mají stabilní ID `reward-1` atd. v [registru](../src/data/catalog.js); jejich číslování se nesmí přegenerovat. UI převádí ID zpět na české názvy. Složené odměny M1 (například „Deník a přívěsek“) zůstávají jednou položkou, aby migrace neměnila jejich obsah.

## Karta

| Pole | Význam |
| --- | --- |
| `id` | Stabilní ID karty |
| `type` | `encounter`, `event`, `item`, `evidence` |
| `locationId` | Odkaz na existující lokaci |
| `title`, `description` | Neprázdné veřejné texty |
| `repeatable` | Boolean; povoluje další provedení až po akci `next` |
| `conditions` | Povinné pole podmínek, všechny musejí platit |
| `choices` | Neprázdné pole voleb |

Typy mají v M2.1 stejný karetní průchod. `event` nespouští automatickou událost, `item` ani `evidence` samy neudělují odměnu; vše vyjadřují efekty voleb. Budoucí typ vyžaduje explicitní rozšíření registru typů, nikoli přepis testů a efektů.

## Volba a test

Volba má `id`, `label`, `apCost` (celé 0–3), volitelné `conditions`, volitelný `test` a povinné `outcomes`. Test obsahuje `attribute` (`SÍ`, `OB`, `VĚ`, `VŮ`, `VN`), kladnou celočíselnou `difficulty` a volitelný celočíselný `modifier` (výchozí 0).

Testovaná volba má právě šest výsledků: `criticalSuccess`, `greatSuccess`, `success`, `partialSuccess`, `failure`, `criticalFailure`. Volba bez testu má pouze `outcomes.success`; kostky se negenerují ani nezobrazí jako hod. Každá volba vlastní samostatnou tabulku. Výsledek je `{ text, effects: [] }`; text je neprázdný, efekty jsou pole.

```js
{
  id: 'example-leave', label: 'Pokračovat dál', apCost: 0,
  outcomes: { success: { text: 'Pokračuješ dál.', effects: [] } }
}
```

Úplný příklad s různými větvemi je [Poznámka na molu](../src/data/example-card.js).

## Podmínky (AND)

| `type` | Další pole | Podmínka |
| --- | --- | --- |
| `hasItem` | `id` | Předmět je v inventáři |
| `hasEvidence` | `id` | Důkaz je ve sbírce |
| `flagEquals` | `id`, `value` | Existující příznak přesně odpovídá hodnotě |
| `minRound` | `round` | Kolo ≥ celé číslo 1–7 |
| `maxRound` | `round` | Kolo ≤ celé číslo 1–7 |
| `locationUnlocked` | `id` | Lokace je odemčená |

Prázdné pole platí. Chybějící příznak se nerovná `false`. `value` je boolean, řetězec nebo konečné číslo. ID musejí patřit do příslušného registru. Neznámé operace a pole jsou chyby.

## Efekty

| `type` | Další pole | Chování |
| --- | --- | --- |
| `modifyStat` | `stat`: `hp` / `san`, `amount` | Změna a omezení na 0–6 / 0–8 |
| `addItem` | `id` | Přidá unikátní předmět |
| `removeItem` | `id` | Odebere předmět; pokud chybí, celé rozhodnutí se odmítne |
| `addEvidence` | `id` | Přidá unikátní důkaz |
| `setFlag` | `id`, `value` | Nastaví registrovaný příznak |
| `modifyThreat` | `amount` | Změna s limitem 0–10 |
| `modifyRitual` | `amount` | Změna s limitem 0–8 |
| `unlockLocation` | `id` | Odemkne existující lokaci bez duplicit |

`amount` je bezpečné celé číslo. Efekty se provedou v pořadí na soukromé kopii stavu. Cena AP, efekty, záznam vyřešení a konec hry tvoří jeden přechod. Při selhání nevznikne částečná odměna ani platba. Konec hry se kontroluje po všech efektech.

## Veřejná a skrytá data

`currentCard` vrací pouze metadata a veřejné volby včetně dostupnosti, ceny a testu; neobsahuje výsledkové texty ani efekty. `visibleResult` vrací pouze dosažený následek již vyřešené karty. UI během animace nezapisuje do DOM ani tento text. Jde o skrytí v rozhraní, nikoli o utajení před uživatelem schopným prohlížet zdrojové soubory statické hry.

## Odmítnutí neplatných definic

`validateCards(cards, catalog)` vrací pole konkrétních chyb, například `cards[0].choices[1].outcomes.success.effects[0].id: neznámé ID bad`. `assertCards` při chybách vyhodí výjimku. `createContent` validuje a zmrazí kopii obsahu; engine tak nepřijme následně upravené definice. Build importuje obsah a při neplatných kartách selže před kopírováním výstupu.
