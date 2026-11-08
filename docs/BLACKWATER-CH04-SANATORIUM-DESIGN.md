# Blackwater — Kapitola IV: Ústav tichých hlasů (návrh V1)
> AUTORSKÝ DOKUMENT · spoilery · bez implementace. Navazuje na STORY-BIBLE a 30-CARD-STORY-OUTLINE. Nezasahovat do současných ID `bw-03-01`, `bw-03-02`.

## Premisa
V ústavu svatého Bartoloměje mají pacienti zakázáno mluvit po setmění: hlas z moře jim odpovídá. Dr. Elias Voss, potomek jednoho ze zakladatelů, potlačuje vzpomínky pacientů v přesvědčení, že tím město chrání. Má částečně pravdu, ale ohrožuje paměť, na níž závisí ochranná pečeť. Není karikaturní padouch. Jeho dilema má být srozumitelné bez nového systému reputace.

## Čtyři karty
### bw-03-01 — Pacient číslo devět [existuje]
Muž se zacpanýma ušima přesně počítá neslyšitelné údery. Volba A: vyslechnout (VŮ 8), získat svědectví o rytmu. Volba B: zapsat klepání (VN 9), zaznamenat vzorec pro maják. Částečný úspěch = informace za cenu SAN. Selhání = vodítko k fonografu v archivu. Záměr: poznání HLAS.

### bw-03-02 — Noční služba [existuje]
Vozík s čerstvou dokumentací dávno mrtvého pacienta. Volba A: číst záznam (VĚ 8), zjistit, že Vossova léčba potlačuje paměť. Volba B: prohledat uzamčené oddělení (SÍ 9), najít solné kruhy a lékařské poznámky. Selhání = informace o existenci jiného spisu, nikoli úplný důkaz.

### bw-03-03 — Rytmus za zdí [nová]
Za zdí pokoje zazní šest úderů, pak prodleva, která čeká na lidské jméno. Volba A: měřit prodlevu (VN 8), posunout znalost HLAS. Volba B: přerušit rytmus (VŮ 9), zpomalit rituál, ale přijít o část důkazů. Alternativa: fonograf + maják. Nepoužívat jediný povinný hod.

### bw-03-04 — Zamčený pokoj [nová]
Voss střeží údajně prázdný pokoj. V zásuvce je dokumentace o potomcích zakladatelů a Eleanor Whitmoreové. Volba A: vyjednat spolupráci (VŮ 8), stav `vossAlly=true`. Volba B: tajně prohledat pokoj (VN 9), získat `clue-memory-seal`, ale `vossAlly=false`. Bez složité reputace. Vossova pomoc nesmí být povinná.

## Scéna: Doktor Voss
Doktor stojí u okna své pracovny. Na stole leží lékařský kufřík, fonografický váleček a fotografie čtyř mužů před starou zvonicí.

„Přijel jste kvůli Eleanor Whitmoreové,“ řekne, aniž se otočí.

„Ta žena má vzácnou schopnost pamatovat si věci, které se nikdy neměly stát. Její rodina ji předává z generace na generaci. Někdo by tomu říkal dar.“

Voss se konečně obrátí.

„Já tomu říkám nemoc.“

Z chodby se ozve vzdálené zaklepání.

„Víte, co se stane, když člověk uslyší hlas své mrtvé matky? Nejdřív se vyděsí. Potom začne doufat. A nakonec odpoví.“

Doktor položí ruku na kufřík.

„Já těm lidem beru vzpomínky, protože právě vzpomínky dávají tomu hlasu moc. Jestli mě chcete soudit, můžete. Ale nejdřív mi řekněte, kolik lidí jste dnes zachránil vy.“

### Rozhodnutí (jednorázové)
A: „Pomozte mi zastavit zvon. Pak si promluvíme o vašich metodách.“
Výsledek: Voss odloží kufřík. „Dobrá. Ukážu vám záznamy, které jsem měl spálit. Ale jestli uslyšíte někoho, koho jste ztratil, nesmíte mu odpovědět.“ Voss spolupracuje; později může dát informaci o pečeti nebo zmírnit jeden následek.

B: „Nemáte právo rozhodovat, na co lidé smějí vzpomínat.“
Výsledek: „Možná máte pravdu. Ale pravda nás tehdy málem všechny zabila.“ Voss zamkne zásuvku. Hráč zahlédne jméno Nathaniela Vosse na fotografii. Voss nespolupracuje; stejné klíčové poznání lze získat v archivu a na hřbitově.

## Pravidla jednoduchosti
- Žádný ukazatel reputace, maximálně jeden přepínač `vossAlly` a jednorázový dialog.
- Každá karta = dvě volby, případný hod, výsledek, automatický zápis do deníku.
- Nezobrazovat skryté `knowledge-*` a `flag-*` hráči.
- Žádný softlock, žádná povinná pomoc Vosse.
- Výsledky a efekty skrýt do vyhodnocení; ne pouze vizuálně rozmazat v DOM.
- Současná herní data a save schema zůstávají beze změn; před implementací doplnit šest výsledkových variant pro nové karty a ověřit AP ekonomiku.
