# Chromium E2E na Windows a v GitHub Actions

## Instalace a spouštění

Ověř `node --version` a `npm --version`; projekt vyžaduje Node.js ≥22. V tomto prostředí ověřeno Node.js 24.16.0, npm 11.13.0 a Playwright 1.65.0. Verze npm balíčků jsou připnuté v [package-lock.json](../package-lock.json).

Z kořene projektu:

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run test:e2e:install
npm run test:e2e
```

Instalace prohlížeče stáhne jen Chromium a podpůrné součásti Playwrightu (headless shell, FFmpeg a na Windows Winldd). Neinstaluje ani nemění systémový Chrome. Po aktualizaci Playwrightu instalaci zopakuj, protože jednotlivé verze potřebují odpovídající browser binaries. Viz [oficiální správa browserů](https://playwright.dev/docs/browsers).

[Wrapper](../scripts/playwright.mjs) nastavuje procesové proměnné pro všechny podporované platformy:

| Obsah | Adresář v projektu |
| --- | --- |
| Chromium a podpůrné binárky (`PLAYWRIGHT_BROWSERS_PATH`) | `.cache/ms-playwright/` |
| Dočasné browser profily (`TEMP`, `TMP`, `TMPDIR`) | `.cache/tmp/` |
| npm cache a logy (`.npmrc`, `npm_config_cache`) | `.cache/npm/` |
| HTML report | `playwright-report/` |
| Snímky, failure traces a výsledky | `test-results/` |

Tyto adresáře Git ignoruje. Wrapper nemění uživatelské ani systémové proměnné. Používej projektové `npm run test:e2e:*` příkazy; holé `npx playwright install` by bez proměnné mohlo použít výchozí browser cache mimo projekt.

`npm run test:e2e:headed` zobrazí testovací Chromium. `npm run test:e2e:report` zpřístupní HTML report pouze na loopback rozhraní. Report a snímky nejsou součástí commitu.

## Co smoke test ověřuje

[Smoke test](../e2e/game.spec.js) otevře produkční build, vybere druhý postup, zkontroluje prázdný obsah skrytých následků, provede deterministický hod 4+4 přes skutečné ovládání a ověří odečet 1 AP. Během animace kontroluje blokaci akcí a prázdný text výsledku. Pak ověří dosažený následek, český název důkazu a shodný uložený stav po reloadu. Karta nejde znovu hodit. Nakonec přejde na další kartu a kontroluje absenci JavaScriptových chyb.

Každý test používá nový izolovaný browser context; osobní rozehraná hra se nemění. Náhoda se řídí jen v testovacím kontextu, engine zůstává původní. Browser clock řídí časovač animace bez pevných čekání. Úspěšný průchod ukládá snímek `game-after-reload.png`; při snímání dokončí CSS animace, aby nebyl text zachycen na počáteční nulové průhlednosti.

[Konfigurace](../playwright.config.mjs) automaticky spustí build a vlastní HTTP server na `127.0.0.1:4174`, testuje cestu `/dist/` a po testu server ukončí. Existující server se nepřebírá; obsazený port 4174 je chyba vyžadující uvolnění portu. Server pro ruční vývoj se spouští nezávisle `npm run dev` na portu 4173 a zůstává běžet, dokud jej uživatel neukončí.

## GitHub Actions

[Workflow](../.github/workflows/pages.yml) provede `npm ci`, unit testy, instalaci Chromia a E2E test nad novým buildem. E2E je součástí jobu, na který čeká publikování Pages; selhání tak zabrání publikaci. Failure report a traces se uchovávají jako artifact 7 dní. Systémové závislosti `--with-deps` se instalují pouze do dočasného GitHub-hosted Linux runneru, nikoli do lokálních Windows. Viz [oficiální CI postup](https://playwright.dev/docs/ci-intro).

## Výsledky lokálního ověření

7. listopadu 2026 prošla čistá instalace `npm ci`, všech 19 unit testů, produkční build a jeden skutečný Chromium E2E smoke test. Proběhla také ruční kontrola integrovaného browseru a vizuální kontrola plného desktopového snímku v rozlišení 1280 × 900 (snímek celé stránky); ovládání a odhalený následek byly čitelné, bez překryvů. Reference ani herní zdrojové soubory se nezměnily. GitHub-hosted Linux průchod je samostatná kontrola při otevření PR, nikoli součást tohoto lokálního výsledku.

## Diagnostika integrovaného browseru

Po opravě připomínky k deníku a začlenění PR #2 do M2.1 bylo ověření rozšířeno: **21/21 unit testů a 4/4 Chromium E2E testy prošly**. Tři nové browser průchody ověřují dostupnost porovnání poznámky po běžném, velkém i kritickém úspěchu na Ztracené lodi, včetně reloadu před rozhodnutím. Podrobný záznam je v [verification-m21.md](verification-m21.md).

7. listopadu 2026 byly dostupné nástroje `openBrowserPage`, `readPage`, `navigatePage`, `runPlaywrightCode`, `screenshotPage` a ovládání prvků. První dva vracely obecné chyby; inventář Computer Use současně vracel `browsers: []` a `The browser access host is unavailable`. To potvrzuje tehdejší nedostupnost browser hostu, ale nedokazuje konkrétní chybu instalace ani chybějící oprávnění. Copilot session log nebyl na obvyklém místě nalezen, takže z něj nelze odvodit podrobnější příčinu.

Po explicitním spuštění `npm run dev` a zpřístupnění nové browser stránky začaly `navigatePage`, `readPage` i `runPlaywrightCode` fungovat. Na portu 4173 byl ověřen výběr volby, hod, blokace akcí, výsledek, reload, další karta, přesun a beztestové rozhodnutí. Nelze zpětně oddělit vliv obnoveného hostu od předchozí nedostupnosti serveru. Samostatný screenshot nástroj nadále selhával, proto byla vizuální kontrola provedena ze snímku lokálního Playwright Chromia.

## Co přesně povolit při omezení Codexu

Při této instalaci nebylo nutné měnit globální nastavení Codexu, Windows ani bezpečnostní ochrany. Sandbox ale opakovaně hlásil `Failed to create unified exec process: helper_unknown_error: setup refresh had errors` ještě před spuštěním příkazu. Dotčené příkazy uspěly po schváleném spuštění mimo sandbox. Nejde o chybu herního serveru nebo smoke testu.

Pokud se omezení opakuje, schvaluj konkrétní žádosti pro tuto složku:

1. **Instalace balíčků:** `npm ci --ignore-scripts --no-audit --no-fund`, síť k `registry.npmjs.org` a zápis do projektového `node_modules/` a `.cache/npm/`.
2. **Stažení Chromia:** `npm run test:e2e:install`, HTTPS ke skutečným download/CDN adresám uvedeným v chybě (při tomto běhu `cdn.playwright.dev`) a zápis do `.cache/ms-playwright/` i `.cache/tmp/`.
3. **E2E:** `npm run test:e2e`, spuštění lokálního Chromium procesu, lokálního HTTP serveru na `127.0.0.1:4174` a zápis reportů/cache uvnitř projektu.
4. **Ruční prohlídka:** `npm run dev`, server na `127.0.0.1:4173` a sdílení konkrétní lokální stránky s browser nástroji.

Pokud Codex nabídne spuštění mimo sandbox, vztahuje se schválení na uvedený příkaz; zápisy zůstávají směrované do projektu. Tato konfigurace nevyžaduje trvalý globální Full Access. Přesné pojmenování ovladačů závisí na hostitelské aplikaci; z obecných chyb nelze tvrdit, že existuje konkrétní vypnutý přepínač. Oprávnění filesystemu a sítě jsou samostatná, viz [oficiální dokumentace zabezpečení](https://developers.openai.com/codex/security).

Pokud by instalace požadovala změnu mimo projekt, zastav ji a vyžádej souhlas. Nestahuj browser výchozím příkazem do AppData, nepřidávej firewall výjimku ani neměň antivir jako náhradu za diagnostiku.
