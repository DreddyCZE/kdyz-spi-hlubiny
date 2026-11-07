# Důkazy, znalosti a dedukce – M2.2

Definice patří do `src/data/`. [Blackwater](../src/data/investigation.js) je jen výchozí testovací obsah. [Obecný modul](../src/engine/investigation.js) neimportuje scénář, UI, úložiště ani náhodu. [Testovací fixture](../tests/investigation.test.js) používá jiná ID a stejné algoritmy.

## Registry informací

Důkaz i znalost mají `id`, `name` (český název), `description`, `type` a `tags`. Volitelné jsou `source` (textový popis původu) a `metadata` (prostý JSON objekt, bez funkcí a cyklů). Typ a štítky jsou obsahové řetězce, engine jim nepřisuzuje pravidla.

```js
{ id: 'archive-note', name: 'Zápis z archivu', description: 'Zachovaný záznam.',
  type: 'document', tags: ['archive'], source: 'Archiv', metadata: { edition: 1 } }
```

ID jsou stabilní a unikátní v rámci každého registru, formát `[a-z0-9][a-z0-9-]*`. Změna pořadí nebo textu nesmí změnit ID. Důkaz je získaná informace; znalost je odvozený závěr. Fyzické předměty zůstávají v `inventory`, informace v `evidence`, závěry v `knowledge`.

Složené odměny dál používají `evidenceIds` z registru předmětů. Získání předmětu zapíše jeho informace do `evidence`; pozdější odebrání předmětu je nevymaže. V3 tuto informaci materializuje i při migraci starších uložených her. Inventární souhrn nevypisuje informaci dvakrát, pokud je stále součástí neseného předmětu; deník ji ukazuje samostatně. Toto je výslovná změna oproti M2.1, kde byl důkaz odvozen jen po dobu vlastnictví předmětu.

## Dedukce

Dedukce má `id`, `name`, `description`, povinné boolean `repeatable`, jeden strom `conditions` a neprázdné pole `effects`. Není herní kartou ani hodem kostkami.

```js
{
  id: 'find-route', name: 'Společná cesta', description: 'Dva zdroje potvrzují trasu.',
  repeatable: false,
  conditions: { type: 'any', conditions: [
    { type: 'all', conditions: [
      { type: 'hasEvidence', id: 'diary' }, { type: 'hasEvidence', id: 'witness' }
    ] },
    { type: 'all', conditions: [
      { type: 'hasEvidence', id: 'diary' }, { type: 'hasEvidence', id: 'note-copy' }
    ] }
  ] },
  effects: [{ type: 'addKnowledge', id: 'known-route' }]
}
```

Příklad je schematický: všechna odkazovaná ID musejí být v registrech. Dvě alternativy současně znamenají jedno vyhodnocení, nikoli dvě odměny.

### Podmínky

| Typ | Pole | Význam |
| --- | --- | --- |
| `all` | `conditions` | Všechny podmínky platí |
| `any` | `conditions` | Alespoň jedna platí |
| `not` | `condition` | Negace jedné podmínky |
| `hasEvidence` | `id` | Známý důkaz včetně obsahu složené odměny |
| `hasKnowledge` | `id` | Známý odvozený závěr |
| `deductionCompleted` | `id` | Dedukce byla alespoň jednou provedena |
| `flagEquals` | `id`, `value` | Existující příznak přesně odpovídá skalární hodnotě |
| `cardUnlocked` | `id` | Karta byla explicitně odemčena |
| `choiceUnlocked` | `id` | Volba byla explicitně odemčena |

Zůstávají také `hasItem`, `locationUnlocked`, `minRound`, `maxRound` z [karetního schématu](CARD_SCHEMA.md). Stromy lze vkládat i do dosavadního pole podmínek karty/volby (vnější pole je AND). `all`/`any` musí být neprázdné; hloubka je maximálně 32 a velikost stromu 1000 uzlů. Chybějící příznak není `false`.

### Efekty dedukcí

| Typ | Pole | Zápis do stavu |
| --- | --- | --- |
| `addKnowledge` | `id` | `knowledge` |
| `unlockChoice` | `id` | `unlockedChoices` |
| `unlockLocation` | `id` | `unlockedLocations` |
| `unlockCard` | `id` | `unlockedCards` |
| `setFlag` | `id`, `value` | `flags` |

Dedukce záměrně nemění HP, SAN, AP, kola, Hrozbu ani Rituál. Změna těchto pravidel není součástí M2.2. Znalosti a odemčení jsou unikátní sbírky, příznak se nastavuje na danou hodnotu. Karetní efekty nově podporují i `addKnowledge`, `unlockChoice` a `unlockCard`.

Odemčená karta/volba používá odpovídající podmínku `cardUnlocked`/`choiceUnlocked`; odemčení nezruší její ostatní podmínky. Explicitně odemčená, dosud nevyřešená karta zůstane dostupná i tehdy, když ji kurzor dříve přeskočil. Její vyřešení neposune kurzor zpět a neobnoví odměny ostatních karet.

## Validace a cykly

`validateInvestigation(definitions, refs, itemEvidence)` vrací konkrétní cesty chyb. `createInvestigation` odmítne chyby, vytvoří kopii a hluboce ji zmrazí. `refs` dodává ID předmětů, lokací, karet, voleb a příznaků hostitelského scénáře. Evidence, znalosti a dedukce se ověřují podle jejich definic. Kontrolují se duplicity ID, neznámá pole/operace, chybné odkazy, složené odměny i cykly v samotném stromu/JSON metadatech.

Graf závislostí má hrany od dedukce ke všem dedukcím, které mohou vytvořit její vstupy (znalost, příznak, odemčení nebo dokončení jiné dedukce). Zkoumá všechny větve `any` i `not`, bez ohledu na okamžitou splnitelnost. Odmítá i sebeodkaz a cyklus s alternativní cestou: jde o konzervativní validaci, nikoli řešič logických formulí. Podmínka čtoucí příznak a efekt téže dedukce zapisující tentýž příznak je také odmítnuta. Kladné i záporné vstupy jinak fungují. Karetní akce se nesimulují jako automatické závislosti dedukcí.

## Minimální Blackwater příklad

Tři stávající důkazy: `reward-2` (Deník), `reward-5` (Svědectví rybáře), `harbor-note-copy` (Opis poznámky). Cesty jsou `(Deník AND Svědectví)` nebo `(Deník AND Opis)`. Dedukce `blackwater-follow-the-route` odemkne jedinou znalost `blackwater-lighthouse-connection`. Nepřidává karty, neuzamyká původní lokace ani nemění tempo hry. Další registry pouze doplňují metadata všech dosavadních důkazů.
