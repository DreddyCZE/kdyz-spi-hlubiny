# Koncept a hranice refaktoringu

Tento dokument popisuje původní milník M1. Aktuální pravidla M2.1 a šest výsledků jsou v [GAME_DESIGN.md](GAME_DESIGN.md), datové definice v [CARD_SCHEMA.md](CARD_SCHEMA.md).

M2.2 přidává explicitní vyhodnocení důkazů bez ceny AP a bez změny kol nebo rituálu. Informace získané ze složené odměny se nově pamatují i po odebrání předmětu. Jde o vyžádané pravidlo tohoto milníku, popsané v [DEDUCTION_SCHEMA.md](DEDUCTION_SCHEMA.md); nejde o vedlejší efekt refaktoringu.

M3.2 zavádí explicitní akci dobrání karty za 0 AP. Každá lokace má vlastní balíček v pevném pořadí definic; žádné zamíchání ani náhoda se do enginu nepřidává. Dostupná karta se odhalí až po akci `draw`. Karta s nesplněnou podmínkou zůstává odložená a může být dobrána, jakmile se podmínka splní. Neopakovatelná karta se po vyhodnocení spotřebuje; opakovatelná se vrací až po vyčerpání ostatních dostupných karet. `next` pouze uzavře již vyřešenou kartu a neposkytuje další kartu automaticky.

Oprava revize M2.1: složená odměna „Deník a přívěsek“ plní podmínku vlastnictví důkazu deníku prostřednictvím datového pole `evidenceIds`. Lepší hod tím nezablokuje porovnání poznámky. Uložené odměny ani limity partie se nemění.

Autoritativní základ je kořenový prototyp v0.3, přesunutý beze změny do [reference](../public/legacy-prototype.html). [Soubor z Downloads](../public/reference-prototype.html) zachováváme jako druhou referenci; obsahuje odlišný systém více postav, dedukcí a událostí. Tyto mechaniky nejsou součástí v0.3 a nebyly do něj automaticky sloučeny.

## Pravidla v0.3

Eleanor má 6 HP, 8 SAN, atributy SÍ 1, OB 2, VĚ 3, VŮ 2, VN 2. Začíná v Přístavu, v kole 1, se 3 AP, Hrozbou 2 a Rituálem 1. Přesun a průzkum stojí po 1 AP. Volba postupu a dobrání další karty jsou zdarma. Další kolo obnoví 3 AP a zvýší Rituál o 1, i když zůstaly nevyužité akce.

Hod 2d6 + atribut proti obtížnosti: rozdíl ≥3 velký úspěch, ≥0 úspěch, ≥−2 částečný úspěch, jinak neúspěch. Dvě šestky vždy znamenají velký úspěch, dvě jedničky kritické selhání. Před hodem jsou následky skryté. Výsledek přidá předmět a provede explicitní změny HP, SAN, Hrozby a Rituálu.

Nulové HP/SAN, Hrozba 10, Rituál 8 nebo konec sedmého kola ukončí scénář porážkou. **Prototyp 0.3 neobsahuje vítěznou podmínku.** Uzavření brány, využití důkazů a vítězství vyžadují samostatný návrh pravidel; tento refaktoring je nevymýšlí.

## Opravené chyby a rozhodnutí

- Následky nejsou za běhu odvozovány regulárním výrazem z češtiny. Kombinovaná ztráta HP a SAN se aplikuje celá.
- Každá karta se vyhodnotí jednou za hru. Návrat do lokace a nové kolo ji neobnoví. Balíček se po poslední kartě vyčerpá; nepřetáčí se pro opakované odměny.
- Výsledek i cena akce se uloží společně před kosmetickou animací. Ovládání je během animace uzamčené; reset zruší časovač. Obnovení stránky zachová hod.
- Všechny akce kontroluje engine; po konci scénáře jsou neúčinné. Statistiky neklesnou pod nulu a nepřekročí limity.
- Uložený stav má verzi a validaci rozsahů, karet i hodů. Deník a výsledky přetrvají obnovení stránky.
- Skryté následky nejsou jen rozmazané v DOM; objeví se až vyhodnocený text. Texty se vkládají přes `textContent`.

## Architektura a kontrola

[Engine](../src/engine/game.js) nezná DOM, časovače ani úložiště. `transition` vrací nový stav při platné akci, jinak původní. Náhoda se předává jako hotové kostky. [Data](../src/data/locations.js) používají pojmenovaná pole a explicitní efekty. [UI](../src/ui/app.js) zajišťuje ovládání a persistenci.

Automatické testy: prahy hodů, kritické výsledky, ceny akcí, neměnnost vstupu, souběžné poškození, vyčerpání karet, konce hry, serializace a neplatné úložiště. Ručně kontroluj desktop i mobil: pohyb, výběr postupu, blokaci během hodu, reset během hodu, obnovu stránky, prázdnou lokaci, sedmé kolo a odmítnuté ukládání.

Revize PR #3 odděluje rozsah obecných podmínek kol od délky prvního scénáře a předává názvy lokací přes metadata aktivního obsahu. Nemění sedmikolová pravidla, rituál, UI ani formát uložených her.

## D3 – stabilizace volitelné vyšetřovací linie

Toulavý pes zůstává bezplatným volitelným společníkem; jeho stopa ani příznak `cave-service-route-used` nejsou podmínkou zakončení. U karty Sůl na schodech je nyní možné odejít za 0 AP: hráč s již zaznamenanou stopou nemusí před porovnáním podstoupit další test. Nová volba nic neodemyká a neuděluje odměnu. Jednorázový neúspěch v Průchodu pod skálou neslibuje neexistující opakování; vyšetřování pokračuje v ostatních lokacích.

Nevyřešená podmíněná karta není veřejně promítána ani přijata z uložené pozice bez splněných podmínek. Již vyhodnocené karty zůstávají dostupné pro zobrazení dosaženého výsledku. Formát save a pravidla legacy hry se nemění.

## D4 – pilot konfliktu na kartě

Hlídač u řetězu je jednorázové volitelné setkání v přístavním balíčku scénáře. Nabízí boj (SÍ), útěk (OB), vyjednávání (VŮ) a využití navijáku (VN), každý za 1 AP. Šest výsledků každé volby má explicitní efekty. Způsob řešení a zpřístupnění zadního mola se zaznamenají příznaky; nejsou podmínkou hlavní cesty ani zakončení. Neúspěch umožňuje pokračovat v ostatních lokacích. Nulové HP/SAN zůstávají porážkou; návrat vyřazené postavy dosud implementován není. Legacy obsah se nemění. Nové definice používají existující save schema a staré stabilní ID zůstávají zachované.

Regrese ověřují čtyři přístupy s šesti předanými dvojicemi kostek, atomickou cenu a následek, odmítnutí opakovaného potvrzení, reload před i po výsledku, veřejnou projekci a dosažitelnost skutečným dobíráním.

## Integrace U2/U3 a kompatibilita

Scénářový režim přebírá výběr tří postav, jejich limity HP/SAN, jednorázové schopnosti, oddělenou výbavu a nepovinná střetnutí. Základní atributy testů zůstávají společné. Starší rozehrané pozice bez identity postavy pokračují s původními limity; nedochází k přepisu identity ani herní historie. Jen nedotčená nová session nabízí výběr. Umístění protivníků je definováno v obsahu scénáře, ne v obecném přechodu ani v DOM.

## D6 – veřejná pravidla

Přehled Jak se hraje je dostupný klávesnicí i před výběrem postavy. Používá délku a AP aktivního scénáře, pro původní režim popisuje sedm kol a původní porážku. Nečte tabulky následků, podmínky zakončení ani řešení hádanek. Otevření i zavření je čistě prezentační a neukládá žádnou změnu hry. Pravidla uvádějí aktuální sdílené atributy, skutečné efekty vybavení a maximálně tři bojové výměny; neslibují dosud nepřipojený mýtus ani návrat vyřazené postavy.

## D5 – hádanky a příběhové důsledky

Ke třem znamením zvonu přibývá doplnění jména na hřbitově a nastavení signálu v majáku. Jméno vyžaduje porovnání archivního opisu a fotografie s rytinou ze hřbitova; signál spojuje deník, plán a svědectví ze tří míst. Pokus vyžaduje skutečně nalezené důkazy; první chyba zvýší Hrozbu, další chyby ji neopakují. Explicitní náhradní cesta spotřebuje AP a provede uvedené efekty v jediném přechodu. Dokončené řešení ani náhradní cestu nelze opakovat. Rozpracované nastavení hádanky je volitelným polem uloženého stavu, starší pozice bez něj zůstávají platné. Dříve dokončená jmenná hádanka zůstává při načtení dokončená; nové podklady se vyžadují jen při novém pokusu.

Nové karty propojují archiv, Vossovo svědectví, Thomasovu pomoc a návrat posádky. Epilog promítá pouze skutečně dosažené příznaky a zvolený konec; před koncem se nezobrazuje. Podmínky existujících zakončení se nemění.

## D6 – prolog a kontextové nápovědy

Nová hra nabízí přeskočitelný český prolog a nápovědy podle veřejného herního stavu. Přečtené nápovědy a jejich vypnutí se ukládají odděleně pod klíčem `hlubiny-onboarding-v1`; nemění herní revizi ani náhodu. Rozehrané pozice bez nastavení průvodce jej automaticky nezapínají. Nová hra průvodce obnoví. Nedostupné úložiště nebrání pokračování.

## Pasivní vlastnosti vyšetřovatelů

Detektiv s alespoň jedním získaným důkazem přičítá +1 k vyšetřovacím testům VĚ a VN. Bonus se použije při porovnání prvního hodu a přehodu i při přijetí výsledku. Promítá se do veřejného přehledu dosažitelných úrovní a součtu hodu; neovlivňuje bojové hody. Již vyhodnocené hody se po získání dalších důkazů nepřepočítávají.

Okultistka má první přehod vyšetřovacího testu v každém kole zdarma, i pokud zbývá pouze 1 SAN. Další přehody mají obvyklou cenu 1 SAN a vyžadují alespoň 2 SAN. Každý konkrétní hod lze stále přehodit jen jednou. Bezplatný přehod se spotřebuje při jeho provedení, nikoli až při přijetí výsledku.

Námořník sníží první záporný HP efekt z karty nebo celkové HP zranění jedné bojové výměny o 1. Karty a boj sdílejí jeden limit za kolo. Snížení proběhne před oříznutím HP na nulu a vyhodnocením porážky; zranění větší než zbývající HP plus ochrana je stále smrtelné. SAN ani Hrozba se nesnižují. Využití se zaznamená i při úplném zrušení ztráty 1 HP.

Save zůstává ve scénářové obálce verze 1 s aditivními volitelnými poli: `passiveRound` uvádí poslední kolo využití okultistky či námořníka; výsledky zvýhodněných hodů detektiva mají `testBonus: 1`. Validátor kontroluje typ postavy, rozsah kola, atribut, dostupný důkaz a přesný součet/úroveň hodu. Starší uložené výsledky bez bonusu zachovají původní součet. Legacy validátor bez explicitně povoleného bonusu nové výsledky odmítá. Starší pozice bez informace o využití mají vlastnost v aktuálním kole dostupnou; její minulou aktivaci nelze zpětně odvodit.

## Vyřazení a návrat – rozhodnutí auditu 2026-11-10

Nula HP nebo SAN zůstává konečnou porážkou. Scénář má jediného aktivního vyšetřovatele a nepovinného pomocníka bez vlastní tahové ekonomiky. Automatické oživení by změnilo význam posledního zranění, spotřebních předmětů i námořníkovy ochrany; nynější pravidla žádný zdroj návratu ani cenu nedefinují. Návrat proto v této integraci nepřidáváme. Případný budoucí návrh musí určit jednorázový zdroj záchrany, cenu v čase a následky, ověřit oba druhy vyřazení a řešit save. Současný epilog porážky a nová hra umožňují uzavřít neúspěšný příběh bez neřešitelného stavu.

## Audit atmosférických větví

PR #16 má samostatný prezentační kontrolér a animace karet/výsledků, ale jeho staré zapojení odhaluje již vyhodnocený hod po animaci. Nový scénář vyžaduje výslovné přijetí výsledku; přepsání aktuálního adaptéru starou verzí by poškodilo tuto vlastnost. Větev proto zůstává oddělená. Zachováváme aktuální animaci kostek, reduced motion a blokaci potvrzení během animace; výsledky nově rozlišujeme textem i kontrastními rámečky. Audio větev a stará příběhová větev nemají vlastní commity nad jejich společným historickým základem, takže neobsahují funkční audio k převzetí.

Průvodce lze znovu otevřít tlačítkem „Průvodce hrou“ bez resetu rozehrané hry. Vedle prvních akcí vysvětluje i spotřební výbavu. Aktuální směr pátrání vychází pouze ze získaných důkazů a dostupných veřejných akcí; neuvádí skryté podmínky zakončení.
