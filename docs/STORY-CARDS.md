# M3.1 – pracovní prezentace příběhové karty

- Dekorativní ilustrované záhlaví příběhové karty používá **dočasný výřez existující lokální mapy**, nikoli nově vygenerovaný finální asset.
- Po výběru testované volby se zobrazí šest neprůhledných zástupných polí; **texty ani efekty výsledků nejsou v DOM** až do skutečného vyhodnocení.
- Výsledek se po hodu odhalí stávajícím mechanismem, bez změny pravidel, ID karet, save, migrací a API.
- Nový E2E test prochází výběr, skryté výsledky, hod a odhalení.
- Obrázky navržené v chatu jsou vizuální koncept; **nejsou zatím uloženy v repozitáři**. Další krok: připravit optimalizované lokální WebP ilustrace a mapování `cardId → image` nezávislé na engine.

## Kontroly
CI se spustí po vytvoření PR. Před schválením je třeba potvrdit unit, E2E, build a vizuální kontrolu mobilu/desktopu.

## Mapování ilustrací
`src/data/story-art.js` obsahuje registr `byCardId`, volitelný `byLocationId` a `fallback`. Přednost má stabilní ID karty, potom lokace a nakonec existující WebP mapa. Všechna URL jsou relativní vůči kořeni aplikace a v UI se řeší přes `document.baseURI`, aby fungoval i deploy pod `/dist/`. Registr neovlivňuje pravidla ani save.

**Pozor:** finální ilustrace z chatu dosud nebyly nahrány jako soubory do GitHubu. Před přidáním cest musí být odpovídající optimalizované WebP skutečně commitnuté.

## Akceptační kontrola
- Testovat na šířkách 1440, 390 a 320 px: karta nepřetéká vodorovně, výřez zůstává viditelný, šest zástupných polí nepřekrývá volby.
- Pod `/dist/` musí načtená grafika vrátit HTTP 200 a validní WebP signaturu.
- Před hodem se nesmí v DOM objevit žádný text ani efekt konkrétního výsledku; po hodu se zobrazí pouze vyhodnocený následek.
- Po reloadu musí zůstat uložený výsledek a nesmí se opakovat odměna.
- Finální ilustrace vyžadují samostatné přidání binárních souborů; samotný obrazový mockup není integrovaný asset.
