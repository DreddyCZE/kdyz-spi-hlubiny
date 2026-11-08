import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {blackwaterContent as content} from '../src/engine/content.js';
import {createEvidenceStrategy} from '../src/engine/scenario-strategy.js';
import {simulateScenario} from '../src/engine/scenario-simulator.js';
test('strategy derives goals from knowledge and flags without named-story logic',()=>{
 const strategy=createEvidenceStrategy(blackwaterScenario,content);
 for(const id of ['reward-7','reward-9','reward-10','reward-11','reward-12','reward-14','reward-16'])assert.ok(strategy.goals.includes(id),id);
});
test('goal-oriented playthrough is reproducible',()=>{
 const strategy=createEvidenceStrategy(blackwaterScenario,content);
 const opts={seed:17,maxActions:400,...strategy};
 const first=simulateScenario(blackwaterScenario,content,opts);
 assert.deepEqual(first,simulateScenario(blackwaterScenario,content,opts));
 assert.ok(first.actions<=400);
});
