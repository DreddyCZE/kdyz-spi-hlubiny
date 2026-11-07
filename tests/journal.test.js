import test from 'node:test';
import assert from 'node:assert/strict';
import { journalModel } from '../src/ui/journal.js';
import { newState, investigationView, transition } from '../src/engine/game.js';

const frozen = value => { Object.freeze(value); for (const item of Object.values(value)) if (item && typeof item === 'object') frozen(item); return value; };

test('journal starts empty and copies chronicle into chronological order', () => {
  const s = newState(), log = ['Nejnovější záznam', 'První záznam'];
  const model = journalModel(investigationView(s), log);
  for (const key of ['evidence', 'knowledge', 'deductions', 'available']) assert.deepEqual(model[key], []);
  assert.deepEqual(model.chronicle, ['První záznam', 'Nejnovější záznam']);
  assert.deepEqual(log, ['Nejnovější záznam', 'První záznam']);
});

test('real obtained evidence and explicit deductions are reflected without triggering them', () => {
  const s = { ...newState(), evidence: ['reward-2', 'reward-5'] };
  const before = structuredClone(s);
  const ready = journalModel(investigationView(s), s.log);
  assert.equal(ready.evidence.length, 2);
  assert.equal(ready.available[0].name, 'Kam vedou stopy');
  assert.equal(ready.knowledge.length, 0);
  assert.deepEqual(s, before);
  const n = transition(s, { type: 'deduce', revision: s.revision });
  const completed = journalModel(investigationView(n), n.log);
  assert.equal(completed.knowledge[0].name, 'Spojení s majákem');
  assert.equal(completed.deductions[0].count, 1);
  assert.deepEqual(completed.available, []);
});

test('journal allow-list excludes conditions, effects, locked choices and future outcomes', () => {
  const secret = 'NEVEŘEJNÝ TEXT';
  const view = frozen({ evidence: [{ name: 'Stopa', description: 'Popis', source: 'Přístav', effects: secret, conditions: secret, choices: secret, metadata: secret, outcomes: secret }], knowledge: [], deductions: [], available: [] });
  const model = journalModel(view);
  assert.deepEqual(model.evidence, [{ name: 'Stopa', description: 'Popis', source: 'Přístav' }]);
  assert.ok(!JSON.stringify(model).includes(secret));
  model.evidence[0].name = 'Jiný název';
  assert.equal(view.evidence[0].name, 'Stopa');
});

test('projection and journal rendering model do not expose unknown scenario information', () => {
  const model = journalModel(frozen(investigationView(newState())));
  const json = JSON.stringify(model);
  for (const hidden of ['Kam vedou stopy', 'Spojení s majákem', 'Deník zmizelého rybáře', 'effects', 'conditions']) assert.ok(!json.includes(hidden));
});
