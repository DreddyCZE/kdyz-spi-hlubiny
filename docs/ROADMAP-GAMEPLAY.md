# Roadmap k hratelnému Blackwater (M4–M7)

> Historický plán. Aktuální audit implementace, překryvů větví a zbývající práce je v [AUTONOMOUS-STATUS.md](AUTONOMOUS-STATUS.md). Níže uvedená výchozí realita předchází scénářovému frameworku a integraci U2/U3; není aktuálním seznamem chybějících funkcí.

## Aktuální realita
- Default hra a save v4 jsou stabilní; M4 karty jsou samostatný balíček, zatím bez voliče scénářů.
- Izolované moduly `combat.js` a `myth.js` mají unit testy, **nejsou připojené k UI ani k ukládání**.
- M3.4 animace, zvuk a příběhová prezentace jsou samostatné paralelní úkoly #12–#14.
- Dnešní prototyp mýtu používá pevné pořadí událostí; později je nutné seedované míchání a podmíněné události.

## Pořadí implementace a definition of done

### M4.3 — Scénářový runtime
- Výběr scénáře: legacy vs Zvony pod přílivem; nový save namespace; žádná změna starých save.
- Propojit 7 M4 karet s balíčky a doplnit navazující dedukce.
- Přidat scenario result včetně výher, variantních konců a migrací.
- E2E scénáře od startu po konec; vyvážit AP a sedm kol.

### M5.1 — Mýtus a živá mapa
- Samostatná fáze mýtu po hráčově kole, pouze jednou na kolo.
- Viditelná událost po otočení, nepřátelé a anomálie na konkrétních lokacích.
- Přidat pohyb nepřátel podle jednoduchého pravidla a bezpečné únikové cesty.
- Persistovat seed, cursor, historii a entity; nepřipustit dvojí vyhodnocení po reloadu.
- Výchozí hra nesmí změnit chování.

### M5.2 — Boj
- Napojit `combat.js` na nepřátele na mapě; 2k6 a max tři výměny.
- Stav boje, odměny, zranění a útěk uložit atomicky.
- Zvláštní akce vyžadující znalosti/předměty; všechny povinné stopy přístupné bez boje.
- Testy pro refresh, replay, double-click, mobile, accessibility.

### M5.3 — Inventář
- Použitelné vybavení (zbraně, nástroje, spotřební, příběhové).
- Jasně vyznačené náklady, jednorázové použití a dostupné akce.
- Stabilní ID a žádné duplicitní odměny.

### M6 — Vyšetřovatelé
- 3 postavy, rozdílné atributy, 1 pasivní + 1 aktivní schopnost, počáteční výbava.
- Nevyžadovat jednu konkrétní postavu k dohrání; simulovat všechny kombinace.

### M7 — Atmosféra a dokončení
- Implementovat M3.4 A/B/C bez spoilerů a autoplay porušení.
- Originální ilustrace karet a konzistentní mapa; stavové animace, přístupnost a reduced motion.
- Příběhové návaznosti, 4 zakončení, balancing a kompletní 60–90min průchod.
- Testy 320/390/1440, keyboard, 2k6, save/reload, všechny konce.

## Rozhodnutí k designu
- Hrozba a rituál jsou odlišné osy: hrozba řídí tlak světa, rituál konec scénáře.
- Mýtus nemá vždy pouze škodit: minimálně třetina událostí nabídne alternativní stopu či příležitost.
- Nepřátelé nejsou farmitelné zdroje; útěk musí být legitimní strategie.
- Důkazy z neúspěšných akcí lze získat jinou cestou.
