# Když spí hlubiny

Atmosférická karetní webová hra o vyšetřování u moře. Zachovává Eleanor Whitmore, sedm lokací a osm karet z prototypu 0.3. Herní aplikace nemá externí runtime knihovny; Node.js 22 nebo novější. Pro E2E testy se instalují vývojové závislosti a samostatné Chromium.

```sh
npm run dev
npm test
npm run build
```

Hru otevři na http://127.0.0.1:4173. HTML neotvírej přímo přes `file://`, ES moduly vyžadují HTTP. Produkční výstup lze ověřit příkazem `node scripts/serve.mjs dist`.

## Skutečné testy v prohlížeči

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run test:e2e:install
npm run test:e2e
```

E2E příkaz sám sestaví hru a spustí vlastní server na portu 4174; nevyžaduje ruční `npm run dev`. Testuje produkční výstup pod `/dist/` v Chromiu, takže ověřuje i relativní cesty pod podadresářem. Vývojový server na 4173 může běžet současně. `npm run test:e2e:headed` zobrazí prohlížeč, `npm run test:e2e:report` otevře lokální report. Podrobnosti, umístění souborů a diagnostika oprávnění: [E2E.md](docs/E2E.md).

- [Engine](src/engine/game.js): čisté přechody stavu a vyhodnocení kostek.
- [Karty](src/data/cards.js), [lokace](src/data/locations.js) a [registry odměn](src/data/catalog.js): stabilní ID, texty, možnosti a explicitní následky.
- [Rozhraní](src/ui/app.js): DOM, animace a ovládání.
- [Ukládání](src/engine/storage.js): verzovaný stav a validace.
- [Pravidla a opravy](docs/design.md), [pokyny vývoje](AGENTS.md).
- [Původní verze 0.3](public/legacy-prototype.html) a [další dodaná reference](public/reference-prototype.html) zůstávají samostatně spustitelné a nezměněné.

## GitHub Pages

V repozitáři nastav **Settings → Pages → Source → GitHub Actions**. Workflow při PR spustí testy a build; po pushi do `main` navíc publikuje `dist`. Relativní adresy podporují cestu `/kdyz-spi-hlubiny/` bez zvláštní konfigurace. Samotný build nic nepublikuje. Reference budou dostupné pod `public/`.

Hra ukládá automaticky do `localStorage` pod klíčem `hlubiny-v3`. Platné uložené hry M1 (`hlubiny-v1`) a M2.1 (`hlubiny-v2`) se převedou bez přepsání původních klíčů. Převod zachová herní postup a nespustí dedukce. Neplatná přítomná novější verze se nenahradí starší hrou; začne nový stav. Chyba úložiště nezastaví hru a po akci se zobrazí upozornění. Podrobnosti: [ENGINE.md](docs/ENGINE.md).

## M3.0.1 – digitální herní stůl

Responzivní mapa Blackwater, skutečná příběhová karta a spodní lišta přehledů nahrazují původní tabulkové rozhraní. Pravidla, veřejné API i uložené hry zůstávají kompatibilní. [UI a mapová metadata](docs/UI.md), [desktop](docs/test-artifacts/m3-0-1/desktop.png) a [mobil](docs/test-artifacts/m3-0-1/mobile.png).

## M2.2 – důkazy a dedukce

Deník odděluje získané důkazy, známé znalosti a provedené dedukce. „Vyhodnotit důkazy“ je bezplatná explicitní akce; před splněním podmínek se skryté dedukce ani budoucí znalosti nezobrazují. Obecný engine nemá pravidla Blackwater, jen datové operace a validátor. Tři existující důkazy ilustrují dvě cesty ke stejné znalosti. Sedm kol, rituál a obtížnosti se nemění.

Datový model a pravidla rozšíření: [DEDUCTION_SCHEMA.md](docs/DEDUCTION_SCHEMA.md). Blackwater definice jsou v [investigation.js](src/data/investigation.js); obecná implementace v [engine/investigation.js](src/engine/investigation.js).

## M2.1 – karty a rozhodnutí

Schéma a příklady jsou v [CARD_SCHEMA.md](docs/CARD_SCHEMA.md), pravidla a hranice milníku v [GAME_DESIGN.md](docs/GAME_DESIGN.md). Osm původních karet doplňuje jedna [ukázková karta](src/data/example-card.js) na konci přístavního balíčku. Ukazuje vlastní podmínky, cenu a výsledky každé volby i postup bez hodu. Limit zůstává 7 kol, rituál postupuje jako v M1. Grafický styl se nemění.

Validátor se spouští při vytvoření obsahu i během buildu. Nové karty musejí projít `validateCards`/`assertCards`; chybové hlášení uvádí cestu k problematickému poli. Jednorázový extraktor M1 byl odstraněn, aby nepřepsal nový formát.
