import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {blackwaterContent as data} from '../src/engine/content.js';
import {newScenarioSession,scenarioSessionTransition,scenarioSessionView} from '../src/engine/scenario-session.js';
import {validScenarioSession} from '../src/engine/scenario-storage.js';
const act=(s,type,extra={})=>scenarioSessionTransition(s,{type,revision:s.game.revision,...extra},def,data);
test('U3: starting equipment is isolated from legacy inventory and persists',()=>{
 const selected=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'sailor'});
 assert.deepEqual(selected.scenario.equipment,['bw-bandage','bw-revolver']);
 assert.deepEqual(selected.game.inventory,[]);
 assert.equal(validScenarioSession(selected,def,data),true);
 const wounded={...selected,game:{...selected.game,hp:4}};
 const healed=act(wounded,'useEquipment',{itemId:'bw-bandage'});
 assert.equal(healed.game.hp,6);
 assert.deepEqual(healed.scenario.equipment,['bw-revolver']);
 assert.equal(validScenarioSession(healed,def,data),true);
 assert.strictEqual(act(healed,'useEquipment',{itemId:'bw-bandage'}),healed);
});
test('U3: combat consumes AP, uses dice, blocks exploration and survives save validation',()=>{
 let s=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'sailor'});
 s={...s,game:{...s.game,locationId:'location-2'}};
 s=act(s,'startCombat',{enemyId:'enemy-fog-hound'});
 assert.equal(s.game.ap,2);
 assert.equal(s.scenario.combat.status,'active');
 assert.equal(scenarioSessionView(s,def,data).canAct,false);
 assert.strictEqual(act(s,'endRound'),s);
 assert.equal(validScenarioSession(s,def,data),true);
 s=act(s,'combatTurn',{move:'attack',dice:[6,6]});
 assert.equal(s.scenario.combat.enemyHp,0);
 assert.equal(validScenarioSession(s,def,data),true);
 assert.equal(s.scenario.combat.status,'defeated');
 assert.equal(scenarioSessionView(s,def,data).canAct,true);
 assert.equal(validScenarioSession(s,def,data),true);
});
test('U3: invalid combat dice cannot advance combat',()=>{
 let s=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'detective'});
 s={...s,game:{...s.game,locationId:'location-2'}};
 s=act(s,'startCombat',{enemyId:'enemy-fog-hound'});
 assert.strictEqual(act(s,'combatTurn',{move:'attack',dice:[0,9]}),s);
});

test('U3: class consumables change stats and cannot be reused',()=>{
 let occultist=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'occultist'});
 occultist={...occultist,game:{...occultist.game,san:6}};
 const healed=act(occultist,'useEquipment',{itemId:'bw-laudanum'});
 assert.equal(healed.game.san,8);
 assert.equal(healed.scenario.equipment.includes('bw-laudanum'),false);
 assert.strictEqual(act(healed,'useEquipment',{itemId:'bw-laudanum'}),healed);
 let detective=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'detective'});
 const salted=act(detective,'useEquipment',{itemId:'bw-salt'});
 assert.equal(salted.game.threat,detective.game.threat-1);
 assert.equal(validScenarioSession(salted,def,data),true);
});
test('U3: combat cannot be forged outside encounter locations',()=>{
 const s=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'detective'});
 assert.strictEqual(act(s,'startCombat',{enemyId:'enemy-bell-keeper'}),s);
 assert.strictEqual(act(s,'startCombat',{enemyId:'enemy-drowned-sailor'}),s);
});
