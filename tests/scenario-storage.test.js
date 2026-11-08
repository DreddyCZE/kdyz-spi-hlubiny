import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {content} from '../src/engine/content.js';
import {newScenarioSession,scenarioSessionTransition} from '../src/engine/scenario-session.js';
import {validScenarioSession,loadScenarioSession,saveScenarioSession,SCENARIO_SAVE_KEY} from '../src/engine/scenario-storage.js';
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),map};};
test('new scenario save is valid and isolated from legacy key',()=>{
 const s=newScenarioSession(def,content),db=storage();
 assert.equal(validScenarioSession(s,def,content),true);
 assert.equal(saveScenarioSession(db,s,def,content),true);
 assert.equal(db.map.has('hlubiny-v4'),false);
 assert.deepEqual(loadScenarioSession(db,def,content),s);
});
test('round 10 save reload survives legacy seven-round validator',()=>{
 const db=storage();let s=newScenarioSession(def,content);
 for(let i=0;i<9;i++)s=scenarioSessionTransition(s,{type:'endRound',revision:s.game.revision},def,content);
 assert.equal(s.game.round,10);
 assert.equal(saveScenarioSession(db,s,def,content),true);
 assert.deepEqual(loadScenarioSession(db,def,content),s);
});
test('tampered scenario clock or unknown ending resets to clean session',()=>{
 const db=storage();let s=newScenarioSession(def,content);
 s.scenario.clocks['tide-bells']=100;
 db.setItem(SCENARIO_SAVE_KEY,JSON.stringify(s));
 assert.equal(loadScenarioSession(db,def,content).scenario.clocks['tide-bells'],1);
 s=newScenarioSession(def,content);s.scenario.endingId='hacked';
 assert.equal(validScenarioSession(s,def,content),false);
});
test('last bell persists as terminal ending',()=>{
 const db=storage();let s=newScenarioSession(def,content);
 for(let i=0;i<12;i++)s=scenarioSessionTransition(s,{type:'endRound',revision:s.game.revision},def,content);
 assert.equal(s.scenario.endingId,'deep-answers');
 assert.equal(saveScenarioSession(db,s,def,content),true);
 assert.equal(loadScenarioSession(db,def,content).scenario.endingId,'deep-answers');
});
