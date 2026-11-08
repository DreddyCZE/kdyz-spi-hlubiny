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
 assert.ok(a.attempts<=250);
 assert.equal(a.exhausted,a.attempts===250&&!a.endingId);
 assert.ok(a.round>=1&&a.round<=13);
 assert.ok(a.trace.every(step=>step.ap>=0&&step.ap<=3));
});
test('batch reports exactly requested number of outcomes',()=>{
 const batch=simulateBatch(blackwaterScenario,content,{runs:12,seed:123,maxActions:250});
 assert.equal(Object.values(batch.outcomes).reduce((a,b)=>a+b,0),12);
 assert.equal(batch.samples.length,5);
 assert.ok(Number.isInteger(batch.exhausted)&&batch.exhausted>=0&&batch.exhausted<=12);
 assert.equal(Object.values(batch.unfinishedReasons).reduce((a,b)=>a+b,0),batch.outcomes.unfinished||0);
 assert.ok(Object.values(batch.knowledgeCounts).every(n=>n>=1&&n<=12));
 for(const [id,stats] of Object.entries(batch.endingRoundStats)){
  assert.equal(stats.count,batch.outcomes[id]);
  assert.ok(stats.min<=stats.mean&&stats.mean<=stats.max);
 }
});

test('single-attempt budget reports exhaustion rather than pretending completion',()=>{
 const r=simulateScenario(blackwaterScenario,content,{seed:1,maxActions:1});
 assert.equal(r.attempts,1);
 assert.equal(r.exhausted,true);
 assert.equal(r.endingId,null);
});

test('an action-limited batch counts unfinished reasons separately from endings',()=>{
 const batch=simulateBatch(blackwaterScenario,content,{runs:3,maxActions:1});
 assert.equal(batch.exhausted,3);
 assert.equal(batch.unfinishedReasons['action-limit'],3);
 assert.equal(batch.outcomes.unfinished,3);
});

test('conditional reroll policy is reproducible and receives actual result tiers',()=>{
 const tiers=[];
 const policy=({game,result})=>{tiers.push(result.key);return game.san>=5&&['failure','criticalFailure'].includes(result.key);};
 const a=simulateScenario(blackwaterScenario,content,{seed:42,maxActions:500,reroll:policy});
 assert.ok(tiers.length>0);
 assert.ok(tiers.every(k=>['criticalFailure','failure','partialSuccess','success','greatSuccess','criticalSuccess'].includes(k)));
 const b=simulateScenario(blackwaterScenario,content,{seed:42,maxActions:500,reroll:({game,result})=>game.san>=5&&['failure','criticalFailure'].includes(result.key)});
 assert.deepEqual(a,b);
});

test('simulator can choose alternative ending without changing scenario rules',()=>{
 const chooseEnding=endings=>endings.find(e=>e.kind==='sacrifice')||endings[0];
 const result=simulateScenario(blackwaterScenario,content,{seed:42,maxActions:500,chooseEnding});
 assert.ok(result.endingId===null||['voice-price','deep-answers','quiet-sea','broken-bell'].includes(result.endingId));
 assert.deepEqual(result,simulateScenario(blackwaterScenario,content,{seed:42,maxActions:500,chooseEnding}));
});
