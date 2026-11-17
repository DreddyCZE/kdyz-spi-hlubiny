import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {blackwaterContent as data} from '../src/engine/content.js';
import {newScenarioSession,scenarioSessionTransition as transition,scenarioSessionView as view} from '../src/engine/scenario-session.js';
import {validScenarioSession,loadScenarioSession,saveScenarioSession} from '../src/engine/scenario-storage.js';
import {validateScenario} from '../src/engine/scenario.js';
import {currentCard,selectedChoice} from '../src/engine/game.js';
const act=(s,type,extra={})=>transition(s,{type,revision:s.game.revision,...extra},def,data);
const id='bw-rising-fog';
const reload=s=>{
  let raw;const db={setItem:(_,v)=>{raw=v;},getItem:()=>raw};
  assert.equal(saveScenarioSession(db,s,def,data),true);
  return loadScenarioSession(db,def,data);
};
test('fog warns, stays harmless until due, hits once and survives reloads',()=>{
  const first=newScenarioSession(def,data),s=act(first,'endRound');
  assert.equal(s.game.san,first.game.san);assert.equal(s.scenario.delayedThreats[id],'pending');
  assert.equal(view(s,def,data).mythEvents[0].dueRound,2);
  const revision=s.game.revision;
  assert.equal(transition(s,{type:'endRound',revision:revision-1},def,data),s);
  const hit=act(reload(s),'endRound');
  assert.equal(hit.game.san,s.game.san-1);assert.equal(hit.scenario.delayedThreats[id],'hit');
  const again=act(reload(hit),'endRound');assert.equal(again.game.san,hit.game.san);
  assert.equal(again.game.log.filter(t=>t.includes('Ztrácíš 1 SAN')).length,1);
});
test('normal movement avoids fog for exactly one AP and records resolution',()=>{
  const warned=act(newScenarioSession(def,data),'endRound');
  const away=act(warned,'move',{locationId:'location-1'});
  assert.equal(away.game.ap,warned.game.ap-1);
  const resolved=act(reload(away),'endRound');
  assert.equal(resolved.game.san,warned.game.san);assert.equal(resolved.scenario.delayedThreats[id],'avoided');
  assert.ok(resolved.game.log.some(t=>t.includes('Mlha tě minula')));
});
test('returning to the threatened location before deadline hits and zero SAN is lethal',()=>{
  let s=act(newScenarioSession(def,data),'endRound');
  s=act(s,'move',{locationId:'location-1'});s=act(s,'move',{locationId:'location-0'});
  s={...s,game:{...s.game,san:1}};s=act(s,'endRound');
  assert.equal(s.game.san,0);assert.equal(s.game.ended,true);assert.equal(validScenarioSession(s,def,data),true);
});
test('old saves remain unchanged on load and never retroactively announce or resolve fog',()=>{
  for(const round of [1,2,3]){
    let old=newScenarioSession(def,data);for(let n=1;n<round;n++)old=act(old,'endRound');
    delete old.scenario.delayedThreats;
    const copy=structuredClone(old),loaded=reload(old);assert.deepEqual(loaded,copy);
    if(round>=2){const next=act(loaded,'endRound');assert.equal(next.game.san,loaded.game.san);assert.deepEqual(next.scenario.delayedThreats,{});}
  }
});
test('save rejects fabricated threat IDs, statuses and impossible timing',()=>{
  const s=act(newScenarioSession(def,data),'endRound');
  for(const states of [null,[],{unknown:'pending'},{[id]:'hit'},{[id]:'invalid'}]){
    assert.equal(validScenarioSession({...s,scenario:{...s.scenario,delayedThreats:states}},def,data),false);
  }
  assert.equal(validateScenario({...def,delayedThreats:[{...def.delayedThreats[0],locationId:'absent'}]}).length>0,true);
  assert.equal(validateScenario({...def,delayedThreats:[{...def.delayedThreats[0],dueRound:1}]}).length>0,true);
});
test('fog does not block real port evidence and leaves its card effects unchanged',()=>{
  let threatened=act(newScenarioSession(def,data),'endRound');
  const controlDef={...def,delayedThreats:[]};let control=structuredClone(threatened);delete control.scenario.delayedThreats;
  const perform=(s,d,type,extra={})=>transition(s,{type,revision:s.game.revision,...extra},d,data);
  for(let i=0;i<2;i++){
    for(const d of [def,controlDef]){
      let s=d===def?threatened:control;
      s=perform(s,d,'draw');const card=currentCard(s.game,data),choice=selectedChoice(s.game,card);
      const action={cardId:card.id,choiceId:choice.id,dice:[6,6]};
      s=perform(s,d,choice.test?'startTest':'resolve',action);
      if(choice.test)s=perform(s,d,'acceptTest');
      s=perform(s,d,'next');
      if(d===def)threatened=s;else control=s;
    }
    assert.deepEqual(threatened.game,control.game);
  }
  assert.ok(threatened.game.evidence.length>0);
});
