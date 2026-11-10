import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterContent as base} from '../src/engine/content.js';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {newScenarioSession,scenarioSessionTransition as transition,scenarioSessionView as view} from '../src/engine/scenario-session.js';
import {validScenarioSession,saveScenarioSession,loadScenarioSession} from '../src/engine/scenario-storage.js';
import {validState} from '../src/engine/storage.js';

function fixture(hero,{damage=0,san=0,attribute='VN'}={}){
 const card=structuredClone(base.byId['0-0']);card.conditions=[];
 const choice=card.choices[0];choice.conditions=[];choice.test={attribute,difficulty:10};
 for(const outcome of Object.values(choice.outcomes))outcome.effects=[{type:'modifyStat',stat:'hp',amount:-damage},{type:'modifyStat',stat:'san',amount:-san}];
 card.choices=[choice];
 const data={...base,encounters:[{locationId:'location-0',enemyId:'enemy-drowned-sailor'}],cards:base.cards.map(c=>c.id===card.id?card:c),byId:{...base.byId,[card.id]:card}};
 const act=(s,type,extra={})=>transition(s,{type,revision:s.game.revision,...extra},def,data);
 let s=act(newScenarioSession(def,data),'selectInvestigator',{investigatorId:hero});
 s=act(s,'draw');
 const start=s=>act(s,'startTest',{cardId:card.id,choiceId:choice.id,dice:[3,4]});
 const store=s=>{const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};assert.ok(saveScenarioSession(storage,s,def,data));return loadScenarioSession(storage,def,data);};
 return {s,act,start,store,data};
}

test('detective bonus needs evidence, changes the tier, persists and rejects forged bonuses',()=>{
 const f=fixture('detective');
 assert.deepEqual(view(f.s,def,f.data).testBonuses,{});
 const unboosted=f.act(f.start(f.s),'acceptTest');assert.equal(unboosted.game.result.total,9);
 f.s.game.evidence=['reward-2'];
 const pending=f.store(f.start(f.s));
 const solved=f.act(pending,'acceptTest');
 assert.equal(solved.game.result.total,10);assert.equal(solved.game.result.key,'success');assert.equal(solved.game.result.testBonus,1);
 assert.deepEqual(f.store(solved),solved);assert.equal(validState(solved.game,f.data),false);
 for(const bonus of [0,2,'1']){
  const bad=structuredClone(solved);bad.game.result.testBonus=bonus;bad.game.resolved['0-0'].testBonus=bonus;
  assert.equal(validScenarioSession(bad,def,f.data),false);
 }
 const other=fixture('detective',{attribute:'VŮ'});other.s.game.evidence=['reward-2'];
 assert.equal(other.act(other.start(other.s),'acceptTest').game.result.testBonus,undefined);
});

test('occultist first reroll is free even at one SAN, cannot replay, persists and renews next round',()=>{
 const f=fixture('occultist');f.s.game.san=1;
 let s=f.start(f.s);s=f.act(s,'rerollTest',{dice:[4,4]});
 assert.equal(s.game.san,1);assert.equal(s.passiveRound,1);
 s=f.store(s);assert.equal(view(s,def,f.data).rerollCost,1);
 assert.strictEqual(f.act(s,'rerollTest',{dice:[6,6]}),s);
 s=f.act(s,'acceptTest');s=f.act(s,'endRound');
 assert.equal(view(s,def,f.data).rerollCost,0);assert.equal(s.game.san,1);
 const paid=fixture('occultist');paid.s.passiveRound=1;paid.s.game.san=2;
 const rerolled=paid.act(paid.start(paid.s),'rerollTest',{dice:[4,4]});assert.equal(rerolled.game.san,1);
 paid.s.game.san=1;const blocked=paid.start(paid.s);assert.strictEqual(paid.act(blocked,'rerollTest',{dice:[4,4]}),blocked);
});

test('sailor protection happens before lethal damage, never protects SAN and consumes once',()=>{
 for(const [damage,san,hp,expected,ended] of [[1,0,1,1,false],[3,0,1,0,true],[1,1,1,1,true]]){
  const f=fixture('sailor',{damage,san});f.s.game.hp=hp;if(san)f.s.game.san=1;
  const s=f.act(f.start(f.s),'acceptTest');
  assert.equal(s.game.hp,expected);assert.equal(s.game.ended,ended);assert.equal(s.passiveRound,1);assert.deepEqual(f.store(s),s);
  assert.strictEqual(f.act(s,'acceptTest'),s);
 }
 const used=fixture('sailor',{damage:1});used.s.passiveRound=1;
 const s=used.act(used.start(used.s),'acceptTest');assert.equal(s.game.hp,6);
 const noDamage=fixture('sailor');assert.equal(noDamage.act(noDamage.start(noDamage.s),'acceptTest').passiveRound,undefined);
});

test('sailor combat shares the card protection budget, survives reload and renews next round',()=>{
 const f=fixture('sailor',{damage:1});let s=f.s;
 s=f.act(s,'startCombat',{enemyId:'enemy-drowned-sailor'});
 s=f.act(s,'combatTurn',{move:'attack',dice:[1,1]});assert.equal(s.game.hp,7);assert.equal(s.passiveRound,1);
 s=f.store(s);s=f.act(s,'combatTurn',{move:'attack',dice:[1,1]});assert.equal(s.game.hp,6);
 s=f.act(s,'combatTurn',{move:'escape',dice:[6,6]});
 s=f.act(f.start(s),'acceptTest');assert.equal(s.game.hp,5);
 s=f.act(s,'endRound');
 assert.equal(view(s,def,f.data).passiveUsed,false);
 assert.equal(s.passiveRound,1);
});

test('save rejects impossible passive rounds while accepting old sessions without the field',()=>{
 for(const hero of ['detective','occultist','sailor']){
  const f=fixture(hero);assert.ok(validScenarioSession(f.s,def,f.data));
  for(const round of [null,0,-1,2,1.5,'1'])assert.equal(validScenarioSession({...f.s,passiveRound:round},def,f.data),false);
  if(hero==='detective')assert.equal(validScenarioSession({...f.s,passiveRound:1},def,f.data),false);
 }
});

test('sailor protects a decision without dice, and aggregate combat damage can still kill',()=>{
 const f=fixture('sailor',{damage:1});
 const card=f.data.byId['0-0'],choice=card.choices[0];delete choice.test;
 const decided=f.act(f.s,'resolve',{cardId:card.id,choiceId:choice.id});
 assert.equal(decided.game.hp,7);assert.equal(decided.passiveRound,1);assert.deepEqual(f.store(decided),decided);
 const combat=fixture('sailor');let s=combat.act(combat.s,'startCombat',{enemyId:'enemy-drowned-sailor'});
 s.game.hp=1;s.scenario.combat.exchange=2;
 const dead=combat.act(s,'combatTurn',{move:'attack',dice:[1,1]});
 assert.equal(dead.scenario.combat.playerDamage,2);assert.equal(dead.game.hp,0);assert.equal(dead.game.ended,true);assert.deepEqual(combat.store(dead),dead);
});
