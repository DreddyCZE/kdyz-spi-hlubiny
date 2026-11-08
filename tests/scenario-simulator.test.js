import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {blackwaterContent as content} from '../src/engine/content.js';
import {seededDice,simulateScenario,simulateBatch} from '../src/engine/scenario-simulator.js';
test('seeded dice are reproducible and within range',()=>{
 const a=seededDice(42),b=seededDice(42);
 for(let i=0;i<30;i++){const x=a();assert.deepEqual(x,b());assert.ok(x.every(n=>n>=1&&n<=6));}
});
test('full engine playthrough is deterministic and bounded',()=>{
 const a=simulateScenario(blackwaterScenario,content,{seed:7,maxActions:250});
 const b=simulateScenario(blackwaterScenario,content,{seed:7,maxActions:250});
 assert.deepEqual(a,b);
 assert.ok(a.actions<=250);
 assert.ok(a.round>=1&&a.round<=13);
 assert.ok(a.trace.every(step=>step.ap>=0&&step.ap<=3));
});
test('batch reports exactly requested number of outcomes',()=>{
 const batch=simulateBatch(blackwaterScenario,content,{runs:12,seed:123,maxActions:250});
 assert.equal(Object.values(batch.outcomes).reduce((a,b)=>a+b,0),12);
 assert.equal(batch.samples.length,5);
});
