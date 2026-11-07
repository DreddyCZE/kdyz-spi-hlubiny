# M3.1 – pracovní prezentace příběhové karty

- Dekorativní ilustrované záhlaví příběhové karty používá **dočasný výřez existující lokální mapy**, nikoli nově vygenerovaný finální asset.
- Po výběru testované volby se zobrazí šest neprůhledných zástupných polí; **texty ani efekty výsledků nejsou v DOM** až do skutečného vyhodnocení.
- Výsledek se po hodu odhalí stávajícím mechanismem, bez změny pravidel, ID karet, save, migrací a API.
- Nový E2E test prochází výběr, skryté výsledky, hod a odhalení.
- Obrázky navržené v chatu jsou vizuální koncept; **nejsou zatím uloženy v repozitáři**. Další krok: připravit optimalizované lokální WebP ilustrace a mapování `cardId → image` nezávislé na engine.

## Kontroly
CI se spustí po vytvoření PR. Před schválením je třeba potvrdit unit, E2E, build a vizuální kontrolu mobilu/desktopu.
