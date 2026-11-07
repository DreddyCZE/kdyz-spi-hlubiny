import { attributes, evaluate } from '../engine/game.js';
import { outcomeKeys } from '../engine/schema.js';

// Derive presentation metadata from the public choice, without reading outcomes.
export function reachableOutcomeKeys(choice) {
  if (!choice?.test) return [];
  const { attribute, modifier = 0, difficulty } = choice.test;
  const reached = new Set();
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      reached.add(evaluate(a, b, attributes[attribute] + modifier, difficulty).key);
    }
  }
  return outcomeKeys.filter(key => reached.has(key));
}
