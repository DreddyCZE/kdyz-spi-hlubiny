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

Hra ukládá automaticky do `localStorage` pod klíčem `hlubiny-v2`. Validní uložené hry M1 (`hlubiny-v1`) se při prvním načtení převedou na stabilní ID předmětů, důkazů a voleb; původní klíč se nemění. Neplatný, příliš velký nebo neznámý stav zahájí novou hru. Pokud existuje v2, má přednost i v případě poškození (stará hra se samovolně neobnoví). Ukládání je validované; při odmítnutém přístupu hra pokračuje v paměti a po akci zobrazí upozornění.

## M2.1 – karty a rozhodnutí

Schéma a příklady jsou v [CARD_SCHEMA.md](docs/CARD_SCHEMA.md), pravidla a hranice milníku v [GAME_DESIGN.md](docs/GAME_DESIGN.md). Osm původních karet doplňuje jedna [ukázková karta](src/data/example-card.js) na konci přístavního balíčku. Ukazuje vlastní podmínky, cenu a výsledky každé volby i postup bez hodu. Limit zůstává 7 kol, rituál postupuje jako v M1. Grafický styl se nemění.

Validátor se spouští při vytvoření obsahu i během buildu. Nové karty musejí projít `validateCards`/`assertCards`; chybové hlášení uvádí cestu k problematickému poli. Jednorázový extraktor M1 byl odstraněn, aby nepřepsal nový formát.
