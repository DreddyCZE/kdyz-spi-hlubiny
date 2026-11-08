# Blackwater — Kapitola I: Přístav mrtvých (plné texty V1)
> AUTORSKÝ NÁVRH · 2026-11-08 · SPOILERY · **není implementováno**. Navazuje na `BLACKWATER-30-CARD-STORY-OUTLINE.md`.
>
> Čtyři karty, dvě volby na každé, šest výsledků pro každou volbu (48 samostatných výsledkových textů). Existující ID `bw-00-01` a `bw-00-02` zachovat; `bw-00-03` a `bw-00-04` jsou nové. Názvy prvních dvou respektují runtime. Volby a testy u existujících karet jsou návrh redakčního rozšíření, **neplatí jako současná implementace**.

## Cíle kapitoly
- Ukázat hráči podivný zvon a loď Milost, aniž prozradíme identitu Hlasu pod přílivem.
- Představit Matěje Kříže jako opakující se NPC a případného průvodce.
- Zpřístupnit dvě nezávislé cesty k poznání: rytmus zvonu (HLAS), lodní deník a černý písek (TĚLO); archiv poskytuje alternativní stopy.
- Při neúspěchu vždy ponechat konkrétní vodítko. Neúspěch nemusí udělit plnohodnotný clue flag, ale nemá hráče uvěznit.
- Udržet napětí mezi získáním informací a pomocí obyvatelům.

## Zásady pro implementaci
- Před hodem ukázat pouze popis, volby, atribut a obtížnost. Výsledkový text i přesné efekty držet mimo klientskou projekci až do vyhodnocení; ne pouze CSS blur.
- Následky popsané slovy níže jsou **designové**. Mapovat na skutečné typy efektů, zásoby `reward-*`, podmínky a flags až po auditu enginu.
- U již existujících karet neodstranit staré uložené volby bez migrace. Zachovat stabilní ID karet a kompatibilitu uložených her.
- Rozlišit `flag-fisher-helped` od jednorázového zisku evidence; nepřidávat dvojité odměny, pokud hráč potká Matěje ve dvou kartách.
- Délka textů: vstup cca 110–150 slov, výsledky cca 20–50 slov. Po playtestu zkrátit opakované pasáže.
- Kritický úspěch nesmí bez omezení snižovat rituál na každé kartě; případný bonus jen tam, kde má příběhovou logiku.
- Volba bez úspěchu může dát **směr pátrání**, nikoli automaticky plný důkaz.

## bw-00-01 — Zvon v mlze

### Úvodní flavor text

Na konci mola stojí šest rybářů. Všichni mají čepice stažené do čela a všichni hledí do stejného místa mezi bójemi. Moře je nehybné, přesto se o kůly otírá cosi těžkého. Vůně dehtu a ryb se mísí s pachem mokrého železa.

Pak zazní zvon. Ne od kostela, který před lety shořel, ale přímo zpod hladiny. Rybáři zvednou hlavy současně, jako by jim někdo zatáhl za provázky. V černé vodě se na jediný okamžik objeví odraz vysoké zvonice. Nad městem žádná taková nestojí.

Nejstarší z mužů ti beze slova podá kus provazu. Na uzlu je sedm zářezů. „Nedovolte mu dopočítat,“ zašeptá. Jeho ústa se přitom vůbec nepohnou.

### Volba 1: Zachytit rytmus zvonu
**Test:** VN 8 · **zamýšlený důsledek:** `clue-bell-pattern`

**Kritický úspěch:** Zapisuješ údery i prodlevy. V poslední mezeře rozeznáš prostor pro lidskou odpověď. Rybář přizná, že stejný vzorec zaznamenal strážce majáku. Získáš přesný rytmus a přerušíš na okamžik ozvěnu.

**Výrazný úspěch:** Vlny na chvíli ztichnou. Zachytíš celou sekvenci a všimneš si, že šestý úder je kratší než ostatní. Nejstarší rybář ti ukáže směrem k majáku.

**Úspěch:** Rytmus si zapíšeš dřív, než zmizí. Rybář potvrdí, že zvonění slyšel i na cestě k majáku. Máš první použitelnou stopu.

**Částečný úspěch:** Rytmus zaznamenáš, ale poslední úder se ozve uvnitř tvé hlavy. Ještě dlouho slyšíš, jak někdo vyslovuje první slabiku tvého jména. Získáš stopu za cenu příčetnosti.

**Neúspěch:** Zápis přeruší náhlý náraz vody do mola. Starý rybář odmítne znovu promluvit. Všimneš si však znaku majáku vyřezaného do provazu — máš směr dalšího pátrání.

**Kritický neúspěch:** Úder zazní těsně za tebou, ačkoli za tvými zády nikdo nestojí. Papír zvlhne a písmo se rozmaže. Všichni rybáři se obrátí k tobě. Ztrácíš příčetnost a roste Hrozba.

### Volba 2: Odvést rybáře od vody
**Test:** VŮ 8 · **zamýšlený důsledek:** `flag-fisher-helped`

**Kritický úspěch:** Postavíš se mezi rybáře a moře a začneš je oslovovat jménem. Jeden po druhém procitnou. Matěj Kříž ti stiskne ruku a přísahá, že ti ukáže starý průchod pod útesy. Na chvíli utichne i zvon.

**Výrazný úspěch:** Odvedeš všech šest mužů do osvětlené uličky. Matěj se vrátí s mapkou pobřeží a slibem, že ti pomůže, až bude nejhůř.

**Úspěch:** Rybáři tě následují od mola. Matěj ti prozradí, že mezi přílivy vede pod útesy suchá cesta, a požádá tě, abys na něj nezapomněl.

**Částečný úspěch:** Poslední muž uklouzne a strhne tě na mokrá prkna. Utržíš zranění, ale všechny dostaneš do bezpečí. Matěj ti přesto slíbí pomoc.

**Neúspěch:** Rybáři se od tebe odvrátí. Když je zkusíš zastavit, odejdou sami. Na bedně zůstane provaz se sedmi uzly; Matějův dům poznáš podle modrých dveří.

**Kritický neúspěch:** Jeden z mužů tě v transu odstrčí do rezavého háku. Krev dopadne na prkna a z moře přijde odpověď. Rybáři se rozprchnou. Ztrácíš zdraví a Hrozba roste.

## bw-00-02 — Přílivový zvon

### Úvodní flavor text

Loď Milost se pohupuje u mola, přestože ostatní plavidla stojí nehybně. Na zábradlí visí kabát, jehož rukávy jsou svázané uzlem. V kajutě je prostřený stůl pro pět lidí. Šestý talíř stojí na podlaze, plný slané vody.

Z podpalubí přichází klepání: tři údery, dlouhá pauza, další tři. V úzké chodbě spatříš drobné mokré otisky bosých nohou. Začínají u zamčené kajuty a končí u žebříku, aniž by pokračovaly na palubě.

V kapitánově zásuvce leží mapa s vyznačenou oblastí, která na námořních mapách neexistuje. Vedle ní je stránka z lodního deníku. Poslední řádek někdo napsal tak silně, že pero protrhlo papír: „Když zavolala má matka, odpověděl jsem.“

### Volba 1: Prozkoumat mokré stopy
**Test:** VN 8 · **zamýšlený důsledek:** `clue-wet-footprints`

**Kritický úspěch:** Pod lupou objevíš v otiscích jemný černý písek, který se na pobřeží nevyskytuje. Kroky vedou proti směru vody. Pod posledním otiskem je vyryto datum 1883. Stopa spojuje loď se starou katastrofou.

**Výrazný úspěch:** Otisky patří dítěti a jsou starší než dnešní příliv. Pod prkny najdeš kousek stuhy se zašitým datem 1883. Získáš důležitou stopu.

**Úspěch:** Zjistíš, že stopy vedou od zamčené kajuty, nikoli k ní. Na prahu objevíš sůl a černý písek. Zaznamenáš vodítko k první oběti.

**Částečný úspěch:** Voda ti prosákne rukavicemi a na chvíli uslyšíš dětský pláč. Stopy si překreslíš, ale ztrácíš příčetnost.

**Neúspěch:** Otisky zmizí pod další vlnou. Na prahu kajuty však zůstane zářez ve tvaru zvonu. Podobný znak by mohl být v městském archivu.

**Kritický neúspěch:** V podpalubí se za tebou zavřou dveře. Dětské kroky se ozvou přímo z tvých bot. Vyrazíš ven otřesený; Hrozba roste a ztrácíš příčetnost.

### Volba 2: Přečíst kapitánův deník a naslouchat
**Test:** VĚ 9 · **zamýšlený důsledek:** `clue-ship-log`

**Kritický úspěch:** Rozluštíš poslední stránku i rozmazané souřadnice. Reed popisuje hlasy mrtvých, ale všiml si, že všechny dýchají ve stejném rytmu. V deníku je odkaz na městskou matriku z roku 1883.

**Výrazný úspěch:** Najdeš Reedův zápis o černém zvonu a zvláštním odlivu. Všechny hlasy měly totožnou prodlevu před odpovědí. Deník ukazuje do archivu.

**Úspěch:** Zápis potvrzuje, že posádka slyšela své blízké ještě před zmizením. Zapíšeš jméno kapitána a datum staré události.

**Částečný úspěch:** Čteš dál, i když se zpod podlahy ozve hlas, který tě osloví jménem. Zachráníš část deníku, ale ztrácíš příčetnost.

**Neúspěch:** Většinu textu rozpila slaná voda. Přečteš jen slovo „matrika“ a jméno kapitána. Archiv nabízí jinou cestu k odpovědi.

**Kritický neúspěch:** Jakmile vyslovíš poslední slovo nahlas, klepání ustane. Z kajuty odpoví tvůj vlastní hlas. Utečeš s prázdnýma rukama; Hrozba roste a ztrácíš příčetnost.

## bw-00-03 — Celníkova kniha

### Úvodní flavor text

Přístavní celnice má zavřeno, ale za zamlženým oknem hoří lampa. Josef Mareš sedí u stolu s pečlivě seřazenými knihami. Jeho prsty jsou černé od inkoustu a každou chvíli se dotýkají kapesních hodinek, které ukazují čas o hodinu napřed.

V přístavním registru je návrat Milosti zapsán v 21:14. Ty však víš, že loď vplula do zátoky až po desáté. U položky „posádka“ je jediný podpis. Při bližším pohledu se zdá, že jednotlivá písmena napsali různí lidé.

„To není moje chyba,“ řekne Mareš dřív, než se ho zeptáš. „Já jen zapisuji, co připlouvá.“ Na polici za ním leží starý manifest s razítkem roku 1883.

### Volba 1: Porovnat lodní manifesty
**Test:** VĚ 8 · **zamýšlený důsledek:** `clue-reed-voyage`

**Kritický úspěch:** Objevíš, že Milost převzala před plavbou bednu zapečetěnou starým městským znakem. Stejný znak stojí na manifestu z roku 1883. Podpisy se liší, ale pořadí iniciál je totožné.

**Výrazný úspěch:** Najdeš dvojí záznam o stejné zásilce, oddělený 43 lety. Jeden nese jméno Nathaniela Vosse. Získáš důkaz spojení s minulostí.

**Úspěch:** Zápisy potvrzují nesrovnalost v čase i spojení lodě s městským skladem. Jméno Voss je dobrý začátek dalšího pátrání.

**Částečný úspěch:** Rozpoznáš spojitost s rokem 1883, ale při čtení se číslice začnou měnit před očima. Získáš stopu a ztrácíš příčetnost.

**Neúspěch:** Zápisy se nedají bezpečně porovnat. Zůstane ti jen číslo staré zásilky. Archiv může uchovávat jeho kopii.

**Kritický neúspěch:** Razítko se otiskne na tvou dlaň, ačkoli ses ho nedotkl. Mareš vykřikne, lampa zhasne a Hrozba roste. Ztrácíš příčetnost.

### Volba 2: Získat Marešovo svědectví
**Test:** VŮ 8 · **zamýšlený důsledek:** `flag-customs-trust`

**Kritický úspěch:** Mareš přizná, že při příjezdu lodi slyšel podpisy vyslovovat jména posádky. Svěří ti kopii registru a nabídne přístup k uzamčeným knihám, kdykoli se vrátíš.

**Výrazný úspěch:** Celník se uklidní a podá ti úřední kopii. Potvrdí, že v přístavu ten večer nikdo neviděl kormidelníka.

**Úspěch:** Mareš promluví o hodinách, které se zastavily před příjezdem lodi. Dovolí ti poznamenat jeho svědectví.

**Částečný úspěch:** Získáš výpověď, ale Mareš tě poprosí, abys jeho jméno nikde neuváděl. Když přikývneš, poznáš, že už se bojí i vlastního hlasu. Ztrácíš příčetnost.

**Neúspěch:** Mareš tě vyprovodí. Než zavře, ukáže na dveře archivu a řekne: „Tam mají druhý exemplář.“

**Kritický neúspěch:** Tvůj nátlak přiměje Mareše vykřiknout. Za oknem se shromáždí lidé, kteří mlčky opakují jeho poslední slovo. Ztrácíš jeho důvěru a Hrozba roste.

## bw-00-04 — Rybář bez stínu

### Úvodní flavor text

Matěje Kříže najdeš na konci mola, kde už nesvítí žádná lampa. Sedí na převrácené bedně a mezi prsty protahuje mokrou rybářskou síť. Když se zvedne, jeho stín zůstane sedět.

„Volala na mě matka,“ řekne. „Je mrtvá sedmnáct let. Vím to. Sám jsem ji pohřbil.“ Ruce se mu třesou tak silně, že uzly nedokáže rozvázat. Stín na bedně pomalu otočí hlavu k moři.

Matěj tvrdí, že pod útesy existuje chodba, kterou používali pašeráci. Zná ji od dětství. Dnes se ale bojí i dojít domů, protože při každém úderu zvonu slyší, jak jeho matka stojí těsně za ním.

### Volba 1: Pomoci Matějovi odolat hlasu
**Test:** VŮ 9 · **zamýšlený důsledek:** `flag-fisher-helped`

**Kritický úspěch:** Přiměješ Matěje, aby místo hlasu matky poslouchal tvé odpočítávání. Stín se pomalu vrátí k jeho nohám. Rybář ti nakreslí bezpečný průchod do jeskyní a slíbí, že tě jím provede.

**Výrazný úspěch:** Matěj se nadechne a poprvé za několik dní vysloví své vlastní jméno. Ukáže ti trasu mezi útesy a poděkuje.

**Úspěch:** Pomůžeš mu překonat nejhorší záchvat. Nakreslí ti vstup do starého tunelu, ale sám se tam zatím neodváží.

**Částečný úspěch:** Matěj se uklidní, ale při posledním úderu se ti zdá, že hlas jeho matky promlouvá i k tobě. Získáš jeho důvěru za cenu příčetnosti.

**Neúspěch:** Matěj od tebe ustoupí, stále vyděšený. Na bedně však zůstane útržek mapy pobřeží; bezpečnou cestu budeš muset ověřit jinde.

**Kritický neúspěch:** Stín se prudce zvedne a přitiskne Matěje k molu. Při pokusu pomoci uslyšíš hlas vlastního blízkého. Matěj uteče; Hrozba roste a ztrácíš příčetnost.

### Volba 2: Vyslechnout Matěje o hlasu
**Test:** VN 8 · **zamýšlený důsledek:** `clue-voice-imitation`

**Kritický úspěch:** Matěj ti zopakuje matčina slova. Všimneš si, že po každé větě následovala stejná nepřirozená prodleva. Hlas se nevynořil ze vzpomínky; napodoboval ji. Získáš silný důkaz a Matěj tě varuje před sedmým úderem.

**Výrazný úspěch:** Rybář popíše drobné chyby v matčině hlasu, které by si cizí člověk nevšiml. To, co volá z moře, se učí napodobovat.

**Úspěch:** Zjistíš, že hlas znal rodinné tajemství, ale nedokázal odpovědět na jednoduchou otázku z dětství. Získáš stopu o podvodu.

**Částečný úspěch:** Matěj odpoví, ale znovu začne slyšet volání. Zapíšeš jeho svědectví a ztrácíš příčetnost, když hlas na okamžik napodobí i tebe.

**Neúspěch:** Matěj odmítne mluvit dál. Přesto ti řekne jediné: „Zeptejte se v ústavu. Oni to slyší taky.“

**Kritický neúspěch:** Vyslovíš otázku příliš hlasitě. Z moře zazní odpověď tvým vlastním hlasem a Matěj se rozběhne pryč. Ztrácíš jeho důvěru a Hrozba roste.

## Návaznosti na další kapitoly
| Objevené vodítko | Další lokace | Důvod |
|---|---|---|
| Rytmus zvonu | Ústav / Maják | Pacient č. 9 a signální kniha mohou potvrdit prodlevu |
| Deník Milosti | Archiv | Lodní manifest a matrika z roku 1883 |
| Černý písek a dětské stopy | Hřbitov / Jeskyně | První oběť a fyzické místo rituálu |
| Marešův registr | Archiv | Druhý exemplář a spojení s Vossovými |
| Matějova mapa | Opuštěná ulice / Jeskyně | Bezpečný přístup pod útesy |
| Napodobování hlasů | Ústav | Pacient č. 9 a Vossovy záznamy |

## Kontrola před implementací
- [ ] Porovnat nové texty s existujícími 14 kartami a sjednotit fakta, názvy a odměny.
- [ ] Namapovat šest výsledků na přesné modifikace HP, SAN, Hrozby a rituálu; hodnoty v tomto dokumentu nejsou závazná konfigurace.
- [ ] Přidat podmíněné pozdější dialogy Matěje a Mareše.
- [ ] Otestovat neúspěchy, návrat k alternativním stopám, save/reload, přístupnost a spoiler-safe UI.
- [ ] Připravit ilustrace pro dvě nové karty a ověřit licenci/původ.
