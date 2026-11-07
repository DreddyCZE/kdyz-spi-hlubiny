# Když spí hlubiny

Atmosférická karetní webová hra o vyšetřování u moře. Zachovává Eleanor Whitmore, sedm lokací a osm karet z prototypu 0.3. Bez externích knihoven a instalace závislostí; Node.js 22 nebo novější.

```sh
npm run dev
npm test
npm run build
```

Hru otevři na http://127.0.0.1:4173. HTML neotvírej přímo přes `file://`, ES moduly vyžadují HTTP. Produkční výstup lze ověřit příkazem `node scripts/serve.mjs dist`.

- [Engine](src/engine/game.js): čisté přechody stavu a vyhodnocení kostek.
- [Příběhová data](src/data/locations.js): texty, možnosti a explicitní následky.
- [Rozhraní](src/ui/app.js): DOM, animace a ovládání.
- [Ukládání](src/engine/storage.js): verzovaný stav a validace.
- [Pravidla a opravy](docs/design.md), [pokyny vývoje](AGENTS.md).
- [Původní verze 0.3](public/legacy-prototype.html) a [další dodaná reference](public/reference-prototype.html) zůstávají samostatně spustitelné a nezměněné.

## GitHub Pages

V repozitáři nastav **Settings → Pages → Source → GitHub Actions**. Workflow při PR spustí testy a build; po pushi do `main` navíc publikuje `dist`. Relativní adresy podporují cestu `/kdyz-spi-hlubiny/` bez zvláštní konfigurace. Samotný build nic nepublikuje. Reference budou dostupné pod `public/`.

Hra ukládá automaticky do `localStorage` pod klíčem `hlubiny-v1`. Při odmítnutém přístupu pokračuje v paměti a po akci zobrazí upozornění. Poškozený či nekompatibilní stav zahájí novou hru. Staré save soubory se nemigrují: mění se evidence vyřešených karet; původní klíče zůstávají nedotčené.
