# Zvony pod přílivem — 30 příběhových karet a sedm kapitol
> AUTORSKÝ NÁVRH v1 · 2026-11-08 · spoilery · bez implementace. Navazuje na `BLACKWATER-STORY-BIBLE.md` a `M5-NARRATIVE-ONBOARDING-DESIGN.md`.
>
> **Kontinuita:** V runtime už existuje 14 karet (ID `bw-00-01` až `bw-06-02`, dvě na lokaci). Jejich názvy níže odpovídají skutečným souborům, nepřepisovat historická ID ani názvy bez výslovného rozhodnutí. Nových je 14 karet `-03/-04` a dvě globální události `bw-event-01/-02` (celkem 30). Nové texty a důsledky jsou design, nikoli tvrzení o současném stavu.

## Dramaturgie a tempo
- **Akt I – Město mlčí (kola 1–2):** přístav, ulice, archiv; hráč chápe, že loď a zvon spolu souvisejí.
- **Akt II – Paměť a přísaha (kola 3–4):** ústav, hřbitov, maják; důkazy ukazují na rok 1883 a úmyslné utajení.
- **Akt III – Co odpovídá z hlubin (kola 5–6):** jeskyně, mechanismus majáku, vyhodnocení znalostí.
- **Akt IV – Sedmý úder (nejpozději kolo 7):** finále se dvěma ze tří znalostí, s volitelnou třetí; žádný jediný hod nesmí být povinný.
- Příběhové pořadí není pevná trasa. Lokace a karty se odemykají podle informací; hráč může vyšetřovat jiným pořadím.
- **Varování pro implementaci:** nynější runtime ukončuje hru při rituálu ≥8, hrozbě ≥10 nebo HP/SAN 0; pevná posloupnost mýtu a 7 kol mohou vytvářet předčasné prohry. Nejdříve spočítat dosažitelnost a případně upravit design; neslibovat 60–90 minut bez playtestu.

## Kapitola I: Přístav (location-0)
**Atmosféra:** lana těžká solí, lampy blikající i bez větru, plovoucí rybí šupiny na černé vodě. První kontakt s Milostí. **Otázka:** Kdo vrátil loď a co se stalo posádce? **NPC:** rybář Matěj Kříž, celník Josef Mareš. **Odemkne:** Ústav (hlas), Jeskyně (tělo), maják jako směr pátrání.

### bw-00-01 — Zvon v mlze [EXISTUJE]
Úvodní scéna: od moře přijde úder; rybáři se obracejí k hladině, v níž se zrcadlí neexistující zvonice. **A Zachytit rytmus:** stopa `clue-bell-pattern`; úspěch = úplný rytmus, částečný = rytmus a -1 SAN, selhání = vodítko na pacienta č. 9. **B Varovat rybáře:** získání důvěry `flag-fisher-helped`; rybář později ukáže bezpečnou cestu. Nepovinná vedlejší volba s dlouhodobým dopadem.

### bw-00-02 — Přílivový zvon [EXISTUJE]
Z podpalubí Milosti přichází pravidelné klepání; zvuk pokračuje i poté, co loď opustí vlny. **A Prohlédnout palubu:** `clue-wet-footprints`, ukazuje k první oběti. **B Poslouchat podpalubí:** `clue-ship-log` nebo stopa do archivu; cena SAN při částečném úspěchu. **Pozn.:** delší flavor rozšířit, ale zachovat současné ID.

### bw-00-03 — Celníkova kniha [NOVÁ]
Celník Mareš má záznam o příjezdu Milosti o hodinu dříve, než loď vplula do přístavu. V kolonce posádka je jediný podpis, napsaný různými rukopisy. **A Porovnat lodní manifesty:** `clue-reed-voyage` a spojení na rok 1883. **B Vyslechnout celníka:** `flag-customs-trust`; při nátlaku zvýšení Hrozby. **Náhradní stopa:** atlas utopených v archivu.

### bw-00-04 — Rybář bez stínu [NOVÁ]
Matěj Kříž stojí na molu zády k moři. Když ho oslovíš, jeho stín zůstane sedět na bedně sítě. Přizná, že odpověděl hlasu své matky. **A Pomoci mu přerušit ozvěnu:** záchrana NPC, později bezpečná trasa do jeskyní. **B Přinutit jej popsat hlas:** rychlá stopa `clue-voice-imitation`, ale ztráta důvěry. **Náhradní stopa:** pacient č. 9.

## Kapitola II: Opuštěná ulice (location-1)
**Atmosféra:** zazděná okna, solné čáry, plynové lampy bez stínů. **Otázka:** Před čím se lidé chránili? **NPC:** stará švadlena Anna Havelová (pamětnice rodových příběhů). **Odemkne:** Archiv, Hřbitov.

### bw-01-01 — Dům se solí [EXISTUJE]
Prahy vysypané solí, za zdí schodiště pod domy. **A Studovat značky:** `clue-tunnel-plan`. **B Prozkoumat zazděný vstup:** přístup k alternativní trase; zranění při neúspěchu. **Dlouhodobě:** sůl může chránit proti hlasu, nikoli proti fyzickému zvonu.

### bw-01-02 — Žena bez stínu [EXISTUJE]
Žena v černém drží telegram datovaný zítřkem. Její stín se pohybuje proti světlu. **A Přečíst telegram:** `clue-missing-names`. **B Sledovat stín:** průchod k archivu. **Odhalení:** nejde o předpověď, ale o vzpomínku, kterou bytost umístila do nesprávného času.

### bw-01-03 — Dětská kresba [NOVÁ]
Za prkny výlohy visí obrázek sedmi černých kruhů nad městem. Na posledním je namalovaná otevřená ústa. **A Promluvit s Annou:** `clue-seven-strikes`, bez nutného hodu za důvěru. **B Prohlédnout zadní stranu:** `clue-first-child`, ale možnost slyšet vlastní hlas ze zdi. **Náhradní stopa:** hřbitovní záznam.

### bw-01-04 — Podzemní schodiště [NOVÁ]
Pod dlažbou je schodiště, jehož stupně jsou mokré i za odlivu. Na stěně jsou čtyři iniciály zakladatelů. **A Zmapovat průchod:** `flag-safe-tunnel`, levnější nebo bezpečnější přesun po ověření mapy. **B Sestoupit ihned:** rychlý přístup k jeskyním za cenu Hrozby. **Náhradní stopa:** mapa z přístavu/archivu.

## Kapitola III: Archiv (location-2)
**Atmosféra:** kyselý pach starého papíru, škrábání pera bez písaře, knihy těžké od mořské soli. **Otázka:** Kdo vymazal rok 1883? **NPC:** archivářka Miriam Valeová. **Odemkne:** Hřbitov, Maják.

### bw-02-01 — Vymazaná stránka [EXISTUJE]
Z matriky chybí seznam obětí; otisk inkoustu zůstal na dalším listu. **A Obnovit otisk:** `clue-founders-oath`. **B Porovnat mapu majáku:** `clue-lighthouse-plan`. **Volba:** zveřejnění důkazů může zvýšit důvěru obyvatel, ale upozornit Vosse.

### bw-02-02 — Atlas utopených [EXISTUJE]
Mapa pobřeží se sama překresluje; nová místa nesou jména zmizelých. **A Porovnat mapy:** `clue-cave-location`. **B Zastavit inkoust:** `clue-bell-source`, částečný úspěch za cenu SAN. **Odhalení:** atlas ukazuje paměť moře, ne skutečnou budoucnost.

### bw-02-03 — Ztracený fonograf [NOVÁ]
Ve skladu archivu leží fonografický váleček označený „nepřehrávat po západu“. Při přehrání je slyšet hlas vyšetřovatele, přestože záznam vznikl před desítkami let. **A Přepsat rytmus bez přehrání:** `clue-bell-pattern` jako náhradní cesta. **B Přehrát nahrávku:** rychlá znalost, ale bytost pozná hlas hráče `flag-voice-marked`. **Později:** ústav může potvrdit vzorec.

### bw-02-04 — Dopis správci [NOVÁ]
Dopis z roku 1883 popisuje, proč se městská zvonice musela zapálit. Poslední věta je přepsána čerstvým inkoustem. **A Ověřit podpisy zakladatelů:** `clue-founders-oath`. **B Vyhledat rodinu Vossových:** `flag-voss-confrontation`, odemyká rozhovor v ústavu. **Náhradní stopa:** hrob bez jména.

## Kapitola IV: Ústav (location-3)
**Atmosféra:** bílé chodby, mokré obvazy, zvuk neexistujících hodin, dveře očíslované nesprávně. **Otázka:** Proč pacienti slyší zvon? **NPC:** doktor Elias Voss, pacient č. 9. **Odemkne:** znalost HLAS a návaznost na maják.

### bw-03-01 — Pacient číslo devět [EXISTUJE]
Pacient počítá údery, které nikdo jiný neslyší. **A Vyslechnout:** `clue-bell-pattern`, možnost obnovit SAN. **B Zapsat klepání:** přesnější rytmus pro maják. **Náhradní stopa:** fonograf v archivu.

### bw-03-02 — Noční služba [EXISTUJE]
Prázdný vozík a čerstvý záznam o dávno mrtvém pacientovi. **A Číst dokumentaci:** `clue-voss-treatment`. **B Prohledat uzamčené oddělení:** `clue-salt-circles`. **Odhalení:** léky potlačují vzpomínky, ale ne hlas.

### bw-03-03 — Rytmus za zdí [NOVÁ]
Ze stěny pokoje zazní sedm úderů; mezi šestým a sedmým je prodleva, kterou pacienti vyplňují vlastním jménem. **A Měřit prodlevu:** dokončí znalost HLAS `knowledge-voice`. **B Přerušit rytmus:** zbrzdí rituál, ale zničí část záznamu. **Náhradní cesta:** maják + archivní fonograf.

### bw-03-04 — Zamčený pokoj [NOVÁ]
Doktor Voss drží pokoj prázdný, přestože na lůžku zůstává teplý otisk těla. V zásuvce je záznam o léčbě Eleanoriny rodiny. **A Vyjednávat s Vossem:** `flag-voss-ally` nebo jeho nepřátelství; podle dřívější důvěry. **B Otevřít pokoj tajně:** `clue-memory-seal` za cenu Hrozby. **Náhradní cesta:** dopis správci + hřbitov.

## Kapitola V: Hřbitov (location-4)
**Atmosféra:** náhrobky otočené k moři, čerstvá hlína v dávno opuštěných hrobech, provazy bez zvonů. **Otázka:** Čí jméno zůstalo v přísaze? **NPC:** hrobník Jonáš Král. **Odemkne:** znalost JMÉNO.

### bw-04-01 — Hrob bez jména [EXISTUJE]
Náhrobek nese jen datum požáru zvonice. **A Zkoumat hrob:** `clue-bell-keeper-name`. **B Hledat pohřební záznam:** `clue-founders-oath`. **Náhradní cesta:** archiv.

### bw-04-02 — Hrob, který dýchá [EXISTUJE]
Hlína se zvedá jako hrudník spícího člověka. **A Otevřít hrob:** fragment pečeti, ale zranění nebo Hrozba. **B Naslouchat:** hlas vysloví falešné jméno, které lze vyvrátit matrikou. **Princip:** falešná stopa musí být ověřitelná, nikdy ne slepá past.

### bw-04-03 — Zvoníkova dcera [NOVÁ]
Na náhrobku dívky z roku 1883 je malá kovová destička. Z jejího jména někdo odstranil poslední písmeno. **A Obnovit nápis:** `clue-first-child` a poznání, že zjevení není skutečná dívka. **B Následovat její obraz:** rychlejší cesta k jeskyním, ale `flag-voice-marked`. **Náhradní cesta:** kresba v ulici.

### bw-04-04 — Pohřební záznam [NOVÁ]
V hrobníkově knize jsou čtyři podpisy a páté prázdné místo, do kterého prosakuje voda. **A Spojit podpisy s archivem:** dokončí `knowledge-name`. **B Požádat hrobníka o svědectví:** zkrátí pátrání, pokud mu hráč pomohl. **Náhradní cesta:** Vossův dopis + rodinná paměť Eleanor.

## Kapitola VI: Maják (location-5)
**Atmosféra:** sklo čočky pokryté solí zevnitř, světlo blikající proti rytmu vln, schody, které se zdají nekonečné. **Otázka:** Jak přerušit signál? **NPC:** Thomas Bell. **Odemkne:** řešení HLAS/TĚLO a finále.

### bw-05-01 — Signální kniha [EXISTUJE]
Záznamy směn obsahují výpadky vždy v okamžiku, kdy zazní zvon. **A Porovnat záznamy:** `clue-lighthouse-signal`. **B Vyzkoušet mechanismus:** možnost zadržet rituál za cenu poruchy. **Náhradní cesta:** fonograf/ústav.

### bw-05-02 — Poslední strážce [EXISTUJE]
Thomas Bell slyší svou mrtvou manželku z moře. **A Získat jeho důvěru:** `flag-bell-ally`; přístup k mechanismu. **B Obejít ho:** rychlý postup, ale horší finální podmínky. **Náhradní cesta:** signální kniha + klíč.

### bw-05-03 — Strážce přílivu [NOVÁ]
Za čočkou majáku stojí postava, která se v odrazu jeví jako utopený námořník. Thomas tvrdí, že jde o posledního z původních strážců. **A Vyjednávat pomocí znalostí:** `clue-seal-mechanism`. **B Vynutit průchod:** boj nebo útěk, nikoli povinné zabití. **Náhradní cesta:** Bellova důvěra.

### bw-05-04 — Rozbitá čočka [NOVÁ]
Jeden segment čočky zobrazuje moře o sedm minut napřed. V jeho odrazu hráč spatří sebe, jak odpovídá zvonu. **A Seřídit čočku:** dokončí `knowledge-voice`, pokud má rytmus. **B Rozbít segment:** možnost silového zakončení `flag-lens-broken`, ale zvyšuje Hrozbu. **Náhradní cesta:** ústav + fonograf.

## Kapitola VII: Jeskyně (location-6)
**Atmosféra:** černý kámen teplý na dotek, moře proudící proti gravitaci, ozvěny, které odpovídají dříve než slova. **Otázka:** Co je zvon a co bude cenou za jeho umlčení? **NPC:** obrazy posádky Milosti, Dívka z přílivu. **Odemkne:** znalost TĚLO a finále.

### bw-06-01 — Kruh z kostí [EXISTUJE]
Kosti uspořádané kolem černého zvonu vytvářejí mapu města. **A Prozkoumat kruh:** `clue-ritual-circle`. **B Narušit obřad:** sníží rituál za cenu zranění či Hrozby. **Náhradní cesta:** atlas + tunely.

### bw-06-02 — Komnata mušlí [EXISTUJE]
Každá mušle šeptá jiným hlasem; v jedné je hlas kapitána Reeda. **A Poslouchat:** `clue-crew-between-tides`. **B Zničit mušle:** omezí vliv bytosti, ale může poškodit cestu k záchraně posádky. **Náhradní cesta:** celní kniha.

### bw-06-03 — Voda v tunelech [NOVÁ]
Příliv zaplavuje chodby v nesprávném pořadí. Mezi vlnami lze vidět dveře do místnosti, která fyzicky neexistuje. **A Použít mapu tunelů:** bezpečný postup, `flag-safe-cave-entry`. **B Plavat zkratkou:** rychlý průchod za cenu HP/SAN; nesmí být povinný. **Náhradní cesta:** rybářův bezpečný průchod.

### bw-06-04 — Poslední zvon [NOVÁ]
V síni visí zvon bez srdce. Když hráč přistoupí, jeho vlastní hlas vysloví první slovo přísahy. **A Zkoumat pečeť:** dokončí `knowledge-body`. **B Připravit zničení:** `flag-force-ending-ready`, dostupné i bez kompletní znalosti. **Náhradní cesta:** signální kniha + kruh z kostí. **Důležité:** tato karta neukončuje hru automaticky; finále musí být samostatná scénářová akce.

## Globální události
### bw-event-01 — První úder [NOVÁ, podmíněná]
Spustí se po úvodním rozhodnutí / při prvním přechodu kola (přesný trigger až po auditu enginu). Lidé na okamžik přestanou mluvit, všechny hodiny ve městě se zastaví. **A Uklidnit svědky:** `flag-town-trust`; **B sledovat ozvěnu:** stopa k majáku, ale SAN risk. **Nejde o další povinný AP sink.**

### bw-event-02 — Návrat ztracených [NOVÁ, podmíněná]
Po získání dvou znalostí nebo v pozdní fázi se na molu objeví jeden z námořníků Milosti. Nepamatuje si své jméno. **A Pomoci mu:** možnost `flag-crew-rescue`, otevře epilog; **B vyslechnout:** rychlá informace o síni, ale risk označení hlasu. Musí existovat alternativa pro hráče, který přístav opustil.

## Přehled klíčových znalostí a náhradních cest
| Znalost | Primární cesta | Náhradní cesta |
|---|---|---|
| `knowledge-voice` | Ústav `bw-03-03` + Maják `bw-05-04` | Přístav `bw-00-01` + Archiv `bw-02-03` + Signální kniha |
| `knowledge-name` | Ulice `bw-01-03` + Archiv `bw-02-04` + Hřbitov `bw-04-04` | Vymazaná stránka + Hrob bez jména + svědectví Vosse |
| `knowledge-body` | Jeskyně `bw-06-01/-04` | Atlas utopených + mapa tunelů + Maják `bw-05-03` |

**Definice průchodnosti:** hráč může získat nejméně dvě znalosti i při neúspěchu na jedné klíčové kartě, pokud využije náhradní větev. U všech tří postav existuje dosažitelný konec. Nesmí být nutné vyhrát jediný boj.

## Finální rozhodnutí
Finále se nabídne po získání dvou ze tří znalostí (přesné podmínky scénářového stavu), nikoli automaticky při příchodu do jeskyní.
1. **Tiché moře** — 3 znalosti + přerušení signálu + obnovení pečeti; zachráněné NPC ovlivňují epilog.
2. **Zlomený zvon** — znalost TĚLO nebo příprava silového zásahu, rizikový závěrečný test; město přežije za cenu.
3. **Cena hlasu** — vědomá nabídka vzpomínek, dostupná s 2 znalostmi; záchrana posádky, osobní ztráta.
4. **Hlubiny odpoví** — prohra podle rituálu, Hrozby, HP/SAN či selhání finále.
**Nevynucovat jediný hod jako jedinou cestu k vítězství.** Neúspěšný finální test může nabídnout oběť či násilné řešení za cenu.

## Stav návrhu a checklist před kódováním
- [x] 7 kapitol a 30 pojmenovaných karet; 14 existujících ID respektováno.
- [x] Každá karta má atmosféru, 2 volby nebo dvě vyšetřovací metody a dějový důsledek.
- [x] Tři znalosti, náhradní cesty, čtyři konce, odložené důsledky.
- [ ] Napsat 60–200slovné finální úvody a **šest** unikátních výsledkových textů pro každou volbu; zde jde o obsahový outline.
- [ ] Namapovat `clue-*`, `flag-*`, `knowledge-*` na existující `reward-*` a schema efektů; ověřit ID kolize.
- [ ] Vypočítat AP ekonomiku a 7kolový limit, nasimulovat průchody různými postavami a kostkami.
- [ ] Navrhnout trigger globálních událostí bez dvojího spuštění po reloadu.
- [ ] Implementovat endingId, save migraci, variantní epilogy a spoiler-safe projekci.
- [ ] Doplnit 16 nových ilustrací, až budou karty implementovány.
- [ ] E2E: 2+ cesty k finále, 4 konce, neúspěšné hody, save/reload, 320/390/1440.
