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

test('U3: encounter history permits the next location but prevents replay',()=>{
 let s=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'sailor'});
 s={...s,game:{...s.game,locationId:'location-2'}};
 s=act(s,'startCombat',{enemyId:'enemy-fog-hound'});
 s=act(s,'combatTurn',{move:'attack',dice:[6,6]});
 assert.equal(s.scenario.combat.status,'defeated');
 assert.strictEqual(act(s,'startCombat',{enemyId:'enemy-fog-hound'}),s);
 s={...s,game:{...s.game,locationId:'location-4'}};
 s=act(s,'startCombat',{enemyId:'enemy-hollow-orderly'});
 assert.equal(s.scenario.combat.status,'active');
 assert.deepEqual(s.scenario.encounteredEnemyIds,['enemy-fog-hound','enemy-hollow-orderly']);
 assert.equal(validScenarioSession(s,def,data),true);
});

test('encounters are scenario data: absent packs have none and custom locations work',()=>{
 const initial=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'detective'});
 const session={...initial,game:{...initial.game,locationId:'location-2'}};
 const absent={...data,encounters:[]};
 assert.deepEqual(scenarioSessionView(session,def,absent).availableEncounters,[]);
 assert.strictEqual(scenarioSessionTransition(session,{type:'startCombat',revision:session.game.revision,enemyId:'enemy-fog-hound'},def,absent),session);
 const custom={...data,encounters:[{locationId:'location-0',enemyId:'enemy-drowned-sailor'}]};
 const view=scenarioSessionView(initial,def,custom);
 assert.deepEqual(view.availableEncounters,[{enemyId:'enemy-drowned-sailor',name:'Utopený námořník'}]);
 const started=scenarioSessionTransition(initial,{type:'startCombat',revision:initial.game.revision,enemyId:'enemy-drowned-sailor'},def,custom);
 assert.equal(started.scenario.combat.status,'active');
});

test('save rejects impossible active and escaped combat states',()=>{
 let s=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:'sailor'});
 s={...s,game:{...s.game,locationId:'location-2'}};
 s=act(s,'startCombat',{enemyId:'enemy-fog-hound'});
 for(const change of [{enemyHp:0},{exchange:3},{status:'escaped',enemyHp:0}]){
  assert.equal(validScenarioSession({...s,scenario:{...s.scenario,combat:{...s.scenario.combat,...change}}},def,data),false);
 }
});
