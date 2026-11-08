# Bezpečné vydání Blackwateru

Výchozí ověřená větev: M4 `5625c7bba72c2a03ea1c65318c7028a88043d083`. Tato oprava nemění pravidla ani nepřevádí historii mezi různými enginy.

## Pages: jeden vlastník publikace

`pages.yml` je jediný workflow s `deploy-pages`. Pouští testy a volá `blackwater-preview.yml`, který je nyní pouze reusable builder (`workflow_call`); nemá vlastní push/dispatch ani deploy. Celý běh včetně sestavení a deploye drží skupinu `github-pages`, bez přerušování rozběhnutého deploye.

Builder pod zámkem znovu načte současné tipy `main` a M4 a uloží jejich přesná SHA. Testuje a sestavuje tyto konkrétní revize, nikoli pohyblivé názvy větví během buildu. Je-li M4 již předkem main (také při shodě), použije main i jako preview; nehrozí návrat preview na starší vydání po produkčním merge. Při samostatném vývoji M4 zůstává root z main a preview z M4.

Stejná čistá funkce `assemblePages` balí lokální i CI artefakt. Zachovává:

- `/index.html` a relativní zdroje kořenového buildu;
- `/preview/index.html` a `/preview/blackwater.html` i všechny jejich zdroje;
- `.nojekyll` a `pages-build.json` s oběma SHA, bez časového razítka;
- prázdný výstup a ploché vstupy: odmítá rekurzivní `preview/preview/` a výstup uvnitř vstupu.

Lokálně: `npm run build`, potom `npm run build:pages`. Výsledkem je ignorovaný adresář `site/`. CLI dovoluje zadat dva již hotové buildy a jejich SHA pro reprodukci kombinovaného nasazení. Mazání je omezené na pevný adresář `site/` tohoto repozitáře.

### Hranice ověření a zavedení

PR běhy skutečně sestaví a servírují výsledný artefakt a testují obě preview URL i relativní zdroje. Samotný produkční `deploy-pages` se v PR nikdy nespouští. Tuto opravu nelze ověřit živým produkčním nasazením bez pozdějšího schváleného merge.

**Přechodné omezení:** dokud stará kopie workflow zůstává na main, push do main může stále spustit starý publisher. Opravná větev nemůže změnit workflow jiné větve. Při zavedení je nutné koordinovat změny main/M4, nemít rozběhnuté staré deploye a na obou používat jediný nový publisher. Není potřeba přepínat Pages environment ani mazat větve. Nový workflow už žádný konkurenční publisher neobsahuje. Po schváleném zavedení zkontrolovat živý `pages-build.json`, kořen a obě preview adresy.

## Uložené hry: kompatibilita

| Formát | Stav kompatibility | Nabídnutý postup | Automatická migrace do scénáře |
| --- | --- | --- | --- |
| `hlubiny-v4` | Původní engine a jeho obsah | `index.html?mode=legacy`, 7 kol, původní rituál a ruční dedukce | Ne; odlišná pravidla, stav i průběh |
| `hlubiny-v1` až `hlubiny-v3` | Stávající validované migrátory legacy enginu | Původní režim načte stávajícím migrátorem; vstupní starý klíč zůstává zachovaný | Ne; pouze existující převod do legacy v4 |
| `ksh-blackwater-v1` | Ilustrovaný Blackwater včetně vyšetřovatele, mýtu a boje | `blackwater.html`, původní runtime | Ne; jiný inventář, karty a pravidla |
| `hlubiny-scenario-v1-blackwater-bells` | Nový scénářový engine | `index.html`, zachování D1–D3 a 12 kol | Není potřeba; kontrola schématu a scénáře |
| Poškozený / neznámý formát v některém klíči | Nenačítá se jako platná hra | Upozornění, hra pouze v paměti v postiženém režimu, zápis i odstranění klíče blokované | Nikdy |

Původní režim sdílí DOM/UI renderer, ale volá výhradně původní veřejné akce a storage. Nevzniká kopie enginu ani převod AP/kol/karet. Začátek nového scénáře uloží pouze nový klíč; pokračování původní hry mění pouze její vlastní klíč. Reset je nadále výslovně potvrzená akce v daném režimu; nedotýká se cizích klíčů. Poškozený klíč neodstraní ani reset.

Read-only detekce proběhne před načtením; nevytváří ani neopravuje save při otevření stránky. Ochrana před každým zápisem znovu kontroluje obsah původního klíče i formát zapisovaných dat. Změna na poškozená data v jiné záložce tak není následným zápisem přepsána. Není přidán žádný import, export, ztrátová ani částečná migrace.

Ilustrovaný loader měl jen několik strukturálních kontrol. Nyní ověřuje celý vnitřní game stav (s odlišnými limity vyšetřovatelů/AP a inventářem), mýtus, známá monstra a souboj. Neznámý nebo neplatný záznam zůstane chráněn. Klientská validace nepotvrzuje kryptograficky historii hraní.

## Origin a další omezení

Kořen a `/preview/` na stejném protokolu, hostiteli a portu používají stejné localStorage. Přesun mezi těmito cestami proto není migrace. Localhost, jiné porty, domény, profily, anonymní okna a `file:` mohou mít jiná nebo nedostupná úložiště. Bez původního originu nelze tato data automaticky přečíst; hráč je nasměrován na původní adresu/profil. Automatický přenos mezi originy není implementován ani slibován.

Při zablokovaném úložišti běží hra pouze v paměti a UI to sděluje. Bezpečné ruční obnovení poškozených dat nebo přenos ze zaniklého originu nejsou touto opravou řešeny. Změna herního modelu potřebná pro úplný převod historie mezi enginy by byla samostatný designový úkol.

## Co ověřují testy

- Matice čistého profilu, jednotlivých tří formátů a jejich souběhu; detekce bez zápisu.
- Správný formát/namespace, neplatný JSON, neznámé struktury, nedostupné storage a poškození mezi čtením a zápisem.
- Pokračování v legacy i ilustrovaném režimu, zachování cizích klíčů, reload a sdílení root/preview originu.
- Poškozené saves přežijí hraní, potvrzený reset a reload beze změny.
- Artefakt s rozdílnými i shodnými buildy, odmítnutí rekurze, stabilní manifest a jediný deploy owner.
- Chromium načte hlavní stránku i obě preview stránky přímo z `site/` bez JS chyb a chyb HTTP; stávající sada ověřuje také všechny rastrové ilustrace.

Manuálně po zavedení: první skutečný deploy a chování GitHub concurrency při rychlém pushi do obou větví; skutečné historické uživatelské pozice; více profilů/prohlížečů a původních originů; ergonomie upozornění na mobilu. Automatické fixture testy nenahrazují dostupnost dat na cizím nebo zaniklém originu.

Při souběhu několika historických legacy klíčů platí původní priorita v4 → v3 → v2 → v1. UI neoznačuje zastíněnou zálohu jako přímo načitatelnou. Neplatný novější záznam se nepřeskakuje ani nenahrazuje starší zálohou; případná ruční obnova vyžaduje samostatný bezpečný postup.

## Výsledky ověření opravné větve

- 187/187 unit a integračních testů (původně 166; přidáno 21 testů a variant).
- Kompletní Chromium sada 72/72 (původně 57; přidáno 15 scénářů bezpečného vydání). Po závěrečném zpřesnění legacy obsahu a validace byly všechny nové UI scénáře znovu ověřeny: 15/15.
- Produkční build a sestavení `site/` proběhly úspěšně také jako součást E2E serveru; kontrola `git diff --check` bez chyb.
- Mobilní kontrola při 390 px: nalezené uložené hry a odkazy jsou čitelné, bez vodorovného přetečení. Oddělený limit kol a označení hodin nyní odpovídají zvolenému režimu.
- Finální CI na HEAD opravného PR je zaznamenané v jeho popisu; žádný PR ani produkční deploy touto prací nebyl sloučen/spuštěn.
