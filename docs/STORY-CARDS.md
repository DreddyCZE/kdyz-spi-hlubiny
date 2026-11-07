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
