# Blackwater – návrh příběhové prezentace, pravidel a nastavení (M5 design)
> Stav: NÁVRH, neimplementováno. 2026-11-08. Podklad pro příští samostatný PR. Nesmí měnit engine ani save.

## 1. Úvod scénáře
**Zvony pod přílivem** · Blackwater, listopad 1926 · „Některé zvony nesvolávají živé.“

Do Blackwateru přijíždíš posledním večerním vlakem. Déšť bubnuje na střechu nádraží a mezi domy se převaluje těžká, slaná mlha. Město působí opuštěně. V oknech několika domů hoří světla, ale nikdo nevychází ven.

Před třemi dny se do přístavu vrátila rybářská loď *Milost*. Její paluba byla mokrá, sítě plné černého bahna a v podpalubí někdo našel stopy bosých nohou. Posádka zmizela. Loď přitom vplula do přístavu bez jediného člověka u kormidla.

Od té noci se po setmění ozývá zvon.

Podle místních přichází jeho hlas od moře. Staré městské záznamy však tvrdí, že poslední zvonice vyhořela před třiačtyřiceti lety. Někteří obyvatelé přísahají, že při každém úderu slyší své jméno. Jiní přestali mluvit úplně.

V kapse kabátu svíráš dopis od Eleanor Whitmoreové, která tě požádala o pomoc. Poslední řádek je napsaný roztřesenou rukou:

*„Jestli zvon zazní posedmé, nechoď k vodě. A hlavně neodpovídej.“*

Někde za mlhou se ozve první úder.

**Vyšetřování začíná.**

UI: Úvodní ilustrovaná obrazovka před výběrem vyšetřovatele, tlačítka „Vstoupit do Blackwateru“, „Jak se hraje“, „Nastavení“. Informace: 1 hráč, cíl 60–90 minut (ověřit balancingem), 7 lokací, 2k6. Úvod nesmí prozrazovat pravdu o rituálu.

## 2. Kniha pravidel – kapitoly
1. První kroky – cíl, volba vyšetřovatele, mapa, průběh hry.
2. Kola a AP – aktuálně 3 AP na kolo; přesuny, průzkum a další akce podle skutečného enginu.
3. Karty a zkoušky – atributy, 2k6, šest úrovní výsledku, skrytí následků před hodem.
4. Důkazy a dedukce – nalezené stopy, znalosti, odemykání dalších možností.
5. HP a SAN – zdraví, příčetnost a prohra.
6. Souboje a předměty – útok, útěk, max. tři výměny, spotřební a příběhové předměty.
7. Mýtus, Hrozba a Rituál – fáze po ukončení kola, nepřátelé, zvyšování ukazatelů.
8. Ovládání, deník a ukládání – samostatný Blackwater save, návrat po reloadu.

**Pravidla se musí odvodit z runtime, ne ze zastaralé roadmapy.** Např. speciální bojové akce či vítězný konec dosud nejsou implementovány. Pravidla dostupná kdykoli z herní lišty jako modal/panel, který nezahodí stav; klávesnice, focus, mobil 320 px, čitelné texty.

Kontextové nápovědy: první hod, první boj, první mýtus, první předmět. Vypínatelné. Neprozrazovat budoucí následky.

## 3. Delší flavor texty
- Běžná událost: 60–100 slov.
- Důležité setkání: 120–200 slov.
- Prolog / velké odhalení / epilog: 200–350 slov.
- Každá volba má samostatné texty pro příslušné výsledky; důsledky musí být narativně odlišné. Rozdělit na čitelný úvod, volbu a odkrytý výsledek. Nikdy nevkládat skryté výsledky do veřejného DOM před hodem.
- Zachovat češtinu, jednotné názvosloví, přirozený dialog, smyslové detaily a gradaci. Nepsat každou kartu jako několik odstavců bez interakce.
- Delší texty nejprve doplnit k úvodnímu přístavu, prvnímu mýtu, prvnímu souboji, archivu, majáku a finále.

### Ukázka setkání – Mokré stopy (návrh přepsání, bez změny ID)
Loď *Milost* se pohupuje u opuštěného mola. Její trup naráží do dřevěných kůlů v pravidelném rytmu, který až nepříjemně připomíná tlukot srdce.

Na palubě leží převrácená petrolejová lampa. Nikde žádná krev, žádné známky zápasu. Jen voda. Je jí příliš mnoho, dokonce i na loď, která se právě vrátila z bouře.

Když sestoupíš do podpalubí, všimneš si řady mokrých otisků bosých nohou. Vedou od zamčené kajuty ke schodům. Některé jsou tak malé, že by mohly patřit dítěti.

Zpoza dveří se ozve slabé škrábání.

Potom hlas, který vysloví tvé jméno.

Možné volby (pouze návrh, atributy a obtížnosti ověřit proti schématu): A „Prozkoumat stopy“ (všímavost, 8); B „Naslouchat u kajuty“ (vůle, 9). Úspěch = stopa; částečný úspěch = stopa za cenu SAN nebo zvýšení Hrozby; selhání = odhalení náhradní cesty, nikoli permanentní zámek. Všechny šestistupňové výsledky dopracovat před implementací.

## 4. Tři vyšetřovací linie
- HLAS: Přístav → Ústav → Maják; rytmus, zdroj signálu, jeho přerušení.
- JMÉNO: Opuštěná ulice → Archiv → Hřbitov; původ přísahy, jméno zvoníka, zrušení závazku.
- TĚLO: Přístav → Jeskyně → Maják; fyzické místo obřadu, přímý zásah.
Zpřístupnit finále při dvou ze tří klíčových znalostí; třetí nabízí bezpečnější řešení. Každá linie má alespoň dvě dostupné cesty k důkazu i po neúspěšném hodu. Navrhnout přesné flagy a ID bez kolizí.

## 5. Finále (návrh)
- Tiché moře: přerušení signálu i přísahy s dostatečnými znalostmi.
- Zlomený zvon: násilné přerušení, město přežije za cenu.
- Cena hlasu: vědomá osobní oběť a záchrana pohřešovaných.
- Hlubiny odpoví: prohra kvůli rituálu/hrozbě/HP/SAN nebo neúspěchu finále.
Před implementací ověřit průchodnost 7 kol a AP, oddělit endingId od pouhého game.ended, zachovat kompatibilitu uložených pozic.

## 6. Nastavení (návrh)
- Hudba: výchozí vypnutá, explicitní zapnutí; hlasitost 0–100 %; původní ambientní smyčky, bez autoplay.
- Animace: plné / omezené / vypnuté; respektovat prefers-reduced-motion.
- Kontextové nápovědy: zapnuto / vypnuto.
- Velikost textu: normální / větší / velký.
- Samostatně zvuky UI (později).
Nastavení ukládat odděleně od herního save. Neovlivňovat náhodu, obtížnost ani skryté výsledky.

## 7. Návrh implementačních kroků pro budoucí Codex
A. Intro + pravidla + nastavení, bez změny engine, E2E keyboard/mobile/save.
B. Rozšíření flavor textů a šest výsledků každé karty; testy proti spoilerům.
C. Tři vyšetřovací linie, jejich flagy a náhradní cesty.
D. Čtyři konce, kompletní E2E průchody a balancing.
E. Původní ambientní audio jako volitelná samostatná etapa.

Každá etapa samostatný PR. PR #15 je nyní draft a nesloučený; žádný merge v tomto dokumentačním kroku.
