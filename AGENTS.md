# Pravidla dalšího vývoje

- Zachovej český jazyk, atmosféru vyšetřování a karetní koncept Když spí hlubiny.
- Referenční prototypy v `public/` neupravuj ani nemaž. Nová implementace je v `src/`.
- Herní pravidla patří do `src/engine/`, obsah do `src/data/`, DOM a animace do `src/ui/`. Engine nesmí záviset na prohlížeči.
- Používej nativní ES moduly a relativní cesty kompatibilní s GitHub Pages pod podadresářem. Nové závislosti přidávej jen s jasným důvodem.
- Efekty karet uváděj explicitně; nikdy neodvozuj mechaniky z příběhového textu. Text musí odpovídat efektům.
- Náhodu předávej tak, aby testy byly deterministické. Cena akce a následek tvoří jeden přechod stavu.
- Nové pravidlo či opravu mechaniky ověř regresním testem. Před předáním spusť `npm test`, `npm run build` a `git diff --check`; změny UI také ověř v prohlížeči.
- Nepřidávej vítěznou podmínku, dedukce nebo systém více postav jako vedlejší efekt refaktoringu. Změny pravidel popiš v `docs/design.md`.
- Ukládaný stav validuj a při změně schématu řeš verzi/migraci. Chyba úložiště nesmí shodit hru. Cizí text nevkládej přes `innerHTML`.
- Necommituj `dist/`, závislosti, tajné údaje nebo lokální uložené hry. Commit a push prováděj pouze v rozsahu požadavku uživatele.
