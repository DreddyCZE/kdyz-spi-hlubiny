// Public location themes contain no card IDs, upcoming titles or outcome definitions.
export const explorationDecks = [
  ['location-0','Mlžná mola','Příliv přináší cizí svědectví a stopy zmizelých lodí.'],
  ['location-1','Za zavřenými dveřmi','Pod prahy a v opuštěných ulicích přetrvávají zprávy.'],
  ['location-2','Zapovězený archiv','Staré záznamy čekají na trpělivého čtenáře.'],
  ['location-3','Neklidná oddělení','Za okny ústavu se skrývají svědectví.'],
  ['location-4','Pod mokrou hlínou','Náhrobky střeží paměť pobřeží.'],
  ['location-5','Světlo nad přílivem','Paprsek majáku protíná hlubokou tmu.'],
  ['location-6','Cesta pod skálou','Příliv odkrývá tajemství černých chodeb.'],
].map(([locationId,name,description])=>Object.freeze({locationId,name,description}));
