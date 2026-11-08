import test from 'node:test';
import assert from 'node:assert/strict';
import { reachableOutcomeKeys } from '../src/ui/story-card.js';
import { currentCard, newState, transition } from '../src/engine/game.js';

test('preview derives reachable tiers from public parameters, without hidden outcomes', () => {
  const choice = currentCard(transition(newState(),{type:'draw',revision:0})).choices[0];
  assert.equal(reachableOutcomeKeys(choice).length, 6);
  assert.deepEqual(reachableOutcomeKeys({ test: { attribute: 'VN', difficulty: 99 } }),
    ['criticalSuccess', 'failure', 'criticalFailure']);
  assert.deepEqual(reachableOutcomeKeys({ test: { attribute: 'VN', difficulty: 1, modifier: 20 } }),
    ['criticalSuccess', 'greatSuccess', 'criticalFailure']);
  assert.deepEqual(reachableOutcomeKeys({}), []);
  assert.deepEqual(reachableOutcomeKeys(null), []);
});
