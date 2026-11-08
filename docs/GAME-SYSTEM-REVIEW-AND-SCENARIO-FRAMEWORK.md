# Když spí hlubiny — REVIZE PRAVIDEL A ROZŠIŘITELNÝ RÁMEC V1
> 2026-11-08 · Návrh architektury, nikoli implementace. Platí pro více scénářů; Blackwater je pilot. Žádný merge.

## 1. Audit existujícího stavu (ověřeno na feature/m4-blackwater-scenario-design)
- `src/engine/game.js`: `newState` round=1, ap=3, hp=6, san=8, threat=2, ritual=1, všechny lokace odemčené; `move` stojí 1 AP; `endRound` +1 ritual, limit round<7; konec hp=0, san=0, threat=10 nebo ritual=8.
- `evaluate`: 2d6 + atribut + modifier; 6+6 criticalSuccess, 1+1 criticalFailure, jinak margin >=3 greatSuccess, >=0 success, >=-2 partialSuccess, jinak failure. Šest výsledků už existuje.
- `resolve` atomicky provede hod, efekty, AP a zápis výsledku. Pro přehod je třeba nový dvoufázový stav; nelze pouze přidat tlačítko do UI.
- `src/engine/investigation.js`: důkazy, znalosti, podmínky, dedukce. `deduce` je explicitní bezplatná akce. Automatické dedukce požadované v návrhu deníku by byly změnou existujícího kontraktu; navrhnout bezpečný migrační postup.
- Balíčky jsou v každé lokaci v pevném pořadí, bezplatné dobrání; 14 M4 karet, dalších 16 pouze v návrhu. Karty jsou neopakovatelné, pokud není uvedeno jinak.
- Existující dokumenty mají kontinuitní rozpory: `bw-05-03 Strážce přílivu` je v outline postava/zjevení, v pozdějším návrhu mechanismus; `bw-04-03 Zvoníkova dcera` je někdy přímo duch, jindy imitace; `bw-06-04 Poslední zvon` někdy přímo finále, jindy jen příprava. Tyto rozpory vyřešit před produkcí.
- Současné 7 kol * 3 AP = 21 AP. Minimálně šest přesunů mezi sedmi lokacemi stojí 6 AP; zbývá 15 na karty/boj/akce. Rituál se přitom posouvá +1 za každé kolo, threshold 8. 30 karet nemůže být zamýšleno jako povinná sekvence.

## 2. Designové zásady
1. **Jedno jádro, různé scénáře**: engine nezná jména NPC, lokací ani Hlas pod přílivem.
2. **Komplexita rozhodnutí, ne ovládání**: maximálně 2–3 smysluplné možnosti v jednom okamžiku; volitelné vysvětlení detailů.
3. **Základní vyšetřování je fail-forward**: neúspěch může ztratit zdroj/čas/bezpečí, ale důležité vodítko má alternativu.
4. **Volitelné moduly**: každá nová mechanika musí mít jasné pravidlo, datové schéma, UI, save a test.
5. **Žádné skryté povinné hody**: vítězství nesmí záviset na jediném náhodném úspěchu.
6. **Příběh před statistikami**: efekt má mít konkrétní vyprávěný důvod; ne každá kritika automaticky snižuje rituál.
7. **Pravidla vysvětlovat až při prvním použití** (kontextové tooltipy, vždy dostupná kniha pravidel).
8. **Nekopírovat 30 povinných kroků**: volitelné karty, kratší průchody a opakovatelnost scénářů.

## 3. Jádro pravidel pro všechny scénáře
### A. Zkoušky a druhá šance
Zachovat 2d6 a šest výsledků. „Sebrat odvahu“: po prvním hodu, před efekty, zaplatit 1 SAN, max 1× na necombatovou zkoušku při SAN>=2; lepší **stupeň** výsledku platí, při shodě první. Po prvním hodu vidět jen stupeň, ne texty/následky. Vyhodnotit a zaplatit AP pouze jednou. Nový `pendingTest` v uloženém stavu; anti-reload exploit; atomické revize; případně zpřístupnit záměrně volitelný reroll jen na kartách. Balancovat podle rozdělení 2d6, ne předpokládat 50% úspěch.

### B. Příprava (jednoduchý bonus)
Některé karty nebo předměty dají `preparedBonus` pro jednu označenou další akci: doporučené +1 k hodu **nebo** zabránění 1 HP/SAN, nikoli oba. Při použití se spotřebuje, žádný stacking, maximum 1 připravený bonus. Příklad: sůl proti hlasu, lékařský obvaz, zajištěná cesta. Nepřidávat samostatnou novou měnu.

### C. Odpočinek a obnova
Jen bezpečné lokace či konkrétní karty, maximálně 1× na lokalitu/scénář dle konfigurace. Návrh: za 1 AP obnovit 1 HP **nebo** 1 SAN; žádné nekonečné léčení; může zvýšit časové riziko. Léčení nesmí zneplatnit napětí přehodů.

### D. NPC pomoc a důsledky
Jednoduché příznaky `ally` / `lost` a jednorázové asistence; žádná číselná reputace. NPC může zpřístupnit alternativní stopu, snížit cenu konkrétního přesunu nebo zmírnit epilog. Důležitá postava se musí dát obejít alternativní cestou.

### E. Boj a vyhnutí se boji
Zachovat existující taktický souboj a pozici. Přidat do scénářového schématu možnosti `fight / evade / negotiate / useEnvironment` jen tam, kde dávají smysl; nejvýše dvě současně viditelné neútočné varianty. Ne každé setkání musí být boj; nelze vynutit jediné zabití. Slabiny a zvláštní schopnosti nepřátel lze zavádět postupně.

### F. Vyšetřování a deník
Zachovat evidence/knowledge/deduction engine. Pro nové scénáře navrhnout automatické bezpečné vyhodnocení dedukcí **jako explicitní součást atomického herního přechodu**, nikoli jako render side effect. Stávající M2.2 explicitní `deduce` zachovat pro starší scénáře a migrace; feature flag `deductionMode: manual|automatic` v scénářové konfiguraci. Automatické dedukce mají být jednorázové, ne opakovaně farmitelné. Hráč vidí „Nové zjištění“, otázku a maximálně 1–2 vodítka k lokaci. Interní 3 knowledge paths nejsou UI checklist.

### G. Zakončení
Scénářové `endingId` a `endingConditions` oddělit od `isEnded`; podporovat victory, costlyVictory, sacrifice, defeat, modular epilogues. Vyhodnocení finále atomické, uložené, idempotentní, bez duplikace odměn. Ztráta HP/SAN je konec vyšetřovatele, ale nemusí znamenat jediný text „temnota zvítězila“; podle scénáře.

## 4. Zvláštní scénářové moduly (nespouštět všechny najednou)
| Modul | Jednoduché pravidlo pro hráče | Vhodný scénář | Náklady na vývoj |
|---|---|---|---|
| Hodiny hrozby / countdown | po určité události se posune jeden viditelný ukazatel | Blackwater: sedm úderů | nízké/střední |
| Karty událostí | na konci kola jedna krátká událost mění situaci | Blackwater: příliv a ozvěny | střední |
| Pronásledování | 3 kroky úniku před nepřítelem | další scénář: lov v lese | střední |
| Důvěra NPC | jediná volba mění pomoc konkrétní postavy | Blackwater: Voss, Thomas, Matěj | nízké |
| Proměnlivá mapa | 1–2 lokace se přepnou po milníku | scénář dům mimo čas | střední |
| Tajemství / prokletí | jedno scénářové omezení s jasnou cestou odstranění | scénář kultu | střední |
| Světlo / tma | jedna zásoba světla, ovlivňuje průzkum | scénář opuštěného dolu | střední |
| Podezření | jeden společný ukazatel reakcí obyvatel | městská detektivka | střední |
| Obětování zdroje | vědomá výměna SAN/HP/předmětu za bezpečnější postup | finále Blackwater | nízké |
| Vícefázový boss | fáze mění dostupné taktiky, ne ovládání | budoucí finále | vysoké |
| Kooperace 1–4 | sdílený příběh, střídání tahů, asistence | pozdější milník | velmi vysoké |

Každý scénář: společné jádro + **1 hlavní unikátní modul** + max 1 menší modul. Nepřidávat nový ukazatel, pokud stávající AP/HP/SAN/Threat/Ritual/flags stačí.

## 5. Blackwater: doporučená kombinace
- Hlavní unikát: **sedm úderů / odpočet přílivu** jako viditelný scénářový ukazatel, spojený s narativními milníky.
- Vedlejší: **ozvěny hlasů** (nabídka druhé šance či nebezpečné informace; SAN riziko), realizované kartami, nikoli další trvalou měnou.
- NPC důvěra jako jádrová volba, nikoli vlastní modul.
- Průzkum 7 lokací, cca 10–14 významných karet na jeden průchod, 30 v celkovém poolu pro alternativy a replay.
- Časový budget: pilotně 12 kol × 3 AP = 36 AP; 6–10 přesunů (6–10 AP), 10–14 karet (10–16 AP), souboje/odpočinek/příprava (4–8 AP), rezerva 2–4 AP. **Hypotéza k playtestu, nikoli finální balanc**.
- Rituál: současný +1/kolo a threshold 8 nelze kombinovat s 12 koly. Navrhnout konfigurovatelný `clock` s 7 milníky, postup podle kola, karet a událostí; nepřidávat současně další nejasný ukazatel. Hrozba = lokální bezprostřední nebezpečí; Rituál = globální časový tlak. Oba musí mít čitelný účinek a varování před koncem.
- Dvě znalosti umožní smysluplný závěr, třetí nejlepší; přesná podmínka a dostupnost konců se musí zapsat do dat. Nevyžadovat všechny 4 karty v lokaci.
- 1–2 globální události, ne povinná událost po každém kole, pokud to protahuje hru.
- Finále oddělit od karty `bw-06-04`: ta připravuje možnosti, závěrečné rozhodnutí je samostatná scénářová akce.

## 6. Rozpory v příběhu, které sjednotit
1. `bw-05-03 Strážce přílivu`: **vybrat zjevení původního strážce jako příběhovou kartu**, mechanismus patří do `bw-05-01` / `bw-05-04`. V pozdějším návrhu kapitoly VI je chybně popsán jako mechanický stroj.
2. `bw-04-03 Zvoníkova dcera`: zjevení je **imitace**, její informace mohou obsahovat pravdivé úryvky; nezaměňovat ji automaticky za první dětskou oběť ani za Dívku z přílivu.
3. `bw-06-04 Poslední zvon`: **příprava a odhalení**, nikoli automatické finále; explicitní akce po splnění podmínek.
4. Vossovo potlačování vzpomínek může oslabovat pečeť: dát hráči jasnou možnost jej přesvědčit nebo obejít.
5. Eleanor v prologu vs hratelná Eleanor v prototypu: **nutné rozhodnutí před implementací**; pro pilot zachovat současnou hratelnou Eleanor a prolog přepsat na zprávu od jiného NPC nebo změnit hratelnou postavu až v samostatném milníku. Nedělat tichou záměnu.

## 7. Návrh univerzálního scénářového kontraktu (ilustrační, ne současné schema)
```js
{
  id: "blackwater-bells",
  title: "Zvony pod přílivem",
  rules: { apPerRound: 3, maxRounds: 12, deductionMode: "automatic", reroll: { enabled: true, sanCost: 1, maxPerTest: 1 } },
  modules: ["scenario-clock", "conditional-events"],
  clocks: [{ id: "tide-bells", max: 7, label: "Údery zvonu", triggers: ["round-milestone", "scripted-event"] }],
  decks: ["location-0", "location-1", "location-2", "location-3", "location-4", "location-5", "location-6"],
  endings: ["quiet-sea", "broken-bell", "voice-price", "deep-answers"]
}
```
Poznámka: existující `ritual` a `threat` nelze přemapovat jen přejmenováním UI. Přidat obecný `scenarioState` a verzovanou migraci. Nejprve ověřit, zda lze část clocku implementovat nad stávajícím `ritual` bez duplikace stavu.

## 8. Roadmapa po malých milnících
P0: audit + pravidlový kontrakt + kontinuita; žádný runtime refactor bez testů.
P1: scénářová konfigurace, ending state, testy průchodnosti a rozpočet AP.
P2: dvoufázový reroll + save/reload + projekce + E2E.
P3: automatický deník volitelně pro nové scénáře + fallback dedukce.
P4: příprava, bezpečný odpočinek, NPC flags, rozšíření řešení konfliktu.
P5: Blackwater scénářový clock a 1–2 globální události.
P6: kompletní 30karetní obsah, ending epilogy, balanc 1000+ simulací, testy UX.
P7: nový scénář s **jednou** odlišnou hlavní mechanikou (např. pronásledování), bez duplikace enginu.

## 9. Akceptační kritéria
- Nový scénář lze vytvořit pouze daty a deklarovanými moduly, bez `if (scenarioId === ...)` v obecném enginu.
- Blackwater je dohratelný minimálně dvěma nezávislými cestami i po selhání jedné důležité zkoušky; každá postava má šanci.
- Vítězný konec není skrytý za jediným náhodným hodem; nejlepší konec je zasloužený.
- 60–90 minut cílová doba; ověřit měřením skutečných hráčů.
- Na obrazovce současně max 1 aktivní úkol, 2–3 volby; deník volitelný.
- Každý modul má vlastní testy validace, save/reload, determinismu a veřejné projekce.
- Legacy hra a uložené pozice se nezmění bez migrace a explicitního souhlasu.
- Nikdy neaplikovat důsledky hodu před možností přehodu.
