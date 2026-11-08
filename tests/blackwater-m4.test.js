import test from 'node:test';
import assert from 'node:assert/strict';
import { blackwaterM4Cards } from '../src/data/blackwater-m4.js';
import { content, createContent } from '../src/engine/content.js';
import { validateCards, outcomeKeys } from '../src/engine/schema.js';
import { newState, transition, currentCard, visibleResult } from '../src/engine/game.js';

test('M4 cards are registered, have stable unique IDs and valid references', () => {
  assert.equal(blackwaterM4Cards.length, 2);
  assert.equal(new Set(blackwaterM4Cards.map(c => c.id)).size, 2);
  assert.deepEqual(validateCards(content.cards, content.refs), []);
  for (const card of blackwaterM4Cards) {
    assert.ok(content.byId[card.id]);
    assert.equal(card.choices.length, 2);
    for (const choice of card.choices) assert.deepEqual(Object.keys(choice.outcomes).sort(), [...outcomeKeys].sort());
  }
});

test('M4 outcomes stay hidden until explicit resolution and effects apply only once', () => {
  const scenario = createContent(blackwaterM4Cards);
  let state = newState(scenario);
  state = transition(state, { type:'draw', revision:state.revision }, scenario);
  const publicCard = currentCard(state, scenario);
  assert.equal(publicCard.id, 'bw-00-01');
  assert.ok(!JSON.stringify(publicCard).includes('Rozpoznáš rytmus'));
  assert.equal(visibleResult(state, scenario), null);
  const revision = state.revision;
  const resolved = transition(state, { type:'resolve', revision, cardId:publicCard.id, choiceId:'bw-00-01-listen', dice:[4,4] }, scenario);
  assert.ok(resolved.evidence.includes('reward-5'));
  assert.equal(visibleResult(resolved, scenario).key, 'success');
  assert.equal(transition(resolved, { type:'resolve', revision, cardId:publicCard.id, choiceId:'bw-00-01-listen', dice:[4,4] }, scenario), resolved);
  const next = transition(resolved, { type:'next' }, scenario);
  assert.equal(currentCard(next, scenario), null);
});

test('second location provides independent evidence even without port success', () => {
  const scenario = createContent(blackwaterM4Cards);
  let state = newState(scenario);
  state = transition(state, { type:'move', locationId:'location-3' }, scenario);
  state = transition(state, { type:'draw', revision:state.revision }, scenario);
  assert.equal(currentCard(state, scenario).id, 'bw-03-01');
  state = transition(state, { type:'resolve', revision:state.revision, cardId:'bw-03-01', choiceId:'bw-03-01-interview', dice:[4,4] }, scenario);
  assert.ok(state.evidence.includes('reward-12'));
});
