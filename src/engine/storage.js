import { newState, currentCard, evaluate, attributes } from './game.js';
import { locations } from '../data/locations.js';
export const SAVE_KEY = 'hlubiny-v1';
export function validState(s) {
  if (!s || s.version !== 1) return false;
  const ranges = { place: [0, locations.length - 1], round: [1, 7], ap: [0, 3], hp: [0, 6], san: [0, 8], threat: [0, 10], ritual: [0, 8], choice: [0, 1] };
  if (!Object.entries(ranges).every(([key, [min, max]]) => Number.isInteger(s[key]) && s[key] >= min && s[key] <= max)) return false;
  if (typeof s.ended !== 'boolean' || s.ended !== (s.hp === 0 || s.san === 0 || s.threat === 10 || s.ritual === 8)) return false;
  if (![s.inventory, s.log].every(a => Array.isArray(a) && a.length <= 100 && a.every(x => typeof x === 'string' && x.length < 2000))) return false;
  if (!s.indices || !s.resolved || Array.isArray(s.indices) || Array.isArray(s.resolved) || typeof s.indices !== 'object' || typeof s.resolved !== 'object') return false;
  if (!Object.entries(s.indices).every(([key, n]) => /^\d+$/.test(key) && locations[key] && Number.isInteger(n) && n >= 0 && n <= locations[key].cards.length)) return false;
  const cards = locations.flatMap(l => l.cards);
  for (const [id, r] of Object.entries(s.resolved)) {
    const card = cards.find(c => c.id === id);
    if (!card || !r || r.cardId !== id || !Number.isInteger(r.choice) || !card.choices[r.choice] || !Array.isArray(r.dice) || r.dice.length !== 2) return false;
    try {
      const expected = evaluate(...r.dice, attributes[card.choices[r.choice].attribute], card.difficulty);
      if (r.total !== expected.total || r.index !== expected.index) return false;
    } catch { return false; }
  }
  const card = currentCard(s);
  return s.result === null || Boolean(card && JSON.stringify(s.result) === JSON.stringify(s.resolved[card.id]));
}
export function load(storage) {
  try { const s = JSON.parse(storage.getItem(SAVE_KEY)); return validState(s) ? s : newState(); }
  catch { return newState(); }
}
export function save(storage, state) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}
