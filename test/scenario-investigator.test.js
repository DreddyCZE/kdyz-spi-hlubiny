import test from 'node:test';
import assert from 'node:assert/strict';
import {newScenarioSession,scenarioSessionTransition} from '../src/engine/scenario-session.js';
import {validScenarioSession} from '../src/engine/scenario-storage.js';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {blackwaterContent} from '../src/engine/content.js';
import {selectScenarioInvestigator,defaultScenarioInvestigatorId} from '../src/engine/scenario-investigator.js';
const def=blackwaterScenario,data=blackwaterContent;
test('new scenario defaults to the existing occultist identity',()=>{
 const s=newScenarioSession(def,data);
 assert.equal(s.scenario.investigatorId,defaultScenarioInvestigatorId);
 assert.ok(validScenarioSession(s,def,data));
});
test('selection is saved, but never changes game stats or legacy schema',()=>{
 const before=newScenarioSession(def,data);
 const after=scenarioSessionTransition(before,{type:'selectInvestigator',investigatorId:'sailor'},def,data);
 assert.equal(after.scenario.investigatorId,'sailor');
 assert.deepEqual(after.game,before.game);
 assert.ok(validScenarioSession(after,def,data));
 assert.equal(selectScenarioInvestigator(after,'unknown'),after);
});
test('investigator cannot change after game advances',()=>{
 const s=newScenarioSession(def,data);
 const progressed={...s,game:{...s.game,revision:1}};
 assert.equal(selectScenarioInvestigator(progressed,'detective'),progressed);
});
test('older saves without investigator ID remain valid',()=>{
 const s=newScenarioSession(def,data);
 const old={...s,scenario:{...s.scenario}};
 delete old.scenario.investigatorId;
 assert.ok(validScenarioSession(old,def,data));
 assert.equal(selectScenarioInvestigator(old,'detective').scenario.investigatorId,'detective');
});
test('unknown investigator in saved scenario is rejected',()=>{
 const s=newScenarioSession(def,data);
 assert.equal(validScenarioSession({...s,scenario:{...s.scenario,investigatorId:'unknown'}},def,data),false);
});
