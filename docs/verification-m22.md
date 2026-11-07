# Ověření M2.2

Základ větve `feature/m2-2-deductions`: aktuální `origin/main` na commitu `948eaad` (sloučená M2.1). Ověřeno 7. listopadu 2026 na Windows, Node.js 24.16.0 a projektovém Chromiu.

- `npm test`: **38/38 prošlo**. Původní regrese a nové testy alternativních cest, všech logických operátorů a odemčení, deterministické návaznosti, jednorázového/opakovatelného provedení, atomického rollbacku, cyklů a neplatných referencí, veřejné projekce, verzování a M1/M2.1 migrací.
- Jiný scénář s vlastními ID projde obecným enginem, validací a uložením/načtením. Přítomnost ID Blackwater není vyžadovaná.
- `npm run test:e2e`: **4/4 skutečné Chromium průchody prošly**. Základní karta → volba → hod → následek → reload. Tři odměnové cesty (běžný, velký, kritický úspěch) nyní pokračují získáním důkazů, vytvořením dedukce, znalostí a reloadem bez další odměny.
- `npm run build`: úspěšný, včetně validace definic.
- `git diff --check`: bez chyb. Referenční prototypy i původní CSS beze změn.
- Integrovaný browser na portu 4173: obnovení staré v2 hry zobrazilo její známé důkazy v novém deníku. Znalost byla skrytá do explicitního kliknutí, poté se odvodila, po reloadu zůstala zachovaná a opakování bylo zablokované. AP zůstaly 2, kolo i rituál 2. Server byl znovu spuštěn po zjištění `ERR_CONNECTION_REFUSED`.
- Desktopový snímek celého okna po E2E vizuálně zkontrolován: nový deník používá stávající panely, obsah a ovládání jsou čitelné bez překryvů. Herní styl nebyl předělán.

Omezení: konzervativní graf odmítá i cyklus v některé alternativní či záporné větvi. Nesimuluje se dosažitelnost přes sekvence budoucích karetních akcí. Dedukce se provádějí hromadně explicitním tlačítkem, nikoli výběrem jednotlivé dedukce. Metadata jsou JSON bez vykonatelného kódu. Statické zdroje nejsou utajené před DevTools a synchronizace více záložek není implementovaná. Vyvážení, délka hry a tempo příběhu nebyly předmětem kontroly ani změny.
