import test from 'node:test';
import assert from 'node:assert/strict';
import { createInvestigation, validateInvestigation, validateCondition, conditionMet, deduce, publicInvestigation } from '../src/engine/investigation.js';
import { newState, transition, investigationView, currentCard, applyEffects } from '../src/engine/game.js';
import { content, createContent } from '../src/engine/content.js';
import { investigationDefinitions } from '../src/data/investigation.js';
import { validState, migrateV2, load, save, SAVE_KEY } from '../src/engine/storage.js';

// A different, scenario-neutral fixture: the generic engine sees none of Blackwater's IDs.
const refs={items:['object-a'],locations:['room-a','room-b'],cards:['card-a'],choices:['choice-a'],flags:['world-a']};
const info=id=>({id,name:'Informace '+id,description:'Popis '+id,type:'document',tags:['independent']});
const fixture=()=>({
  evidence:['e-a','e-b','e-c'].map(info),knowledge:[info('k-a')],
  deductions:[{id:'d-a',name:'Utajený závěr',description:'Propojení nezávislých stop.',repeatable:false,
    conditions:{type:'any',conditions:[
      {type:'all',conditions:[{type:'hasEvidence',id:'e-a'},{type:'hasEvidence',id:'e-b'}]},
      {type:'all',conditions:[{type:'hasEvidence',id:'e-a'},{type:'hasEvidence',id:'e-c'}]},
    ]},effects:[{type:'addKnowledge',id:'k-a'}]}],
});
const model=()=>createInvestigation(fixture(),refs);
const withEvidence=evidence=>({...newState(),evidence});
function memory(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}

test('generic fixture has three independent evidence records and two alternative paths',()=>{
  const m=model();
  for(const evidence of [['e-a','e-b'],['e-a','e-c'],['e-a','e-b','e-c']]){
    const s=withEvidence(evidence),n=deduce(s,m);assert.deepEqual(n.knowledge,['k-a']);assert.deepEqual(n.deductions,{'d-a':1});assert.deepEqual(s.knowledge,[]);
  }
  for(const evidence of [[],['e-a'],['e-b','e-c']]){const s=withEvidence(evidence);assert.equal(deduce(s,m),s);}
});

test('another scenario runs and persists through the same game and storage APIs',()=>{
  const data=createContent([],fixture(),{...refs,itemEvidence:{}});
  const s={...newState(data),evidence:['e-a','e-c']};assert.equal(s.locationId,'room-a');
  const n=transition(s,{type:'deduce',revision:0},data);assert.deepEqual(n.knowledge,['k-a']);assert.ok(validState(n,data));
  const storage=memory();assert.ok(save(storage,n,data));assert.deepEqual(load(storage,data),n);
  assert.equal(validState(n),false); // Registries from another scenario must not be silently accepted.
});

test('generic round conditions accept round 12 and safe positive integers independently of game length',()=>{
  for(const type of ['minRound','maxRound']){
    for(const round of [1,12,Number.MAX_SAFE_INTEGER])assert.deepEqual(validateCondition({type,round},refs),[]);
    for(const round of [0,-1,1.5,'12',NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.ok(validateCondition({type,round},refs).length);
  }
  const min={type:'minRound',round:12},max={type:'maxRound',round:12};
  assert.equal(conditionMet({...newState(),round:11},min),false);
  assert.equal(conditionMet({...newState(),round:12},min),true);
  assert.equal(conditionMet({...newState(),round:12},max),true);
  assert.equal(conditionMet({...newState(),round:13},max),false);
 const card=structuredClone(content.cards[0]);card.conditions=[min,max];
 assert.doesNotThrow(()=>createContent([card]));
 const def=fixture();def.deductions[0].conditions=min;
  assert.deepEqual(validateInvestigation(def,refs),[]);
});

test('move uses the active scenario location metadata, pays once and persists its log',()=>{
  const locationMetadata=[{id:'room-a',name:'Badatelna'},{id:'room-b',name:'Archiv svědectví'}];
  const data=createContent([],fixture(),{...refs,itemEvidence:{},locationMetadata});
 for(const invalid of [null,[{id:'unknown',name:'Archiv'}],[{id:'room-a',name:''}],[locationMetadata[0],locationMetadata[0]]])
  assert.throws(()=>createContent([],fixture(),{...refs,itemEvidence:{},locationMetadata:invalid}),/locationMetadata/);
 assert.ok(Object.isFrozen(data.locationsById['room-b']));
 const s=newState(data),action={type:'move',locationId:'room-b'},n=transition(s,action,data);
  assert.equal(n.locationId,'room-b');assert.equal(n.log[0],'Přesun: Archiv svědectví');assert.equal(n.ap,2);assert.equal(s.ap,3);
  assert.equal(transition(n,action,data),n);
  const storage=memory();assert.ok(save(storage,n,data));assert.deepEqual(load(storage,data),n);
  // A different scenario may reuse old IDs; it must never inherit Blackwater names.
  const reused=createContent([],fixture(),{...refs,locations:['location-0','location-1'],itemEvidence:{},locationMetadata:[{id:'location-1',name:'Cizí archiv'}]});
  assert.equal(transition(newState(reused),{type:'move',locationId:'location-1'},reused).log[0],'Přesun: Cizí archiv');
  const metadataFree=createContent([],fixture(),{...refs,itemEvidence:{}});
  assert.equal(transition(newState(metadataFree),action,metadataFree).log[0],'Přesun: room-b');
  assert.equal(transition(newState(),{type:'move',locationId:'location-1'}).log[0],'Přesun: Staré město');
});
test('all, any, not, knowledge, world flags and deduction references compose without eval',()=>{
  const s={...withEvidence(['e-a']),knowledge:['k-a'],deductions:{'d-a':1},flags:{'world-a':false}};
  const c={type:'all',conditions:[{type:'hasKnowledge',id:'k-a'},{type:'deductionCompleted',id:'d-a'},{type:'flagEquals',id:'world-a',value:false},{type:'not',condition:{type:'hasEvidence',id:'e-b'}}]};
  assert.ok(conditionMet(s,c));assert.equal(conditionMet({...s,evidence:['e-a','e-b']},c),false);
  assert.equal(conditionMet(s,{type:'flagEquals',id:'missing',value:false}),false);
  assert.deepEqual(validateCondition(c,{...refs,evidence:['e-a','e-b'],knowledge:['k-a'],deductions:['d-a']}),[]);
});
test('nonrepeatable deductions and effects cannot reward twice, even if both alternatives hold',()=>{
  const m=model(),s=deduce(withEvidence(['e-a','e-b','e-c']),m);assert.equal(deduce(s,m),s);assert.equal(s.knowledge.length,1);
  const d=fixture();d.deductions[0].repeatable=true;const repeated=createInvestigation(d,refs);
  const n=deduce(deduce(withEvidence(['e-a','e-b']),repeated),repeated);assert.equal(n.deductions['d-a'],2);assert.deepEqual(n.knowledge,['k-a']);
});
test('all unlock effects and a world flag apply together without duplicate IDs',()=>{
  const d=fixture();d.deductions[0].effects.push({type:'unlockChoice',id:'choice-a'},{type:'unlockCard',id:'card-a'},{type:'unlockLocation',id:'room-b'},{type:'setFlag',id:'world-a',value:true},{type:'addKnowledge',id:'k-a'});
  const n=deduce({...withEvidence(['e-a','e-b']),unlockedLocations:['room-a']},createInvestigation(d,refs));
  assert.deepEqual(n.knowledge,['k-a']);assert.deepEqual(n.unlockedChoices,['choice-a']);assert.deepEqual(n.unlockedCards,['card-a']);assert.deepEqual(n.unlockedLocations,['room-a','room-b']);assert.equal(n.flags['world-a'],true);
});
test('dependency order resolves a chain deterministically even with reversed definitions',()=>{
  const d=fixture();d.knowledge.push(info('k-b'));
  d.deductions.unshift({id:'d-b',name:'Druhý závěr',description:'Navazuje na první.',repeatable:false,conditions:{type:'hasKnowledge',id:'k-a'},effects:[{type:'addKnowledge',id:'k-b'}]});
  const m=createInvestigation(d,refs);assert.deepEqual(m.order,['d-a','d-b']);
  const s=withEvidence(['e-a','e-c']);assert.deepEqual(deduce(s,m),deduce(s,m));assert.deepEqual(deduce(s,m).knowledge,['k-a','k-b']);
});
test('cycles through knowledge, flags and deduction records are rejected, including negations',()=>{
  for(const type of ['knowledge','flags','deductions']){
    const d=fixture();
    d.deductions[0].conditions=type==='knowledge'?{type:'hasKnowledge',id:'k-a'}:type==='flags'?{type:'not',condition:{type:'flagEquals',id:'world-a',value:true}}:{type:'deductionCompleted',id:'d-a'};
    if(type==='flags')d.deductions[0].effects=[{type:'setFlag',id:'world-a',value:true}];
    assert.match(validateInvestigation(d,refs).join('\n'),/cyklická závislost/);
  }
  const d=fixture();d.knowledge.push(info('k-b'));d.deductions[0].conditions={type:'hasKnowledge',id:'k-b'};
  d.deductions.push({id:'d-b',name:'Zpětná vazba',description:'Nepovolený cyklus.',repeatable:false,conditions:{type:'hasKnowledge',id:'k-a'},effects:[{type:'addKnowledge',id:'k-b'}]});
  assert.throws(()=>createInvestigation(d,refs),/d-a.*cyklická|cyklická.*d-a/);
});
test('invalid references, operations, records and cyclic JSON are rejected with paths',()=>{
  for(const mutate of [
    d=>d.evidence[0].id='bad id',d=>d.evidence.push(d.evidence[0]),d=>d.evidence[0].tags=['x','x'],d=>d.evidence[0].source={},
    d=>d.knowledge[0].description='',d=>d.deductions[0].repeatable='yes',d=>d.deductions[0].conditions={type:'any',conditions:[]},
    d=>d.deductions[0].conditions={type:'hasEvidence',id:'unknown'},d=>d.deductions[0].conditions={type:'hasKnowledge',id:'unknown'},
    d=>d.deductions[0].conditions={type:'flagEquals',id:'unknown',value:true},d=>d.deductions[0].conditions={type:'eval',code:'true'},
    ...['addKnowledge','unlockChoice','unlockCard','unlockLocation','setFlag'].map(type=>d=>d.deductions[0].effects=[{type,id:'unknown',...(type==='setFlag'?{value:true}:{})}]),
    d=>{const c={type:'not'};c.condition=c;d.deductions[0].conditions=c;},
    d=>{const a=[];a.push(a);d.evidence[0].metadata={a};},
    d=>d.deductions[0].effects=[{type:'modifyThreat',amount:1}],
  ]){const d=fixture();mutate(d);assert.ok(validateInvestigation(d,refs).length);assert.throws(()=>createInvestigation(d,refs),/Neplatné definice/);}
  assert.ok(validateInvestigation(null,refs).length);
  assert.throws(()=>createInvestigation(fixture(),refs,{'object-a':['missing']}),/itemEvidence/);
  const unsafe=fixture();unsafe.deductions[0].effects=[{type:'setFlag',id:'__proto__',value:true}];
  assert.throws(()=>createInvestigation(unsafe,{...refs,flags:['__proto__']}),/effects\[0\].id/);
});
test('unvalidated malformed effects still roll back all preceding changes',()=>{
  const m=model(),broken={...m,deductions:[{...m.deductions[0],effects:[{type:'addKnowledge',id:'k-a'},{type:'invalid'}]}]};
  const s=withEvidence(['e-a','e-b']);assert.equal(deduce(s,broken),s);assert.deepEqual(s.knowledge,[]);
});
test('public projection exposes neither unsatisfied deductions nor future knowledge or effects',()=>{
  const m=model(),s=withEvidence(['e-a']),before=JSON.stringify(s),view=publicInvestigation(s,m);
  assert.equal(JSON.stringify(s),before);assert.equal(view.evidence.length,1);assert.deepEqual(view.available,[]);assert.deepEqual(view.knowledge,[]);
  assert.ok(!JSON.stringify(view).includes('Utajený závěr'));assert.ok(!JSON.stringify(view).includes('k-a'));
  const ready=publicInvestigation(withEvidence(['e-a','e-b']),m);assert.equal(ready.available.length,1);assert.ok(!JSON.stringify(ready).includes('effects'));assert.ok(!JSON.stringify(ready).includes('conditions'));
  assert.equal(publicInvestigation(deduce(withEvidence(['e-a','e-b']),m),m).knowledge[0].id,'k-a');
});
test('explicit revision-guarded action is the only trigger; no AP, round or ritual changes',()=>{
  const s={...newState(),evidence:['reward-2','reward-5']};
  investigationView(s);currentCard(s);assert.deepEqual(s.knowledge,[]);
  const request={type:'deduce',revision:s.revision},n=transition(s,request);assert.equal(n.revision,1);assert.equal(n.ap,s.ap);assert.equal(n.round,s.round);assert.equal(n.ritual,s.ritual);assert.equal(n.knowledge.length,1);
  assert.equal(transition(n,request),n);assert.equal(transition(n,{type:'deduce',revision:n.revision}),n);
  const storage=memory();assert.ok(save(storage,n));assert.deepEqual(load(storage),n);assert.equal(transition(load(storage),request).revision,n.revision);
});
test('information acquired from composite items survives their removal and reload',()=>{
  const s=applyEffects(newState(),[{type:'addItem',id:'reward-1'}]);assert.ok(s.evidence.includes('reward-2'));
  const n=applyEffects(s,[{type:'removeItem',id:'reward-1'}]);assert.deepEqual(n.inventory,[]);assert.ok(n.evidence.includes('reward-2'));
  const storage=memory();assert.ok(save(storage,n));assert.deepEqual(load(storage),n);
});
test('M2.1 migration retains rewards and materializes composite information without deducing',()=>{
  const old={...newState(),version:2,inventory:['reward-1']};for(const key of ['knowledge','deductions','unlockedCards','unlockedChoices'])delete old[key];
  const storage=memory(),raw=JSON.stringify(old);storage.setItem('hlubiny-v2',raw);const n=load(storage);
  assert.equal(n.version,3);assert.deepEqual(n.inventory,['reward-1']);assert.ok(n.evidence.includes('reward-2'));assert.deepEqual(n.knowledge,[]);assert.deepEqual(n.deductions,{});assert.equal(storage.getItem('hlubiny-v2'),raw);
  assert.ok(validState(n));assert.equal(migrateV2({...old,evidence:null}),null);assert.equal(migrateV2({...old,knowledge:['injected']}),null);
});
test('forged investigation fields and corrupted v3 cannot fall back to earlier saves',()=>{
  for(const override of [{knowledge:['unknown']},{deductions:{unknown:1}},{deductions:{'blackwater-follow-the-route':2},revision:5},{unlockedCards:['unknown']},{unlockedChoices:['unknown']},{inventory:['reward-1']}])assert.equal(validState({...newState(),...override}),false);
  const storage=memory();storage.setItem(SAVE_KEY,'{broken');storage.setItem('hlubiny-v2',JSON.stringify({version:2}));assert.deepEqual(load(storage),newState());
});
test('knowledge and unlock gates hide future choices/cards and become usable after deduction',()=>{
  const base=structuredClone(content.cards[0]);base.conditions=[{type:'cardUnlocked',id:base.id}];
  base.choices[0].conditions=[{type:'choiceUnlocked',id:base.choices[0].id},{type:'hasKnowledge',id:'blackwater-lighthouse-connection'}];
  const definitions=structuredClone(investigationDefinitions);definitions.deductions[0].effects.push({type:'unlockCard',id:base.id},{type:'unlockChoice',id:base.choices[0].id});
  const data=createContent([base],definitions),s={...newState(),evidence:['reward-2','reward-5']};
  assert.equal(currentCard(s,data),null);
  const n=transition(s,{type:'deduce',revision:0},data);assert.equal(currentCard(n,data).choices[0].available,true);
  const result=transition(n,{type:'resolve',revision:n.revision,cardId:base.id,choiceId:base.choices[0].id,dice:[6,6]},data);assert.ok(result.result);
});

test('explicitly unlocked skipped cards remain reachable without replaying the rest of the deck',()=>{
  const locked=structuredClone(content.cards[0]);locked.conditions=[{type:'cardUnlocked',id:locked.id}];
  const later=structuredClone(content.cards[1]);
  const definitions=structuredClone(investigationDefinitions);definitions.deductions[0].effects.push({type:'unlockCard',id:locked.id});
  const data=createContent([locked,later],definitions);let s={...newState(),evidence:['reward-2','reward-5']};
  assert.equal(currentCard(s,data).id,later.id);
  s=transition(s,{type:'resolve',revision:s.revision,cardId:later.id,choiceId:later.choices[0].id,dice:[6,6]},data);
  s=transition(s,{type:'next'},data);assert.equal(currentCard(s,data),null);
  s=transition(s,{type:'deduce',revision:s.revision},data);assert.equal(currentCard(s,data).id,locked.id);
  s=transition(s,{type:'resolve',revision:s.revision,cardId:locked.id,choiceId:locked.choices[0].id,dice:[6,6]},data);
  s=transition(s,{type:'next'},data);assert.equal(currentCard(s,data),null);assert.equal(s.cursors['location-0'],2);
});

test('deduction clears a stale selected choice when unlocking changes the active card',()=>{
  const first=structuredClone(content.cards[0]),second=structuredClone(content.cards[1]);
  first.conditions=[{type:'cardUnlocked',id:first.id}];
  const definitions=structuredClone(investigationDefinitions);definitions.deductions[0].effects.push({type:'unlockCard',id:first.id});
  const data=createContent([first,second],definitions);let s={...newState(),evidence:['reward-2','reward-5']};
  s=transition(s,{type:'choose',choiceId:second.choices[0].id},data);assert.equal(s.choiceId,second.choices[0].id);
  s=transition(s,{type:'deduce',revision:s.revision},data);assert.equal(currentCard(s,data).id,first.id);assert.equal(s.choiceId,null);
});
