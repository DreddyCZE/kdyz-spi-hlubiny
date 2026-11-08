import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {validateScenario} from '../src/engine/scenario.js';
test('malformed scenario arrays yield validation errors without crashing',()=>{
 for(const patch of [{clocks:null},{endings:null},{clocks:[null]},{endings:[null]},{endings:[{id:'x',kind:'victory',title:'X',conditions:[null]}]},{modules:null}]){
  assert.doesNotThrow(()=>validateScenario({...blackwaterScenario,...patch}));
  assert.ok(validateScenario({...blackwaterScenario,...patch}).length>0);
 }
});
test('clock definitions require scenario-clock module',()=>{
 assert.ok(validateScenario({...blackwaterScenario,modules:['conditional-events']}).some(e=>e.includes('scenario-clock')));
});
