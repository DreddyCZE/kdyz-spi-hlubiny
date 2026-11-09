import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {blackwaterContent as data} from '../src/engine/content.js';
import {newScenarioSession,scenarioSessionTransition} from '../src/engine/scenario-session.js';
import {validScenarioSession} from '../src/engine/scenario-storage.js';
const act=(s,type,extra={})=>scenarioSessionTransition(s,{type,revision:s.game.revision,...extra},def,data);
test('U2: each investigator has persisted identity and distinct stats',()=>{
 for(const [id,hp,san] of [['detective',6,8],['occultist',5,9],['sailor',7,7]]){
  const initial=newScenarioSession(def,data);
  const s=act(initial,'selectInvestigator',{investigatorId:id});
  assert.equal(s.investigatorId,id);
  assert.equal(s.game.hp,hp);assert.equal(s.game.san,san);
  assert.equal(validScenarioSession(s,def,data),true);
  assert.strictEqual(act(s,'selectInvestigator',{investigatorId:'detective'}),s);
 }
});
test('U2: one-use abilities and revision guards',()=>{
 for(const id of ['detective','occultist','sailor']){
  let s=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:id});
  if(id==='sailor')s={...s,game:{...s.game,hp:4}};
  const used=act(s,'useInvestigatorAbility');
  assert.equal(used.abilityUsed,true);
  assert.equal(validScenarioSession(used,def,data),true);
  assert.strictEqual(act(used,'useInvestigatorAbility'),used);
  assert.strictEqual(scenarioSessionTransition(used,{type:'endRound',revision:s.game.revision},def,data),used);
 }
});
test('U2: old scenario saves without investigator fields remain valid',()=>{
 const s=newScenarioSession(def,data);
 const old={schemaVersion:s.schemaVersion,game:s.game,scenario:s.scenario};
 assert.equal(validScenarioSession(old,def,data),true);
});
