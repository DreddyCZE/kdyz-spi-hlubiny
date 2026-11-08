# Blackwater — Kapitoly VI–VII a finále (design V1)
> Autorský návrh, spoilery. **Není implementováno.** Stabilní ID existujících karet zachovat. Mechaniky a výsledky ověřit proti enginu před implementací.

## Cíl
Uzavřít tři vyšetřovací linie HLAS, JMÉNO a TĚLO. Hráč nepotřebuje sbírat všech 30 karet. Dvě ze tří linií umožní smysluplné finále, třetí otevře nejbezpečnější řešení. Získané stopy se automaticky zapíší do deníku. Finále nabídne maximálně 2–3 srozumitelné možnosti, nikoli inventářový hlavolam.

## Kapitola VI: Maják posledního světla
Thomas Bell slyší hlas zesnulé ženy. Jeho předkové hlídali mechanismus narušující zvonění.

### bw-05-01 Signální kniha [existuje]
Záznamy ukazují, že maják byl využit k přerušení rytmu zvonu. A: rozluštit signály (VĚ 8) → clue-signal-pattern. B: prozkoumat zařízení (VN 8) → clue-lighthouse-device. Neúspěch vede k Thomasovi.

### bw-05-02 Poslední strážce [existuje]
Thomas přizná, že někdy odpověděl hlasu své ženy. A: důvěřovat Thomasovi (VŮ 8) → flag-thomas-ally. B: převzít obsluhu majáku (VN 8) → flag-player-controls-light. Obě varianty umožní finále, ale jinak ovlivní epilog.

### bw-05-03 Strážce přílivu [nová]
Větrný hodinový mechanismus může rozrušit zvonění. A: opravit jej (VĚ 9) → flag-signal-ready. B: spustit ručně (SÍ 9) → jednorázové přerušení za cenu rizika. Alternativa při selhání: signální kniha a pomoc Thomase.

### bw-05-04 Rozbitá čočka [nová]
Prasklá Fresnelova čočka odráží neexistující pobřeží. A: sledovat odraz (VN 8) → clue-cave-approach. B: zaměřit světlo na moře (VŮ 9) → flag-beacon-disruption. Riziko: Hlas zaznamená polohu vyšetřovatele; žádný automatický softlock.

## Kapitola VII: Jeskyně pod přílivem
Černý kovový zvon nemá srdce, přesto zní. Zrcadlení vody není spolehlivou vizí budoucnosti.

### bw-06-01 Kruh z kostí [existuje]
A: prostudovat symboly (VĚ 8) → clue-ritual-body. B: narušit kruh (SÍ 9) → flag-ritual-weakened. Selhání může zvýšit Hrozbu, ale dá vodítko ke zvonu.

### bw-06-02 Komnata mušlí [existuje]
Ve stěnách jsou zachycené hlasy posádky Milosti. A: pokusit se osvobodit námořníky (VŮ 9) → flag-crew-rescue. B: vyslechnout svědectví (VN 8) → clue-reed-testimony. Nedávat hráči automaticky jistotu, že všechny hlasy jsou pravé.

### bw-06-03 Voda v tunelech [nová]
Příliv zaplavuje únikovou cestu. A: zajistit ústup (VN 8) → flag-escape-secured. B: spěchat ke zvonu (SÍ 8) → časová výhoda, ale riziko HP/SAN. Matějova pomoc může změnit flavor a zmírnit následky, nikoli být nutnou podmínkou.

### bw-06-04 Poslední zvon [nová; finálová scéna]
Zvon visí nad temnou vodou. Hlas nabídne návrat zmizelých za jedinou odpověď. Vyšetřovatel nesmí dostat volbu, která bez varování způsobí nevratnou katastrofu. Vhodné možnosti podle získaných znalostí:
- Obnovit pečeť a přerušit signál: všechny tři linie HLAS + JMÉNO + TĚLO; bezpečnější finále.
- Rozbít zvon: dvě linie včetně TĚLO nebo ekvivalentní fyzický důkaz; záchrana města za cenu ztrát.
- Vydat vlastní hlas či vzpomínky: dvě linie a vědomé přijetí oběti; zachrání posádku, vyšetřovatel ztratí část sebe.
- Pokud rituál dosáhl konce, Hlubiny odpoví; tragický konec.

## Čtyři zakončení
### 1. Tiché moře (nejlepší)
Maják přeruší prodlevu mezi údery, vyslovená původní přísaha obnoví ochranu a zvon se vrátí do hlubin. Část posádky Milosti se vrátí. Hlas zůstává pod hladinou, nikoli zničen. Epilog podle flagů: Voss pomohl/odmítl; Thomas přežil; Matěj otevřel ústup; Eleanor si uchovala vzpomínky.

### 2. Zlomený zvon (hořkosladké)
Fyzické rozbití zvonu zastaví projevení Hlasu, ale jeskyně se zhroutí a některé hlasy posádky zůstanou uvězněné. Město přežije, ztráty mají konkrétní tváře. Zajištěná úniková cesta sníží riziko.

### 3. Cena hlasu (oběť)
Vyšetřovatel vědomě nabídne vlastní hlas nebo klíčové vzpomínky jako náhradu za pohřešované. Zmizelí mohou uniknout, ale vyšetřovatel si nepamatuje, proč do Blackwateru přijel. Epilog má být melancholický, ne automaticky triumfální.

### 4. Hlubiny odpoví (tragédie)
Sedmý úder se uzavře lidskou odpovědí. Město ztrácí paměť i identitu; Milost opět vyplouvá. V epilogu někdo najde dopis Eleanor a první věta se znovu napíše sama.

## Finálová scéna — návrh
Voda v jeskyni je hladká jako zrcadlo. Nad ní visí černý zvon bez srdce. Na jeho povrchu se střídají jména těch, kteří zmizeli. Šestý úder otřese kamenem. Pak nastane ticho, tak dlouhé, až začne bolet.

Z hladiny se ozve známý hlas. „Stačí odpovědět. Všichni se vrátí.“

Za tebou se zvedá příliv. Nad tebou se v temnotě rozsvítí vzdálený paprsek majáku. Máš několik okamžiků na rozhodnutí, jaké poznání použiješ — nebo co jsi ochoten obětovat.

## Jednoduché UI finále
Zobrazit pouze dostupné a srozumitelné volby. Nedostupnou nejlepší možnost lze ukázat zamčenou s popisem „Chybí důkazy o přísaze“, nikoli interním `knowledge-name`. Bez ručního kombinování předmětů. Jeden jasný výsledek a epilog; zjištění v deníku automaticky.

## Balanc a kontinuita
- Současný engine může ukončit hru při ritual>=8, threat>=10 nebo HP/SAN=0; sedmý úder je příběhová metafora, nikoli potvrzená implementace sedmi fází. Před implementací sjednotit počitadlo rituálu, 7 kol × 3 AP a podmínky finále.
- Nevyžadovat průchod 30 kartami za 21 AP. Rozdělit na volitelné, odemykací a finálové; měřit skutečný čas hraní.
- Přehod „Sebrat odvahu“ (−1 SAN, max jednou na vyšetřovací zkoušku, lepší výsledek) nesmí spouštět dvojité efekty ani odhalit výsledky před finálním potvrzením.
- Dopsat šest výsledků pro každou volbu, testy průchodnosti, migrace save a podmíněné epilogy.
- Rozlišit návrh od existujících implementovaných ID, efektů a pravidel.
