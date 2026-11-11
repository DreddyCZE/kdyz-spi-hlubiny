# Blackwater V3 — UX a kontrola vydání

Výchozí stav: PR #23, `c8c0f963b955a4718e91dbac1e93859979d1700d`. Vzdálená větev při zahájení odpovídala tomuto SHA a obě CI workflow byla úspěšná. Předchozí rozpracovaná obsahová větev byla zachována; tato práce probíhá v samostatném worktree na větvi PR #23.

## Zjištění a provedené opravy

| Oblast | Předchozí V3 | Výsledná úprava |
| --- | --- | --- |
| Orientace | Velký mobilní profil pod mapou, opakované statistiky a zkratky | Kompaktní portrét se skutečnými limity HP/SAN, jediná sada statistik, přehledné kontextové akce |
| Výběr postavy | Textové volby v úzkém postranním panelu | Tři ilustrované karty; na mobilu čitelné svislé volby před mapou |
| Mapa | Rozlišuje aktuální a zamčené místo | Zachované skutečné body a lokace; navíc označení míst, kde už byla dobrána karta, podle uložených `drawnCards`/`cursors` |
| Průzkum | Balíček a výbava vytlačují vlastní příběh a volby | Výrazná ilustrace, text a rozhodnutí v jednom čtecím pořadí; výbava v inventáři; hod před přehledem možných výsledků |
| Výsledek | Oznámení se mohlo ztratit pod obsahem | Kontrastní odhalení, posun k výsledku, veřejné změny HP/SAN/AP/hrozby/důkazů/znalostí |
| Schopnost | Zkratka otevřela profil bez ovládání schopnosti | Skutečný prvek schopnosti je v profilu, včetně pasivní vlastnosti a použitého stavu |
| Souboj | Stav a kostky se parsovaly z vět, dokončení se opakovalo | Veřejná projekce souboje se stabilním ID nepřítele, skutečnými kostkami a HP; jediný závěrečný přehled |
| Inventář | ID předmětů se hádala z prefixů českých názvů | Stabilní ID z veřejně vyrenderovaných prvků, skutečné akce enginu a návrat fokusu po spotřebování |
| Konec hry | Závěr mohl zůstat v zavřené kartě, souboj jej mohl překrýt | Automatické otevření dosaženého epilogu, přednost před bojem a přechodem kola, kontrola reloadu a uzamčených akcí |
| Klávesnice | Přesun mířil fokusem do zavřeného dialogu | Fokus na viditelném názvu lokace, návrat na skutečné otevírací tlačítko, zachování fokusu ovládání hádanky |
| Údržba CSS | Přes 800 řádků postupných přepisů | Vstupní stylesheet s rozdělením podle pěti herních ploch; sjednocená pravidla mapy a příběhu |

Označení „prozkoumaná“ znamená dobranou kartu, nikoli každý historický průchod místem. Původní save historii všech přesunů samostatně neuchovává; nové herní pole kvůli prezentaci nevzniklo.

## Srovnání s původním ilustrovaným režimem

Chromium zachycuje skutečný výběr postavy, mapu a kartu v [původním režimu](../blackwater.html). Jeho silnou stránkou jsou velké portréty při výběru, bezprostřední návaznost ilustrace na příběh a oddělené odhalení následku. V3 tyto principy používá ve vlastním profilu, kartě a výsledku; zachovává dominantní mapu a úplný scénář s hádankami a dedukcemi. Souboj používá vlastní původní živé ovládání enginu přesunuté do ilustrovaného dialogu. Žádný obsah ani pravidla původního režimu se nepřenášejí.

Základní průzkum stále tvoří otevření karty, dobrání, výběr postupu, hod a přijetí výsledku. Potvrzení hodu zůstává záměrné kvůli přehodu a uložení nepotvrzených kostek. Odstraněno je hledání výbavy a schopnosti mezi příběhovými ovladači; mapa nabízí jedno ukončení kola. Prohlížení složky nezapisuje herní save.

## Automatizované ověření a screenshoty

- [Snímková sada](../e2e/v3-release.spec.js): 1920 × 1080, 1440 × 900, 1280 × 720, 390 × 844, 320 × 700. Výběr, rozehraná mapa, karta, kostky, výsledek, souboj před/po útoku, inventář, deník a nové kolo. Kontrola horizontálního přetečení stránky i otevřených dialogů a chyb JavaScriptu. Vizuální kontrola 320px souboje odhalila přetékající dlouhé tlačítko záhlaví; oprava nastavuje skutečnou maximální šířku dialogu a dovoluje zalomení záhlaví.
- [Úplné V3 průchody](../e2e/v3-journey.spec.js): všechny tři postavy × tři vítězná zakončení, získávání skutečných důkazů a znalostí, chybná i správná odpověď hádanky, reload rozpracovaných řešení, cena AP a uzamčení zakončené hry. Sdílená cesta také nadále testuje hlavní scénář bez V3.
- Samostatné regrese pro vypršení času, smrt na HP/SAN v probíhajícím souboji, tři placené alternativy hádanek, bezplatný přehod okultistky, ochranu námořníka a jeho léčení, aktivní schopnost detektiva, spotřebování výbavy a návrat fokusu.
- Původní testy zachovávají pokrytí starších režimů, chráněných/poškozených save, neveřejných následků, podadresáře Pages a reduced motion. Testy nejsou vypnuté a finální běh nepoužívá opakování.

Screenshoty jsou skutečné PNG z Chromia v artefaktu `blackwater-v3-screenshots`, názvy `blackwater-v3-{šířka}-{obrazovka}.png`; konce mají samostatné snímky `blackwater-v3-ending-*`, porážky `blackwater-v3-*-defeat.png`. Animace se při samotném fotografování dokončí, aby snímek nezachycoval přechodnou průhlednost. Chování hodu se ověřuje před snímkem.

## Rozsah a zbývající limity

Lokální úplný běh: **256/256 unit testů, 130/130 Chromium E2E** (7 minut), bez přeskočených testů a bez opakování. Poslední mobilní kompozici navíc ověřuje samostatné opakování 16 testů rozhraní a snímkové sady. Stav vzdálených kontrol a odkazy na konkrétní vydaný artefakt patří do aktuálního popisu PR, aby tento dokument nezaměňoval staré a nové SHA.

Engine, scénářová data, verze save a referenční prototypy zůstávají zachované. Nová UI data jsou odvozená z veřejné projekce nebo dosaženého výsledku; zpětná vazba a fokus se do save nezapisují. Žádné nové knihovny.

Na úzkém mobilu zůstává ilustrace mapy s přístupným seznamem sedmi lokací; absolutní drobné popisky by se překrývaly a zhoršily dotykové ovládání. Spotřební předměty nelze podle stávajících pravidel použít během aktivního souboje; UI to popisuje a neobchází. Časová schopnost okultistky nemění pevný limit dvanácti kol. Tyto skutečnosti se nepřevádějí na nové mechaniky.

Některé starší složené nálezy nemají vlastní ilustraci; inventář je označuje skutečným názvem a neutrálním symbolem. Použitelná výbava má skutečné existující ilustrace. Doplnění ilustrací těchto nálezů zůstává drobným vizuálním nedostatkem.

Automatický průchod a vizuální kontrola nejsou lidský test zábavnosti, délky partie ani audit čtečkou obrazovky. Před nahrazením výchozího UI doporučujeme uživatelský playtest celého scénáře. PR zůstává Draft, bez merge a bez změny produkčního Pages publisheru. Hratelný ZIP slouží k tomuto ověření; spuštění popisuje [playtest](BLACKWATER-V3-PLAYTEST.md).
