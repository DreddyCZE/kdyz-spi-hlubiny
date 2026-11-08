# Blackwater — Druhá šance a Kapitola V: Hřbitov zapomenutých
> Design V1 · spoilery · **neimplementováno**. Dokument pro pozdější Codex, nezasahuje do runtime.

## Mechanika „Sebrat odvahu“
- Pouze necombatové zkoušky vyšetřování na kartách, pokud ještě nebyly definitivně vyhodnoceny.
- Po prvním hodu 2d6 zobrazit součet, klasifikaci a tlačítka „Přijmout výsledek“ / „Sebrat odvahu (−1 SAN)“.
- Přehod obou kostek za **1 SAN**, maximálně **jednou na jednu zkoušku**. Dostupný pouze při SAN >= 2. Náklady se platí ihned a nevracejí se.
- Vybere se **lepší klasifikace** ze dvou hodů; při shodné klasifikaci zůstává první hod (deterministické). Bonusy a obtížnost se nemění. Pokud má engine šest stupňů výsledku, pořadí: criticalFailure < failure < partialSuccess < success < greatSuccess < criticalSuccess.
- **Výsledek karty a její následky se aplikují jen jednou**, až po potvrzení. Žádný dvojí loot, důkaz, SAN damage, threat nebo AP cost.
- Texty všech výsledků a přesné následky nesmí být viditelné před potvrzením výsledku; ne pouze CSS blur. Přehod je nezávislý na možnosti prohlédnout následky.
- Žádný přehod v souboji, obranném hodu, při náhodných událostech, již potvrzených výsledcích či automatických scénách.
- Uložení/obnovení musí zachovat mezistav po prvním hodu, zda byl přehod využit, jeho cenu a finální výsledek; zabránit reload exploitům. RNG musí být deterministicky zachováno podle existující architektury.
- Zohlednit, že 7 kol × 3 AP a současné tempo rituálu nemusí umožnit všechny karty; playtest a balancovat SAN, zvláště s výsledky částečného úspěchu. Zatím bez limitu za scénář; pokud je přehod příliš silný, otestovat limit 2 za scénář.
- Přístupnost: textová alternativa animovaných kostek, reduced motion, zřetelná cena a nemožnost přehodu při SAN < 2.
- **Pozor:** neověřeno proti aktuálnímu enginu; před implementací auditovat výpočet výsledků, pořadí efektů, persistenci a zda klasifikace odpovídají výše uvedeným.

## Kapitola V — Hřbitov zapomenutých
Téma: jména a paměť jako ochranná pečeť. Hřbitov nabídne cestu JMÉNO, ale nesmí být jediným způsobem, jak dokončit finále. Návaznost na archiv, opuštěnou ulici a ústav.

### bw-04-01 Hrob bez jména [existuje]
Hrob nese datum 1883, ale žádné jméno. Dětské mokré otisky připomínají Milost. Volba A: prozkoumat kámen (VN 8), stopa o vymazané první oběti. Volba B: sledovat otisky (VŮ 9), vodítko ke kryptě a jeskyním. Selhání dá číslo hrobu, které lze ověřit v pohřební knize.

### bw-04-02 Hrob, který dýchá [existuje]
Hlína se zvedá a klesá v rytmu zvonu; hlas šeptá jména námořníků. Volba A: naslouchat (VŮ 9), pochopit, že námořníci mohou být zachráněni. Volba B: přerušit rytmus (VĚ 8), snížit místní hrozbu a získat stopu k majáku. Neúspěch = vodítko do archivu, nikoli slepá ulička.

### bw-04-03 Zvoníkova dcera [nová]
V ruině kaple se objeví podoba mladé ženy. Vypráví, že její otec pomohl spálit zvonici, aby zabránil sedmému úderu. **Důležité:** podle story bible hlasy a zjevení mohou být imitací Hlasu pod přílivem; nepotvrzovat, že jde o pravého ducha. Volba A: vyslechnout svědectví (VŮ 8), informace o přísaze, s rizikem manipulace. Volba B: ověřit detaily z matriky (VĚ 9), důvěryhodnější důkaz o požáru. Při selhání vodítko na archiv.

### bw-04-04 Pohřební záznam [nová]
V kryptě je původní kniha pohřbů, jejíž jména nebyla zcela vymazána. Volba A: obnovit jména (VĚ 8), postup JMÉNO. Volba B: rekonstruovat přísahu (VN 9), získat alternativní cestu k obnovení pečeti. Částečný úspěch stojí SAN, neúspěch ukáže chybějící fragment uložený v archivu nebo u Eleanor.

## Příběhová scéna — Zvoníkova dcera
Kaple nemá střechu. Měsíc se skrze holé trámy odráží v loužích na podlaze. Na oltáři leží zčernalý klíč a vedle něj dětská stuha, mokrá slanou vodou.

„Přišli jste pozdě,“ ozve se za tebou.

Ve dveřích stojí dívka v šatech, které vyšly z módy před čtyřiceti lety. Nedělá krok, přesto se zdá být každým okamžikem blíž.

„Můj otec nezvonil pro mrtvé,“ řekne. „Zvonil, aby je udržel tam, kam patří.“

Všimneš si, že dívčina ústa se při poslední větě nepohnula.

Na oltáři najdeš vyrytý úryvek: „Jméno uchová, co oheň nespálí.“

### Volba A — Vyslechnout dívku
Dívka nabídne část přísahy, ale může zamlčet zásadní detail. Při úspěchu hráč rozpozná, že vyprávění neodpovídá dochovanému datu; získá důležitou stopu i pochybnost. Při částečném úspěchu získá stopu za SAN. Při neúspěchu ho zjevení navede k falešné stopě, ale na oltáři zůstane pravé jméno zvoníka jako opravné vodítko.

### Volba B — Ověřit svědectví
Hráč srovná stuhu, klíč a úryvek s pohřebním záznamem. Při úspěchu zjistí, že oheň byl záměrnou součástí ochrany. Při částečném úspěchu pochopí souvislost, ale uslyší své jméno a ztratí SAN. Při neúspěchu získá pouze značku, kterou lze vyhledat v archivu.

## Deník
Po odhalení: „Požár zvonice byl pokusem přerušit sedmý úder. Starou přísahu lze zřejmě obnovit, ale chybí její přesné znění.“ Možná další místa: Archiv / Maják. Bez ručního kombinování důkazů.

## Důsledky pro finále
- Úplná přísaha + další dvě znalostní linie otevírá nejlepší zakončení.
- Neúplná přísaha nezablokuje jiné zakončení.
- Odpověď na hlas nikdy nevynucovat jako jediný postup.

## TODO
- Dopsat šest výsledků každé volby a skutečné efekty podle enginu.
- Ověřit kontinuitu postavy zvoníkovy dcery vůči první oběti a dívce z přílivu; jsou to různé motivy a nemají být bezdůvodně sloučeny.
- Playtest AP, SAN, hrozby, přehodu a save/reload.
