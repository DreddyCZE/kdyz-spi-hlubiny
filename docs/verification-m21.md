# Kontrola M2.1

## Aktuální kontrola po revizi PR #1 a začlenění PR #2

7. listopadu 2026: oprava složené odměny „Deník a přívěsek“ a infrastruktura PR #2 jsou společně ve větvi `feature/m2-1-card-system`.

- `npm test`: **21/21 prošlo**. Nové regresní testy před opravou selhávaly pro velký úspěch a M1 složenou odměnu; po opravě ověřují běžný, velký a kritický úspěch, v2 save/load, migraci obou M1 reprezentací i odmítnutí stavu bez deníku.
- `npm run test:e2e`: **4/4 Chromium testy prošly**. Základní smoke test a tři skutečné průchody Ztracená loď → Muž z mlhy → reload → porovnání poznámky, zvlášť pro běžný, velký a kritický úspěch. Ověřen správný důkaz a cena AP.
- `npm run build` a `git diff --check`: úspěšné. Referenční prototypy beze změny.
- Desktopový smoke a vizuální kontrola již proběhly při přípravě PR #2; postup a diagnostika jsou v [E2E.md](E2E.md). Původní nedostupnost browseru níže je historický záznam, nikoli aktuální blokace.
- PR #2 byl sloučen pouze do M2.1; PR #1 do `main` zůstává otevřený.

## Původní kontrola před revizí

- `npm test`: 19 testů zahrnujících regresi M1, šest výsledků a jejich prioritu, podmínky, osm typů efektů, odlišné volby a ceny, rozhodnutí bez testu, odmítnutí neplatných dat, atomický rollback, duplicity, opakovatelnost a migraci/validaci úložiště.
- Migrované texty, volby a obtížnosti se automaticky porovnávají s nezměněným referenčním prototypem. Každý migrovaný následek má ověřené poškození a změny Hrozby/Rituálu.
- `npm run build` importuje validovaný obsah a vytváří statický výstup s relativními cestami.
- `git diff --check`: kontrola whitespace; prototypy a CSS nemají změny.
- Prohlížečový průchod se v tomto milníku nepodařilo provést: přímé browser tools vracely `openBrowserPage failed` / `readPage failed`, Computer Use hlásil `The browser access host is unavailable` a nativní okno nebylo dostupné pro snímání (`window is minimized`). Dosavadní prohlížečová kontrola M1 tuto novou změnu nepokrývá.

Před sloučením doporučujeme desktopovou kontrolu: první karta → volba → hod → jediný následek → reload → další karta; poté ukázková karta, výběr bez testu, blokace podmínek a nedostatku AP, reset během animace. DOM aplikace během animace dostává prázdný text výsledku; veřejná projekce je pokrytá automatickým testem.
