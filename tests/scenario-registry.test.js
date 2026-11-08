import test from 'node:test';
import assert from 'node:assert/strict';
import {createScenarioRegistry} from '../src/engine/scenario-registry.js';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {content} from '../src/engine/content.js';
import {presentation} from '../src/data/presentation.js';
import {newScenarioSession} from '../src/engine/scenario-session.js';
import {saveScenarioSession,loadScenarioSession,scenarioSaveKey} from '../src/engine/scenario-storage.js';
const pack=scenario=>({scenario,content,presentation,locations:presentation.locations});
test('registry selects independent scenario packs',()=>{
 const second={...blackwaterScenario,id:'house-outside-time',title:'Dům mimo čas'};
 const registry=createScenarioRegistry([pack(blackwaterScenario),pack(second)]);
 assert.deepEqual(registry.ids,['blackwater-bells','house-outside-time']);
 assert.equal(registry.get('house-outside-time').scenario.title,'Dům mimo čas');
 assert.throws(()=>createScenarioRegistry([pack(blackwaterScenario),pack(blackwaterScenario)]),/Duplicate/);
});
test('different scenarios never overwrite each other in local storage',()=>{
 const second={...blackwaterScenario,id:'house-outside-time'};
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const a=newScenarioSession(blackwaterScenario,content),b=newScenarioSession(second,content);
 assert.notEqual(scenarioSaveKey(blackwaterScenario),scenarioSaveKey(second));
 assert.equal(saveScenarioSession(storage,a,blackwaterScenario,content),true);
 assert.equal(saveScenarioSession(storage,b,second,content),true);
 assert.deepEqual(loadScenarioSession(storage,blackwaterScenario,content),a);
 assert.deepEqual(loadScenarioSession(storage,second,content),b);
});
