# Blackwater — Kapitola III: Archiv zapomenutých jmen (návrh V1)
> AUTORSKÉ SPOILERY · bez implementace. Jednoduché ovládání: karta → 2 volby → případný hod → automatický deník. Všechny výsledky skrýt do vyhodnocení. Názvy prvních dvou karet a ID zachovat dle runtime.

## Atmosféra
Archiv: kyselý pach papíru, škrábání pera bez písaře, knihy těžké od mořské soli. Téma: požár zvonice roku 1883 byl úmyslným pokusem zastavit rituál, nikoli nehodou.

## bw-02-01 Vymazaná stránka [existuje]
V matrice chybí seznam obětí požáru, na další stránce zůstaly otisky inkoustu. Volba A: obnovit otisk (VĚ 8), stopa o přísaze zakladatelů. Volba B: porovnat zápisy s mapou majáku (VN 9), stopa k mechanismu. Částečný úspěch = důkaz za cenu SAN; selhání = vodítko k jiné kopii. Rozhodnutí zveřejnit důkazy může upozornit Vosse.

## bw-02-02 Atlas utopených [existuje]
Pobřeží se na stránkách samo překresluje, nové zátoky nesou jména zmizelých. Volba A: porovnat staré mapy (VĚ 8), stopa k jeskyním. Volba B: zastavit pohyb inkoustu (VŮ 9), poznání podmořského zvonu. Interpretace: atlas zobrazuje paměť moře, nikoli přesnou budoucnost.

## bw-02-03 Ztracený fonograf [nová]
### Vstupní text
V zadní části archivu objevíš malou místnost bez oken. Na policích stojí desítky voskových válečků, každý označený datem a jménem. Některé štítky jsou prázdné, jiné byly pečlivě seškrábány.

Na stole leží fonograf. Jeho mosazná trouba směřuje ke dveřím, jako by měla poslouchat chodbu.

Pod přístrojem najdeš poznámku psanou roztřesenou rukou: „Neopakujte slova, která uslyšíte. Zejména pokud budou vyslovena vaším vlastním hlasem.“

Vedle leží jediný nepoškozený váleček. Nese datum 17. listopadu 1883.

Když ho zvedneš, přístroj tiše zapraská. Klika fonografu se sama o čtvrt otáčky pohne.

Z mosazné trouby zazní sotva slyšitelné: „Už jsi přišel.“

### Volba A: Prostudovat štítky a záznam bez přehrání (VĚ 8)
- Úspěch: Podaří se ti rozluštit záznamy. Všechny válečky obsahují stejný rytmus, ale hlasy patří různým lidem. Mezi nimi je i hlas někoho, kdo zemřel dávno před rokem 1883. Něco ty hlasy napodobuje.
- Částečný úspěch: Rozpoznáš společný rytmus nahrávek. Když však otočíš poslední váleček, na okamžik uslyšíš své jméno. Získáš stopu, ale ztrácíš 1 SAN.
- Neúspěch: Štítky jsou příliš poškozené. Na spodní straně přístroje však objevíš značku ústavu, kde by mohli mít další záznamy.

### Volba B: Spustit fonograf (VŮ 9)
- Úspěch: Fonograf začne přehrávat hlasy několika lidí. Postupně se překrývají, až zjistíš, že mezi jednotlivými větami všichni dýchají naprosto stejně. Nejsou to různí lidé. Je to jediný hlas, který se za ně vydává.
- Částečný úspěch: Uslyšíš hlas člověka, kterého jsi kdysi znal. Prozradí ti důležitou informaci o zvonu, ale než stihneš zastavit přístroj, osloví tě tvým jménem. Získáš stopu a ztrácíš 1 SAN.
- Neúspěch: Váleček praskne. Z fonografu zazní tvůj vlastní hlas, který tě prosí, abys šel k moři. Nahrávka je zničena, ale na přístroji objevíš adresu ústavu.
- **Poznámka:** Doplnit kritický/výrazný úspěch a kritický neúspěch před implementací. Případné `flag-voice-marked` pouze po skutečném oslovení/odpovědi, ne za pasivní poslech.

## bw-02-04 Dopis správci [nová]
Dopis z roku 1883 vysvětluje požár zvonice. Čtyři muži se pokusili zastavit něco, co sami probudili. Volba A: ověřit podpisy (VĚ 8), stopa o přísaze. Volba B: pátrat po potomcích (VN 8), vodítko na doktora Eliase Vosse v ústavu. Při selhání alternativou matrika a hřbitov.

## Automatický deník
Po získání vhodných důkazů zobrazit jednorázové shrnutí „Požár zvonice nebyla nehoda. V roce 1883 se několik významných obyvatel Blackwateru pokusilo zastavit neznámý rituál. Záznamy byly následně zfalšovány.“ Dále pouze dvě možné lokace: Ústav / Hřbitov. Shrnutí se nesmí objevit před odhalením a nesmí odkrýt pravdu o bytosti nebo finále.

## UI a rozsah
- Jedna karta, dvě jasné volby, jeden výsledek; žádné ruční kombinování důkazů.
- Mapa / Vyšetřovatel / Deník / Menu; kompaktní HP, SAN, AP, rituál.
- Nově získané důkazy automaticky do deníku, pouze jedna aktivní otázka.
- Zkracování již přečtených textů jako volitelné nastavení.
- Není implementováno; před Codexem doplnit šest výsledků pro každou volbu, schema flagů, AP balancing a testy.
