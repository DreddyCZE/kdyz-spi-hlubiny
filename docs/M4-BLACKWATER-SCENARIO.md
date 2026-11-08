# M4 — První plnohodnotný scénář: Zvony pod přílivem

> Návrh obsahu, nikoli implementace. Větev je izolovaná od paralelních úloh M3.4. Spoilery jsou pouze pro autory, ne pro UI.

## Záměr
- 60–90 minut hraní; 7 kol, 3 AP na kolo; 7 existujících lokací Blackwater.
- Téma: každý večer se z moře ozývá zvon, přestože zvonice města vyhořela před 43 lety.
- Hrdinka Eleanor Whitmore vyšetřuje zmizení posádky lodi *Milost*. Příliv odkrývá záznamy o rituálu, jenž má propůjčit hlas něčemu pod útesy.
- Hráč má tři přístupy: získat důkazy, chránit obyvatele, nebo riskovat rychlý zásah. Žádná cesta nemá vyžadovat jediný náhodný úspěch.
- Většina karet má 2 volby; úspěch, částečný úspěch a neúspěch musí být narativně odlišné. Kritické výsledky rozvíjejí příběh, ne pouze čísla.

## Lokace a funkce
| ID | Místo | Hlavní otázka | Hratelná stopa |
|---|---|---|---|
| location-0 | Přístav | Kdo vrátil prázdnou loď? | Lodní deník / svědectví |
| location-1 | Opuštěná ulice | Proč jsou domy zazděné? | Plán tunelů |
| location-2 | Archiv | Kdo smazal jména obětí? | Soupis zvonů / plán majáku |
| location-3 | Ústav | Co slyší pacienti v noci? | Nahrávka rytmu |
| location-4 | Hřbitov | Kdo leží v prázdném hrobě? | Jméno prvního zvoníka |
| location-5 | Maják | Kdo ovládá světelný signál? | Záznam směn |
| location-6 | Jeskyně | Co probouzí příliv? | Rituální kruh / závěr |

## Tři vyšetřovací linie
1. **Hlas**: přístav → ústav → maják. Odhalí rytmus zvonu a způsob přerušení signálu.
2. **Jméno**: ulice → archiv → hřbitov. Odhalí, komu byl rituál zasvěcen a jak zrušit přísahu.
3. **Tělo**: přístav → jeskyně → maják. Odhalí fyzické místo rituálu a možnost přímého zásahu.

Hráč může kombinovat linie. Ke zpřístupnění závěru stačí dvě ze tří klíčových znalostí, třetí otevírá bezpečnější variantu. Počet klíčových důkazů a podmínky je nutné explicitně modelovat v investigationDefinitions.

## Karty — produkční rozpis (30 nových unikátních)
| Lokace | ID prefix | Karty |
|---|---|---|
| Přístav | bw-00 | 01 Zvon v mlze; 02 Mokré stopy; 03 Celníkova kniha; 04 Rybář bez stínu |
| Ulice | bw-01 | 01 Dům se solí; 02 Dětská kresba; 03 Tři zaklepání; 04 Podzemní schodiště |
| Archiv | bw-02 | 01 Vymazaná stránka; 02 Soupis zvonů; 03 Ztracený fonograf; 04 Dopis správci |
| Ústav | bw-03 | 01 Pacient číslo devět; 02 Noční sestra; 03 Rytmus za zdí; 04 Zamčený pokoj |
| Hřbitov | bw-04 | 01 Hrob bez jména; 02 Zvoníkova dcera; 03 Sůl na náhrobku; 04 Pohřební záznam |
| Maják | bw-05 | 01 Zhaslé světlo; 02 Signální kniha; 03 Strážce přílivu; 04 Rozbitá čočka |
| Jeskyně | bw-06 | 01 Voda v tunelech; 02 Šepot z hlubin; 03 Kruh z kostí; 04 Poslední zvon |
| Globální | bw-event | 01 První úder; 02 Návrat ztracených |

Nové ID jsou návrhy, nesmí kolidovat se stávajícími. Globální události potřebují explicitní spouštěč — současný engine nemá samostatný event deck. Dokud nebude doplněn, lze je reprezentovat jako podmíněné karty lokací.

## Ukázková karta: bw-00-01 — Zvon v mlze
**Veřejný popis:** „Z hladiny se ozve dutý úder. Rybáři na molu se bez jediného slova obrátí k moři. Na okamžik vidíš ve vodě odraz zvonice, která ve městě nestojí.“

**Volba A — Zachytit rytmus** (VN, obtížnost 8, 1 AP)
- Kritický/velký úspěch: zaznamenáš úplný vzorec; důkaz „Rytmus zvonu“ a stopa k ústavu.
- Úspěch: důkaz „Neúplný rytmus“; lze jej později doplnit.
- Částečný úspěch: získáš neúplný rytmus, ale -1 SAN.
- Neúspěch: vzorec se rozpadne; +1 Hrozba, odhalí se náhradní stopa v archivu.
- Kritické selhání: -1 SAN a +1 Hrozba; náhradní stopa zůstává.

**Volba B — Varovat rybáře** (VŮ, obtížnost 8, 1 AP)
- Kritický/velký úspěch: ochráníš rybáře a získáš svědectví.
- Úspěch: ochráníš rybáře; později získáš svědectví v přístavu.
- Částečný úspěch: svědectví za cenu -1 HP.
- Neúspěch: rybáři odejdou; svědectví zůstává dostupné v ústavu.
- Kritické selhání: +1 Hrozba; alternativní stopa stále existuje.

**Poznámka k implementaci:** stávající schema vyžaduje všech šest outcome klíčů a podporované efekty; text nesmí být odhalen před hodem. „Otevřít stopu“ je třeba mapovat na existující flags/conditions nebo unlockCard, ne vymýšlet nový efekt.

## Konce (návrh)
- **Tiché moře**: hráč získal 3 znalosti a přerušil signál i přísahu. Město je zachráněno, ale pod hladinou něco zůstalo.
- **Zlomený zvon**: hráč přeruší rituál silou; město přežije, část obyvatel zmizí.
- **Cena hlasu**: hráč nabídne vlastní vzpomínku a zachrání pohřešované; trvalá osobní ztráta.
- **Hlubiny odpoví**: rituál dosáhne limitu, HP/SAN klesnou na nulu nebo hráč neuspěje v závěru.

## Technické mezery před implementací
- Dnešní `isEnded` zná pouze prohru (HP=0, SAN=0, Hrozba=10, Rituál=8); vítězství a variantní konce vyžadují samostatný stav/scenario result, validaci a save migraci.
- Dnešní `newState` odemyká všech 7 lokací. Pro postupné odemykání bude nutná změna výchozího stavu a testy dostupnosti cest.
- Dnešní `nextDefinition` řadí karty deterministicky. Příběhové brány proto musí být testovány na deferred karty, aby nepřeskočily dostupné alternativy.
- Dnešní `endRound` automaticky zvyšuje Rituál. Ověřit reálnou průchodnost 7 kol / 21 AP, zvláště při ceně přesunů.
- Dnešní `applyEffects` neumí přímé zakončení scénáře, ale umí setFlag, unlockCard, unlockChoice, unlockLocation, addEvidence, addKnowledge a modifyThreat/Ritual.
- M3.4 úkoly #12–#14 běží na oddělených větvích; tento obsah se nemá sloučit před vyřešením kompatibility.

## Akceptační kritéria budoucí implementace
- Žádná jediná karta ani jediný hod nesmí být nutný pro dokončení scénáře.
- Min. 2 nezávislé cesty k finále; 4 odlišné konce; rozhodnutí mají pozdější důsledky.
- Žádný budoucí výsledek, podmínka nebo zamčená volba se nesmí objevit ve veřejné projekci.
- Testy průchodnosti se seedovanými kostkami: čisté úspěchy, samé částečné úspěchy, kombinované neúspěchy, opakovaný reload a migrace save.
- Všechny nové ID stabilní; žádné přepisování historických ID.
- Screenshoty 320, 390 a 1440 px a kompletní CI.
