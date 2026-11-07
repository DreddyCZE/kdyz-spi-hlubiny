# Kontrola M2.1

- `npm test`: 19 testů zahrnujících regresi M1, šest výsledků a jejich prioritu, podmínky, osm typů efektů, odlišné volby a ceny, rozhodnutí bez testu, odmítnutí neplatných dat, atomický rollback, duplicity, opakovatelnost a migraci/validaci úložiště.
- Migrované texty, volby a obtížnosti se automaticky porovnávají s nezměněným referenčním prototypem. Každý migrovaný následek má ověřené poškození a změny Hrozby/Rituálu.
- `npm run build` importuje validovaný obsah a vytváří statický výstup s relativními cestami.
- `git diff --check`: kontrola whitespace; prototypy a CSS nemají změny.
- Prohlížečový průchod se v tomto milníku nepodařilo provést: přímé browser tools vracely `openBrowserPage failed` / `readPage failed`, Computer Use hlásil `The browser access host is unavailable` a nativní okno nebylo dostupné pro snímání (`window is minimized`). Dosavadní prohlížečová kontrola M1 tuto novou změnu nepokrývá.

Před sloučením doporučujeme desktopovou kontrolu: první karta → volba → hod → jediný následek → reload → další karta; poté ukázková karta, výběr bez testu, blokace podmínek a nedostatku AP, reset během animace. DOM aplikace během animace dostává prázdný text výsledku; veřejná projekce je pokrytá automatickým testem.
