import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {content} from '../src/engine/content.js';
import {deduce} from '../src/engine/investigation.js';
import {newScenarioSession,scenarioSessionTransition,scenarioSessionView} from '../src/engine/scenario-session.js';
const allEvidence=['reward-2','reward-5','reward-7','reward-9','reward-10','reward-11','reward-12','reward-14','reward-16'];
test('three knowledge routes and finale preparation derive from actual evidence',()=>{
 const s=newScenarioSession(def,content);
 const g=deduce({...s.game,evidence:allEvidence},content.investigation);
 for(const id of ['knowledge-voice','knowledge-name','knowledge-body'])assert.ok(g.knowledge.includes(id),id);
 assert.equal(g.flags['signal-ready'],true);
 assert.equal(g.flags['bell-reachable'],true);
 assert.equal(g.deductions['blackwater-prepare-signal'],1);
});
test('finale requires cave, two knowledge routes and earned preparation',()=>{
 const s=newScenarioSession(def,content);
 const g=deduce({...s.game,evidence:allEvidence},content.investigation);
 let ready={...s,game:g};
 assert.deepEqual(scenarioSessionView(ready,def).availableEndings,[]);
 ready={...ready,game:{...g,locationId:'location-6'}};
 assert.deepEqual(scenarioSessionView(ready,def).availableEndings.map(e=>e.id),['quiet-sea','broken-bell','voice-price']);
 const done=scenarioSessionTransition(ready,{type:'finishScenario',revision:g.revision,endingId:'quiet-sea'},def,content);
 assert.equal(done.scenario.endingId,'quiet-sea');
});
test('one knowledge path never unlocks sacrifice finale',()=>{
 const s=newScenarioSession(def,content);
 const g={...s.game,locationId:'location-6',knowledge:['knowledge-body'],flags:{'bell-reachable':true}};
 assert.deepEqual(scenarioSessionView({...s,game:g},def).availableEndings,[]);
});
