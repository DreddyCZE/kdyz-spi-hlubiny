# Ověření refaktoringu

Provedeno 7. listopadu 2026 na Node.js 24.16.0.

- `npm test`: 9 testů prošlo, 0 selhání.
- `npm run build`: vytvořen statický výstup `dist/`.
- Prohlížeč: výběr druhého postupu, hod, zakázané ukončení kola během hodu, zobrazení výsledku, reload se stejným výsledkem, další karta a přesun s odečtením AP.
- Mobilní viewport 390 × 844: jednosloupcové rozložení, bez vodorovného přetečení.
- Produkční build pod `/dist/`: moduly načteny, sedm ukončení kola vede k porážce a zablokování hodu; reset obnoví 3 AP. Bez zachycených JavaScriptových chyb během tohoto průchodu.
- SHA-256 referenční v0.3: `116C2321C31180BC19C9E3077239CD0A23C78A0438D6E0F803C6341EC05DBCAE`.
- SHA-256 další reference odpovídá souboru z Downloads: `8622222E6EE5738B022904BEE06C9DD2E0765FB13B870DF5F691B814FE11F290`.

GitHub Actions a vzdálené publikování se lokálně nespouštěly. Pro publikování je potřeba zvolit GitHub Actions jako zdroj Pages a odeslat změny do `main`. Testy enginu a úložiště běží automaticky v CI; popsané prohlížečové průchody byly jednorázovou kontrolou a nejsou zatím součástí CI.
