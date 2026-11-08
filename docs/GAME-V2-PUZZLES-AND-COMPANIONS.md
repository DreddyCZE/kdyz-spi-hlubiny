# Když spí hlubiny – Herní vize V2 a univerzální systém hádanek
> 2026-11-08 · Schválený návrhový směr, **nikoli implementace**. Samostatný designový podklad před dalším kódováním. Žádný merge.

## 1. Hranice základní hry
- **Jeden hlavní detektiv** na partii. Výběr postavy může měnit atributy, schopnosti a dialogy.
- **Nula nebo jeden pomocník** podle scénáře a příběhu. Může jít o člověka nebo zvíře (například psa). Pomocník nemá samostatné AP, plný inventář ani tahovou ekonomiku.
- Hlavní herní činnost: **vyšetřování, čtení příběhových karet, práce s důkazy, dedukce, hádanky a rozhodnutí**.
- Konflikty se řeší kartami a testy, včetně boje, útěku, vyjednávání a využití prostředí. **Taktická mřížka není v rozsahu V2.**
- Větvené scénáře s různými zakončeními; rozšířitelný engine a obsah oddělené od UI.
- Hádanky nesmí vyžadovat jediný úspěšný hod ani nevratně zablokovat hlavní příběhovou cestu.
- Finální balancing AP, DC, HP, SAN a času až po stabilizaci těchto systémů.

## 2. Univerzální kontrakt hádanky (návrh, nikoli aktuální schema)
Každá hádanka je definice v obsahu scénáře, ne vlastní JavaScript komponenta s herní logikou.

```js
{
  id: 'bw-puzzle-bells',
  version: 1,
  title: 'Pořadí tří zvonů',
  locationId: 'location-3',
  type: 'sequence', // sequence | matching | deduction | mechanism
  visibility: { all: [{ type: 'hasEvidence', id: 'reward-10' }] },
  clues: [
    { id: 'clue-eye', sourceEvidenceId: 'reward-10', text: 'Oko patří mrtvým.' },
    { id: 'clue-anchor', sourceEvidenceId: 'reward-11', text: 'Kotva svolává živé.' }
  ],
  interaction: {
    symbols: ['eye', 'anchor', 'wave'],
    answer: ['eye', 'anchor', 'wave']
  },
  attempts: { mode: 'unlimited', penaltyAfter: 1 },
  hints: [
    { id: 'hint-1', condition: { type: 'hasEvidence', id: 'reward-10' }, text: 'Začni symbolem mrtvých.', cost: null }
  ],
  onSolve: [{ type: 'setFlag', id: 'bell-order-solved', value: true }],
  onWrong: [{ type: 'modifyThreat', amount: 1 }],
  fallback: { type: 'alternatePath', id: 'bw-bell-alternative' }
}
```

**Pozor:** Identifikátory a příklad efektů jsou ilustrační. Konkrétní puzzle a jeho vazby na skutečné karty Blackwateru se musí ověřit vůči registrům. Nejde o změnu existujících dat.

### Typy V1
1. **sequence** – uspořádání symbolů, časové osy či kroků obřadu.
2. **matching** – spojení nápisů, svědků, předmětů a významů.
3. **deduction** – výběr podloženého závěru ze získaných indicií; nesmí být pouhé hádání bez důkazů.
4. **mechanism** – několik diskrétních stavů přístroje či zámku, řešení odvoditelné z příběhu.

Neimplementovat hned volné textové odpovědi: problémy s diakritikou, synonymy, překladem a falešným odmítnutím správného řešení. Později lze přidat s explicitními aliasy.

## 3. Pravidla interakce
- Zobrazení hádanky je projekce: hráč uvidí jen indicie, které skutečně získal.
- Odeslání pokusu nese `puzzleId`, `answer` a očekávanou `revision`; validace a efekt jsou **jeden atomický přechod**.
- Správné řešení se zaznamená jednou. Opakované odeslání ani reload nesmí znovu udělit odměnu.
- Chybný pokus může mít příběhovou cenu, ale její rozsah je předem srozumitelný; nikdy nekonečné farmení ani nekonečný trest.
- Hádanky mohou mít neomezené pokusy bez trestu, omezený počet pokusů, nebo eskalující následek s horní hranicí.
- Zobrazené texty následků před pokusem nesmí prozradit tajemství. Technické řešení nesmí posílat správnou odpověď do veřejné projekce; u čistě klientské hry ovšem nelze zabránit zjištění odpovědi z distribuovaných souborů – jde o ochranu proti běžným spoilerům v UI, nikoli kryptografické utajení.
- Pomocník může zpřístupnit konkrétní indicii, snížit cenu nápovědy nebo nabídnout alternativní postup; **nikdy automaticky nevyřeší hlavní hádanku**.
- Hody kostkou mohou získat nápovědu či zdroj, ne automaticky nahradit dedukci hráče.
- Při chybějících důkazech musí být viditelné, že hráč nemá dost podkladů, a deník jej může nasměrovat na relevantní lokaci bez prozrazení odpovědi.
- Každá kritická hádanka musí mít alternativní průchod (dražší, riskantnější, jiný konec) nebo možnost vrátit se pro indicie.

## 4. Stav a engine
Oddělit:
- **Definice** v `src/data/` (typ, indicie, řešení, podmínky, efekty, alternativy).
- **Stav** v `scenario.puzzles[puzzleId]`: `status`, `attempts`, `hintIds`, `solvedAtRound` a případně `mechanismState`.
- **Čisté funkce** v `src/engine/`: validace definic, projekce viditelného zadání, kontrola pokusu, aplikace následků.
- **UI** v `src/ui/`: obecné renderery typů, přístupnost, klávesnice, mobil, vizuální zpětná vazba.

Integrace do `scenarioSessionTransition` musí používat existující revize a pravidla atomických akcí; nový formát save vyžaduje verzování a migrační strategii. Legacy `game.js` neměnit vedlejším efektem.

## 5. Blackwater – tři pilotní hádanky (pracovní náměty)
| ID / námět | Typ | Indicie | Pomocník | Alternativa |
|---|---|---|---|---|
| Pořadí zvonů | sequence | Archiv, přístav, hřbitov | Archivář rozpozná starý znak | Zvon lze poškodit za cenu hrozby a horšího zakončení |
| Chybějící jméno v matrice | deduction / matching | Nesoulad dat, fotografie, svědectví | Pes může nalézt ukrytou schránku, ne přečíst matriku | Přímé pátrání v terénu s rizikem SAN |
| Majákový signál | mechanism | Rytmus, světlo, lodní deník | Technicky zdatný pomocník nabídne indicii | Vypnutí zdroje signálu se ztrátou jiné příležitosti |

Konkrétní důkazy, umístění, následky a zakončení je třeba sladit s `src/data/investigation.js`, Blackwater story bible a aktuálními konci. Nezavádět skryté povinné znalosti navíc.

## 6. Pomocníci – malý společný kontrakt
```js
{
  id: 'companion-dog',
  kind: 'animal',
  name: 'Pes',
  availability: { /* scénářové podmínky */ },
  abilities: [{ id: 'scent', trigger: 'exploration', uses: 'oncePerRound' }],
  reactions: [{ /* událost -> příběhový text nebo flag */ }]
}
```
- Pomocník má maximálně jednu aktivní a případně jednu pasivní schopnost; použití je jednoznačně omezené.
- Pes stopuje, varuje a reaguje na pachy či nebezpečí, ale nepřekládá texty ani neřeší symbolické hádanky.
- Lidský pomocník může radit, vyjednávat nebo rozpoznat odborné informace, ale má vlastní motivaci a může odejít.
- Získání, odchod nebo ztráta pomocníka musí být scénářová událost, nikoli globální povinnost.
- Pro scénáře bez pomocníka musí být hlavní cesta stále průchodná.

## 7. Aktualizovaná roadmapa (bez finálního balancingu)
1. **D0 – Architektonické rozhodnutí a design**: tento dokument; vyjasnit vazby na existující scenario engine, registry a Blackwater obsah.
2. **D1 – Puzzle engine**: validace, stav, čtyři typy, atomické řešení, nápovědy, alternativy, save, regresní testy.
3. **D2 – Puzzle UI**: jednotný dialog, čitelné indicie, přístupnost, mobilní interakce, ochrana proti spoilerům v běžném UI.
4. **D3 – Pomocníci**: volitelná entita, scénářové podmínky, schopnosti, příběhové reakce, žádné samostatné AP.
5. **D4 – Konflikty na kartách**: boj/únik/vyjednávání/prostředí bez taktické mřížky; vyřazení a návrat do hry.
6. **D5 – Blackwater obsah**: tři pilotní hádanky, návazné karty, alternativní cesty, epilogy a testování narativní kontinuity.
7. **D6 – Hratelnost a UX**: výběr detektiva, prolog, deník, inventář, pravidla, onboarding, E2E a mobil.
8. **D7 – Balancing a playtest**: teprve pak DC, AP, SAN/HP, počet kol, obtížnost hádanek a dostupnost zakončení.
9. **D8 – Rozšíření**: další scénáře, volitelná kampaň a přenos následků; žádný online multiplayer v základní verzi.

## 8. Akceptační kritéria prvního puzzle milníku
- Každý ze čtyř typů má validní definici a nejméně jeden test.
- Stejný pokus se stejnou revizí nikdy nepřidá efekt dvakrát.
- Save/reload zachová vyřešení, pokusy, nápovědy a rozpracovaný mechanismus.
- Bez potřebné indicie UI neodhalí její text ani správné řešení.
- Alternativní cesta neblokuje žádný ze čtyř konců neúmyslně.
- Funguje klávesnice a mobilní ovládání; žádná hádanka nespoléhá jen na drag-and-drop.
- Existující scenario/legacy testy a build projdou.

## 9. Výslovně mimo rozsah
Skupina 1–4 plnohodnotných detektivů, samostatná taktická bojová mapa, komplexní crafting, zkušenostní strom, multiplayer a procedurální mapa. Jejich případné zavedení vyžaduje nové návrhové rozhodnutí.
