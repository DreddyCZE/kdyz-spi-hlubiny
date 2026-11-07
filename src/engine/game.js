import { locations } from '../data/locations.js';

export const attributes = Object.freeze({ SÍ: 1, OB: 2, VĚ: 3, VŮ: 2, VN: 2 });
export const labels = ['Velký úspěch', 'Úspěch', 'Částečný úspěch', 'Neúspěch', 'Kritické selhání'];
export function newState() {
  return { version: 1, place: 0, round: 1, ap: 3, threat: 2, ritual: 1,
    hp: 6, san: 8, inventory: [], indices: {}, choice: 0, resolved: {},
    result: null, ended: false, log: ['Vyšetřování začíná. Rozhodni, co uděláš.'] };
}
export function currentCard(s) {
  return locations[s.place].cards[s.indices[s.place] || 0] || null;
}
export function evaluate(a, b, bonus, difficulty) {
  if (![a, b].every(n => Number.isInteger(n) && n >= 1 && n <= 6)) throw new RangeError('Neplatná kostka');
  const total = a + b + bonus, margin = total - difficulty;
  return { dice: [a, b], total, index: a === 1 && b === 1 ? 4 : a === 6 && b === 6 ? 0 : margin >= 3 ? 0 : margin >= 0 ? 1 : margin >= -2 ? 2 : 3 };
}
export function rollDice(random = Math.random) {
  return [1 + Math.floor(random() * 6), 1 + Math.floor(random() * 6)];
}
function checkEnd(s) {
  s.ended = s.hp <= 0 || s.san <= 0 || s.threat >= 10 || s.ritual >= 8 || s.round > 7;
  if (s.ended) s.log.unshift('Konec scénáře: temnota zvítězila.');
}
// Pure transitions: callers retain their original state. Dice are supplied by the caller.
export function transition(state, action) {
  if (state.ended) return state;
  const s = structuredClone(state), card = currentCard(s);
  switch (action.type) {
    case 'move':
      if (!Number.isInteger(action.place) || !locations[action.place] || action.place === s.place || s.ap < 1) return state;
      s.ap--; s.place = action.place; s.choice = 0; s.result = null;
      s.log.unshift('Přesun: ' + locations[s.place].name); break;
    case 'choose':
      if (!card || s.resolved[card.id] || !Number.isInteger(action.choice) || !card.choices[action.choice]) return state;
      s.choice = action.choice; break;
    case 'roll': {
      if (!card || s.resolved[card.id] || s.ap < 1) return state;
      const option = card.choices[s.choice];
      const result = evaluate(...action.dice, attributes[option.attribute], card.difficulty);
      const outcome = card.outcomes[result.index];
      s.ap--; s.result = { ...result, cardId: card.id, choice: s.choice }; s.resolved[card.id] = s.result;
      for (const key of ['hp', 'san', 'threat', 'ritual']) s[key] = Math.max(0, Math.min({ hp: 6, san: 8, threat: 10, ritual: 8 }[key], s[key] + outcome.effects[key]));
      if (outcome.item && !s.inventory.includes(outcome.item)) s.inventory.push(outcome.item);
      s.log.unshift(card.title + ': ' + labels[result.index]); checkEnd(s); break;
    }
    case 'next':
      if (!card || !s.resolved[card.id]) return state;
      s.indices[s.place] = (s.indices[s.place] || 0) + 1; s.choice = 0; s.result = null; break;
    case 'endRound':
      if (s.round < 7) { s.round++; s.ap = 3; } else s.ap = 0;
      s.ritual = Math.min(8, s.ritual + 1);
      s.log.unshift('Nové kolo. Rituál postupuje.'); checkEnd(s); break;
    default: return state;
  }
  s.log = s.log.slice(0, 100);
  return s;
}
