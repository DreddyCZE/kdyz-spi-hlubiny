import test from 'node:test';
import assert from 'node:assert/strict';
import {createScenario,validateScenario,initialScenarioState,availableEndings,chooseEnding,advanceClock} from '../src/engine/scenario.js';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
const initial=()=>initialScenarioState(def);
test('scenario definition is validated, immutable, and initial state isolated',()=>{
 assert.deepEqual(validateScenario(def),[]);
 assert.equal(Object.isFrozen(def),true);
 const a=initial(),b=initial();a.clocks['tide-bells']=5;assert.equal(b.clocks['tide-bells'],1);
});
test('schema rejects invalid IDs, duplicate endings and unsupported modules',()=>{
 const bad=structuredClone(def);bad.modules.push('unknown');bad.endings.push({...bad.endings[0]});bad.id='BAD';
 const e=validateScenario(bad);assert.ok(e.some(x=>x.startsWith('modules')));assert.ok(e.some(x=>x.startsWith('endings')));assert.ok(e.some(x=>x.startsWith('id')));
 assert.throws(()=>createScenario(bad),/Invalid scenario/);
});
test('clock events are idempotent and bounded, ending locks clock',()=>{
 let s=initial();s=advanceClock(def,s,'tide-bells',3,'event-1');assert.equal(s.clocks['tide-bells'],4);
 assert.strictEqual(advanceClock(def,s,'tide-bells',3,'event-1'),s);
 s=advanceClock(def,s,'tide-bells',50,'event-2');assert.equal(s.clocks['tide-bells'],7);
 const ended=chooseEnding(def,{},s,'deep-answers');assert.equal(ended.endingId,'deep-answers');
 assert.strictEqual(advanceClock(def,ended,'tide-bells',-2,'event-3'),ended);
});
test('three knowledge paths and prepared signal open best ending',()=>{
 const g={knowledge:['knowledge-voice','knowledge-name','knowledge-body'],flags:{'signal-ready':true,'bell-reachable':true}};
 assert.ok(availableEndings(def,g,initial()).some(e=>e.id==='quiet-sea'));
 const chosen=chooseEnding(def,g,initial(),'quiet-sea');
 assert.equal(chosen.endingId,'quiet-sea');
 assert.strictEqual(chooseEnding(def,g,chosen,'broken-bell'),chosen);
});
test('costly and sacrifice endings are independent of best ending',()=>{
 const g={knowledge:['knowledge-body','knowledge-voice'],flags:{'bell-reachable':true}};
 assert.deepEqual(availableEndings(def,g,initial()).map(e=>e.id),['broken-bell','voice-price']);
 assert.strictEqual(chooseEnding(def,g,initial(),'quiet-sea').endingId,null);
});
test('clock threshold gates victory and defeat',()=>{
 let s=advanceClock(def,initial(),'tide-bells',6,'last-bell');
 const g={knowledge:['knowledge-voice','knowledge-name','knowledge-body'],flags:{'signal-ready':true,'bell-reachable':true}};
 assert.deepEqual(availableEndings(def,g,s).map(e=>e.id),['deep-answers']);
});
test('different scenario works without modifying engine',()=>{
 const other=createScenario({id:'forest-hunt',version:1,title:'Lovec v mlze',rules:{apPerRound:2,maxRounds:8,deductionMode:'manual'},modules:[],locations:['forest'],clocks:[],endings:[{id:'escape',title:'Únik',kind:'victory',conditions:[{type:'flagEquals',id:'escaped',value:true}]}]});
 assert.equal(availableEndings(other,{flags:{escaped:true}},initialScenarioState(other))[0].id,'escape');
});
