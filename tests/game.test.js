import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {newState,currentCard,selectedChoice,visibleResult,transition as act,evaluate,rollDice,meetsConditions,applyEffects} from '../src/engine/game.js';
import {load,save,validState,migrateV1,SAVE_KEY} from '../src/engine/storage.js';
import {content,catalog,createContent,rewardNames} from '../src/engine/content.js';
import {validateCards,assertCards,outcomeKeys} from '../src/engine/schema.js';
import {cards} from '../src/data/cards.js';
import {exampleCard} from '../src/data/example-card.js';

function resolve(s,dice=[6,6],choiceId=selectedChoice(s)?.id,data=content){
  return act(s,{type:'resolve',revision:s.revision,cardId:currentCard(s,data)?.id,choiceId,dice},data);
}
function exampleState(){return {...newState(),cursors:{'location-0':2}};}
function memory(){const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}
test('six outcomes, thresholds and natural critical priority',()=>{
  for(const [a,b,bonus,diff,key] of [[6,6,-20,99,'criticalSuccess'],[1,1,20,2,'criticalFailure'],[4,4,3,8,'greatSuccess'],[3,3,2,8,'success'],[2,2,2,8,'partialSuccess'],[1,2,1,8,'failure']])assert.equal(evaluate(a,b,bonus,diff).key,key);
  assert.throws(()=>evaluate(0,7,2,8),RangeError);assert.deepEqual(rollDice(()=>0),[1,1]);assert.deepEqual(rollDice(()=>.999),[6,6]);
});
test('M1 moves and AP limits remain immutable',()=>{
  const s=newState(),n=act(s,{type:'move',locationId:'location-1'});assert.equal(n.ap,2);assert.equal(s.locationId,'location-0');
  n.ap=0;assert.equal(act(n,{type:'move',locationId:'location-2'}),n);
  assert.equal(act(s,{type:'move',locationId:'bad'}),s);
  const locked={...s,unlockedLocations:['location-0']};assert.equal(act(locked,{type:'move',locationId:'location-1'}),locked);
});
test('combined HP/SAN loss, single payment and duplicate protection',()=>{
  const initial=newState(),s=resolve(initial,[1,1]);assert.equal(s.hp,4);assert.equal(s.san,7);assert.equal(s.ap,2);
  assert.equal(resolve(s),s);assert.equal(initial.hp,6);
  assert.equal(act(s,{type:'choose',choiceId:'0-0-choice-2'}),s);
});
test('nonrepeatable cards remain resolved across travel, reload and rounds',()=>{
  let s=resolve(newState());s=act(s,{type:'move',locationId:'location-1'});s=act(s,{type:'move',locationId:'location-0'});s=act(s,{type:'endRound'});
  const storage=memory();assert.ok(save(storage,s));s=load(storage);assert.equal(resolve(s),s);
  s=act(s,{type:'next'});assert.equal(currentCard(s).title,'Muž z mlhy');s=resolve(s);s=act(s,{type:'next'});
  assert.equal(currentCard(s).id,'harbor-note');s=resolve(s,undefined,'harbor-note-leave');s=act(s,{type:'next'});assert.equal(currentCard(s),null);
});
test('seven rounds, AP restoration, ritual deadline and all terminal thresholds',()=>{
  let s=newState();for(let i=0;i<6;i++)s=act(s,{type:'endRound'});assert.equal(s.round,7);assert.equal(s.ap,3);assert.equal(s.ended,false);
  s=act(s,{type:'endRound'});assert.equal(s.ritual,8);assert.equal(s.ended,true);assert.equal(s.round,7);
  for(const override of [{hp:1},{san:1},{threat:9,locationId:'location-4'},{ritual:7,locationId:'location-5'}]){
    const ended=resolve({...newState(),...override},[1,1]);assert.ok(ended.ended);assert.ok(ended.hp>=0&&ended.san>=0);
    for(const type of ['move','resolve','choose','next','endRound'])assert.equal(act(ended,{type}),ended);
  }
});
test('all six condition types, AND semantics, false/missing flags and boundary rounds',()=>{
  const s={...newState(),inventory:[catalog.items[0]],evidence:[catalog.evidence[0]],flags:{'harbor-note-read':false},round:3};
  const conditions=[{type:'hasItem',id:catalog.items[0]},{type:'hasEvidence',id:catalog.evidence[0]},{type:'flagEquals',id:'harbor-note-read',value:false},{type:'minRound',round:3},{type:'maxRound',round:3},{type:'locationUnlocked',id:'location-0'}];
  assert.ok(meetsConditions(s,conditions));
  for(let i=0;i<conditions.length;i++){const c=structuredClone(conditions);if('id'in c[i])c[i].id='unknown';else c[i].round=c[i].type==='minRound'?4:2;assert.equal(meetsConditions(s,c),false);}
  assert.equal(meetsConditions(s,[{type:'flagEquals',id:'missing',value:false}]),false);
});
test('all eight effects, unique rewards, clamps and atomic rollback',()=>{
  const s={...newState(),unlockedLocations:['location-0']},item=catalog.items[0],evidence=catalog.evidence[0];
  const next=applyEffects(s,[{type:'modifyStat',stat:'hp',amount:-99},{type:'modifyStat',stat:'san',amount:99},{type:'addItem',id:item},{type:'addItem',id:item},{type:'removeItem',id:item},{type:'addEvidence',id:evidence},{type:'addEvidence',id:evidence},{type:'setFlag',id:'harbor-note-read',value:true},{type:'modifyThreat',amount:99},{type:'modifyRitual',amount:-99},{type:'unlockLocation',id:'location-1'}]);
  assert.equal(next.hp,0);assert.equal(next.san,8);assert.equal(next.threat,10);assert.equal(next.ritual,0);assert.deepEqual(next.inventory,[]);assert.deepEqual(next.evidence,[evidence]);assert.equal(next.flags['harbor-note-read'],true);assert.ok(next.unlockedLocations.includes('location-1'));
  assert.equal(applyEffects(s,[{type:'addEvidence',id:evidence},{type:'removeItem',id:item}]),null);assert.deepEqual(s.evidence,[]);
});
test('choice-specific costs, conditions, modifier and testless decisions',()=>{
  const s=exampleState();assert.equal(resolve(s,undefined,'harbor-note-copy'),s);
  const n=resolve(s,undefined,'harbor-note-leave');assert.equal(n.ap,3);assert.equal(n.result.dice,null);assert.equal(n.result.key,'success');
  const copy=resolve({...s,evidence:['reward-2']},undefined,'harbor-note-copy');assert.equal(copy.ap,2);assert.ok(copy.evidence.includes('harbor-note-copy'));assert.equal(copy.flags['harbor-note-read'],true);
  const studied=resolve(s,[3,3],'harbor-note-study');assert.equal(studied.ap,1);assert.equal(studied.result.total,10);assert.equal(studied.result.key,'success');
  assert.notEqual(visibleResult(n).text,visibleResult(studied).text);
  const poor={...s,ap:1};assert.equal(resolve(poor,[6,6],'harbor-note-study'),poor);
});
test('public metadata has no hidden outcomes; only achieved result is projected',()=>{
  const s=newState(),view=currentCard(s);assert.equal(visibleResult(s),null);
  assert.ok(!JSON.stringify(view).includes('outcomes'));assert.ok(!JSON.stringify(view).includes('Najdeš deník'));
  const r=visibleResult(resolve(s,[1,1]));assert.ok(r.text.includes('2 HP a 1 SAN'));assert.ok(!('effects'in r));assert.ok(!('outcomes'in r));
});
test('repeatable cards require next and a fresh revision; stale queued requests cannot reward',()=>{
  const c=structuredClone(cards[0]);c.repeatable=true;const data=createContent([c]);let s=newState();
  const request={type:'resolve',revision:s.revision,cardId:c.id,choiceId:c.choices[0].id,dice:[6,6]};
  s=act(s,request,data);assert.equal(act(s,request,data),s);assert.equal(resolve(s,[6,6],c.choices[0].id,data),s);
  s=act(s,{type:'next'},data);assert.equal(visibleResult(s,data),null);assert.equal(act(s,request,data),s);
  const n=resolve(s,[6,6],c.choices[0].id,data);assert.equal(n.ap,1);assert.equal(n.inventory.length,1);
});
test('card conditions gate presentation and execution, results stay pinned when effects change conditions',()=>{
  const c=structuredClone(exampleCard);c.conditions=[{type:'flagEquals',id:'harbor-note-read',value:false}];
  const data=createContent([c]),s=newState();assert.equal(currentCard(s,data),null);
  const ready={...s,flags:{'harbor-note-read':false},evidence:['reward-2']};
  const n=resolve(ready,undefined,'harbor-note-copy',data);assert.ok(currentCard(n,data));assert.ok(visibleResult(n,data));
});
test('failed effect precondition rolls back AP and all preceding effects',()=>{
  const c=structuredClone(exampleCard);c.choices[0].apCost=1;c.choices[0].outcomes.success.effects=[{type:'addEvidence',id:'harbor-note-copy'},{type:'removeItem',id:catalog.items[0]}];
  const data=createContent([c]),s=newState();assert.equal(resolve(s,undefined,c.choices[0].id,data),s);
});
test('invalid card definitions rejected with concrete paths',()=>{
  const badMutations=[c=>c.id='',c=>c.type='combat',c=>c.locationId='nowhere',c=>c.repeatable='no',c=>c.conditions=[{type:'eval',value:'true'}],c=>c.choices[0].apCost=-1,c=>c.choices[0].test.attribute='bad',c=>c.choices[0].test.modifier='1',c=>delete c.choices[0].outcomes.criticalSuccess,c=>c.choices[0].outcomes.success.effects=[{type:'modifyStat',stat:'gold',amount:1}],c=>c.choices[0].outcomes.success.effects=[{type:'addEvidence',id:'bad'}],c=>c.choices[0].conditions=[{type:'minRound',round:12}],c=>c.choices[0].test=null,c=>c.choices[0].outcomes.success=null,c=>c.choices[0].outcomes.success.effects=[{type:'setFlag',id:'harbor-note-read',value:{}}]];
  for(const mutate of badMutations){const c=structuredClone(cards[0]);mutate(c);const errors=validateCards([c],catalog);assert.ok(errors.length>0);assert.ok(errors[0].startsWith('cards[0].'));assert.throws(()=>assertCards([c],catalog),/Neplatná karetní data/);}
  assert.ok(validateCards([cards[0],cards[0]],catalog).some(e=>e.includes('duplicitní')));
  assert.deepEqual(validateCards(content.cards,catalog),[]);
  assert.ok(validateCards([null],catalog).length);assert.ok(validateCards({},catalog).length);
});
test('four registered types and explicitly registered future type share the decision model',()=>{
  for(const type of ['encounter','event','item','evidence']){const c={...cards[0],type};assert.deepEqual(validateCards([c],catalog),[]);}
  assert.deepEqual(validateCards([{...cards[0],type:'future'}],catalog,['future']),[]);
});
test('migration preserves every prototype story, choice and consequence text',()=>{
  const html=readFileSync(new URL('../public/legacy-prototype.html',import.meta.url),'utf8');
  const old=runInNewContext(html.match(/const locations=([\s\S]*?);\s*const \$=/)[1]);
  assert.equal(cards.length,8);
  old.forEach((loc,l)=>loc[2].forEach((c,i)=>{
    const migrated=cards.find(x=>x.id===`${l}-${i}`);assert.equal(migrated.title,c[0]);assert.equal(migrated.description,c[1]);
    migrated.choices.forEach((o,j)=>{assert.equal(o.label,c[3][j][0]);assert.equal(o.test.attribute,c[3][j][1]);assert.equal(o.test.difficulty,c[2]);outcomeKeys.forEach((key,k)=>assert.equal(o.outcomes[key].text,c[4][[0,0,1,2,3,4][k]]));});
  }));
});
test('each migrated outcome retains damage, tracks and the named reward',()=>{
  for(const c of cards)for(const o of c.choices)for(const r of Object.values(o.outcomes)){
    const effect=(type,stat)=>r.effects.filter(e=>e.type===type&&(!stat||e.stat===stat)).reduce((n,e)=>n+e.amount,0);
    assert.equal(effect('modifyStat','hp'),-Number(r.text.match(/(\d+) HP/)?.[1])||0);
    assert.equal(effect('modifyStat','san'),-Number(r.text.match(/(\d+) SAN/)?.[1])||0);
    assert.equal(effect('modifyThreat'),r.text.includes('Hrozba +1')?1:0);
    assert.equal(effect('modifyRitual'),r.text.includes('Rituál +1')?1:0);
    for(const e of r.effects.filter(e=>['addItem','addEvidence'].includes(e.type)))assert.ok(rewardNames[e.id]);
  }
});
test('current save round trip includes result, flags, evidence and spent AP',()=>{
  for(const s of [newState(),resolve(newState()),resolve(exampleState(),undefined,'harbor-note-leave'),resolve({...exampleState(),evidence:['reward-2']},undefined,'harbor-note-copy')]){
    const storage=memory();assert.ok(validState(s));assert.ok(save(storage,s));assert.deepEqual(load(storage),s);
    if(s.result){const loaded=load(storage);assert.equal(resolve(loaded),loaded);}
  }
});
test('corrupt, unsupported, forged and blocked saves safely fall back',()=>{
  const mutations=[s=>s.version=999,s=>s.locationId='bad',s=>s.hp=-1,s=>s.ended=true,s=>s.cursors={'location-0':99},s=>s.inventory=['bad'],s=>s.evidence=['bad'],s=>s.flags={'__invalid':true},s=>s.resolved={bad:{}},s=>s.result={},s=>s.choiceId='bad',s=>s.extra=true,s=>s.revision=-1];
  for(const mutate of mutations){const s=newState();mutate(s);const storage=memory();storage.setItem(SAVE_KEY,JSON.stringify(s));assert.deepEqual(load(storage),newState());assert.equal(save(storage,s),false);}
  const r=resolve(newState());r.result.total=999;assert.equal(validState(r),false);
  const crafted=newState();crafted.resolved=JSON.parse('{"constructor":{"cardId":"constructor","choiceId":"x","dice":null,"key":"success","revision":1,"total":null}}');crafted.revision=1;assert.equal(validState(crafted),false);
  assert.deepEqual(load(undefined),newState());assert.equal(save(undefined,newState()),false);
  assert.deepEqual(load({getItem:()=>'{broken'}),newState());
});
test('M1 saves migrate to stable IDs without mutating their source key',()=>{
  const old={version:1,place:0,round:1,ap:2,threat:2,ritual:1,hp:6,san:8,inventory:['Deník a přívěsek'],indices:{},choice:0,resolved:{},result:null,ended:false,log:['M1']};
  const r={dice:[6,6],total:14,index:0,cardId:'0-0',choice:0};old.resolved['0-0']=r;old.result=r;
  const storage=memory(),raw=JSON.stringify(old);storage.setItem('hlubiny-v1',raw);const s=load(storage);
  assert.equal(s.version,3);assert.equal(s.result.key,'criticalSuccess');assert.equal(s.inventory[0],'reward-1');assert.equal(resolve(s),s);assert.equal(storage.getItem('hlubiny-v1'),raw);assert.ok(save(storage,s));
  old.result.total=999;assert.equal(migrateV1(old),null);
});

test('diary comparison accepts ordinary, great and critical boat rewards after save/load',()=>{
  for(const [dice,key] of [[[3,3],'success'],[[4,5],'greatSuccess'],[[6,6],'criticalSuccess']]){
    let s=resolve(newState(),dice);assert.equal(s.result.key,key);
    const storage=memory();assert.ok(save(storage,s));s=load(storage);
    // Inspect the example using only its cursor; keep the actual earned rewards.
    s={...s,cursors:{'location-0':2},choiceId:null,result:null};
    const choice=currentCard(s).choices.find(o=>o.id==='harbor-note-copy');
    assert.equal(choice.available,true,key);
    const copied=resolve(s,undefined,choice.id);assert.ok(copied.evidence.includes('harbor-note-copy'));assert.equal(copied.ap,s.ap-1);
  }
  for(const evidence of [[],['reward-3']]){
    const s={...exampleState(),evidence};assert.equal(currentCard(s).choices.find(o=>o.id==='harbor-note-copy').available,false);
    assert.equal(resolve(s,undefined,'harbor-note-copy'),s);
  }
});

test('M1 diary and composite saves both retain diary comparison without rewriting their rewards',()=>{
  for(const name of ['Deník','Deník a přívěsek']){
    const old={version:1,place:0,round:1,ap:3,threat:2,ritual:1,hp:6,san:8,inventory:[name],indices:{0:2},choice:0,resolved:{},result:null,ended:false,log:['M1']};
    const s=migrateV1(old);assert.ok(s);
    assert.equal(currentCard(s).choices.find(o=>o.id==='harbor-note-copy').available,true,name);
    assert.ok([...s.inventory,...s.evidence].map(id=>rewardNames[id]).includes(name));
    assert.ok(s.evidence.includes('reward-2')); // Information remains known independently of the physical reward.
    assert.ok(resolve(s,undefined,'harbor-note-copy').evidence.includes('harbor-note-copy'));
  }
});
