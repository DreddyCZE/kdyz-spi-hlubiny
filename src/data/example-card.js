// The sole M2.1 example. Choices deliberately have different costs and outcomes.
export const exampleCard = {
  id: 'harbor-note', type: 'evidence', locationId: 'location-0',
  title: 'Poznámka na molu', description: 'Pod kamenem leží promáčená poznámka. Část znaků připomíná zápis v rybářově deníku.',
  repeatable: false, conditions: [], choices: [
    { id: 'harbor-note-leave', label: 'Nechat poznámku na místě', apCost: 0,
      outcomes: { success: { text: 'Necháš poznámku pod kamenem a pokračuješ dál.', effects: [] } } },
    { id: 'harbor-note-copy', label: 'Porovnat ji s deníkem', apCost: 1,
      conditions: [{ type: 'hasEvidence', id: 'reward-2' }],
      outcomes: { success: { text: 'Porovnáním s deníkem získáš čitelný opis poznámky.', effects: [{ type: 'addEvidence', id: 'harbor-note-copy' }, { type: 'setFlag', id: 'harbor-note-read', value: true }] } } },
    { id: 'harbor-note-study', label: 'Rozluštit neznámé znaky', apCost: 2,
      test: { attribute: 'VĚ', difficulty: 9, modifier: 1 },
      outcomes: {
        criticalSuccess: { text: 'Rozluštíš všechny znaky a získáš opis. Obnovíš 1 SAN.', effects: [{ type: 'addEvidence', id: 'harbor-note-copy' }, { type: 'modifyStat', stat: 'san', amount: 1 }] },
        greatSuccess: { text: 'Rozluštíš poznámku a získáš její opis.', effects: [{ type: 'addEvidence', id: 'harbor-note-copy' }] },
        success: { text: 'Zachráníš čitelný opis poznámky.', effects: [{ type: 'addEvidence', id: 'harbor-note-copy' }] },
        partialSuccess: { text: 'Získáš opis, ale zneklidňující znaky tě připraví o 1 SAN.', effects: [{ type: 'addEvidence', id: 'harbor-note-copy' }, { type: 'modifyStat', stat: 'san', amount: -1 }] },
        failure: { text: 'Znaky nedávají smysl. Ztrácíš 1 SAN.', effects: [{ type: 'modifyStat', stat: 'san', amount: -1 }] },
        criticalFailure: { text: 'Při čtení se nad molem ozve výkřik. Hrozba +1.', effects: [{ type: 'modifyThreat', amount: 1 }] },
      } },
  ],
};
