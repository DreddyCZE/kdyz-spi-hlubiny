import test from 'node:test';
import assert from 'node:assert/strict';
import {newState,currentCard,explorationView,transition} from '../src/engine/game.js';
import {content,createContent} from '../src/engine/content.js';
import {save,load,validState,migrateV3,SAVE_KEY} from '../src/engine/storage.js';
const draw=(s,data=content)=>transition(s,{type:'draw',revision:s.revision},data);
const resolve=(s,data=content)=>transition(s,{type:'resolve',revision:s.revision,cardId:currentCard(s,data).id,choiceId:currentCard(s,data).choices[0].id,dice:[6,6]},data);
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};
function fixture(){const cards=structuredClone(content.cards.slice(0,2));for(const c of cards)for(const o of c.choices)o.outcomes.criticalSuccess.effects=[];return cards;}
test('new deck exposes only thematic aggregate counts until explicit revision-guarded free draw',()=>{
 const s=newState(),view=explorationView(s);assert.equal(currentCard(s),null);assert.equal(view.available,3);assert.equal(view.deferred,0);
 const json=JSON.stringify(view);for(const c of content.cards){assert.ok(!json.includes(c.title));assert.ok(!json.includes(c.id));}
 assert.equal(transition(s,{type:'draw',revision:99}),s);assert.equal(transition(s,{type:'resolve',revision:0,cardId:'0-0',choiceId:'0-0-choice-1',dice:[6,6]}),s);
 const n=draw(s);assert.equal(n.ap,3);assert.equal(currentCard(n).id,'0-0');assert.equal(draw(n),n);assert.equal(s.drawnCards['location-0'],undefined);
});
test('all seven locations have unique themes and the catalog uses every supported card type',()=>{
 assert.equal(content.refs.locations.length,7);
 assert.deepEqual(Object.keys(content.decksByLocation).sort(),[...content.refs.locations].sort());
 for(const metadata of Object.values(content.decksByLocation))assert.ok(metadata.name&&metadata.description);
 assert.deepEqual(new Set(content.cards.map(card=>card.type)),new Set(['encounter','event','item','evidence']));
});
test('deterministic card order survives save at every phase and never repeats consumed cards',()=>{
 function run(){let s=newState(),order=[];const store=memory();for(let i=0;i<3;i++){
  assert.ok(save(store,s));s=load(store);s=draw(s);order.push(currentCard(s).id);assert.ok(save(store,s));s=load(store);
  s=resolve(s);assert.ok(save(store,s));const loaded=load(store);assert.deepEqual(loaded,s);assert.equal(resolve(loaded),loaded);
  s=transition(loaded,{type:'next'});assert.equal(currentCard(s),null);
 }assert.equal(explorationView(s).canDraw,false);assert.equal(draw(s),s);return order;}
 assert.deepEqual(run(),['0-0','0-1','harbor-note']);assert.deepEqual(run(),run());
});
test('condition-deferred cards remain reachable after cursor even without explicit unlock effects',()=>{
 const cards=fixture();cards[0].conditions=[{type:'minRound',round:2}];const data=createContent(cards);let s=newState(data);
 assert.equal(explorationView(s,data).deferred,1);s=draw(s,data);assert.equal(currentCard(s,data).id,cards[1].id);
 s=resolve(s,data);s=transition(s,{type:'next'},data);assert.equal(draw(s,data),s);s=transition(s,{type:'endRound'},data);
 s=draw(s,data);assert.equal(currentCard(s,data).id,cards[0].id);
});
test('repeatable first card cannot starve later cards; each cycle needs draw and new resolve revision',()=>{
 const cards=fixture();cards[0].repeatable=true;const data=createContent(cards);let s=draw(newState(data),data);
 s=resolve(s,data);const request={type:'resolve',revision:s.revision-1,cardId:cards[0].id,choiceId:cards[0].choices[0].id,dice:[6,6]};
 s=transition(s,{type:'next'},data);s=draw(s,data);assert.equal(currentCard(s,data).id,cards[1].id);s=resolve(s,data);
 s=transition(s,{type:'next'},data);s=draw(s,data);assert.equal(currentCard(s,data).id,cards[0].id);assert.equal(s.result,null);assert.equal(transition(s,request,data),s);
 s={...s,ap:0};const noAP=resolve(s,data);assert.equal(noAP,s);s=transition(s,{type:'endRound'},data);const n=resolve(s,data);assert.equal(n.ap,2);assert.ok(n.result);
});
test('travel preserves unresolved cards and achieved repeatable outcomes without reopening reward',()=>{
 const cards=fixture();cards[0].repeatable=true;const data=createContent(cards);let s=draw(newState(data),data);
 s=transition(s,{type:'move',locationId:'location-1'},data);assert.equal(currentCard(s,data),null);
 s=transition(s,{type:'move',locationId:'location-0'},data);assert.equal(currentCard(s,data).id,cards[0].id);s=resolve(s,data);
 s=transition(s,{type:'endRound'},data);s=transition(s,{type:'move',locationId:'location-1'},data);s=transition(s,{type:'move',locationId:'location-0'},data);assert.ok(s.result);assert.equal(resolve(s,data),s);
});
test('v3 migration preserves pinned result, AP and original key; validates before accepting',()=>{
 const store=memory(),played=resolve(draw(newState()));const old={...played,version:3};delete old.drawnCards;const raw=JSON.stringify(old);store.setItem('hlubiny-v3',raw);
 const s=load(store);assert.equal(s.version,4);assert.deepEqual(s.result,old.result);assert.equal(s.ap,old.ap);assert.equal(currentCard(s).id,'0-0');assert.equal(resolve(s),s);assert.equal(store.getItem('hlubiny-v3'),raw);assert.ok(save(store,s));assert.ok(store.getItem(SAVE_KEY));
 assert.equal(validState({...s,result:null}),false);assert.equal(migrateV3({...old,cursors:null}),null);assert.equal(migrateV3({...old,extra:true}),null);assert.equal(migrateV3({...old,locationId:'unknown'}),null);
 for(const drawnCards of [null,[],{'location-0':'unknown'},{'location-1':'0-0'},{unknown:'0-0'}])assert.equal(validState({...s,drawnCards}),false);
});

test('exhausted repeatable cards rotate in stable order rather than starving later repeatables',()=>{
 const cards=fixture();for(const c of cards)c.repeatable=true;const data=createContent(cards);let s=newState(data),ids=[];
 for(let i=0;i<6;i++){if(s.ap===0)s=transition(s,{type:'endRound'},data);s=draw(s,data);ids.push(currentCard(s,data).id);s=resolve(s,data);s=transition(s,{type:'next'},data);}
 assert.deepEqual(ids,[cards[0].id,cards[1].id,cards[0].id,cards[1].id,cards[0].id,cards[1].id]);
});
test('legacy migration does not pre-draw cards in locations never visited',()=>{
 const old={...newState(),version:3};delete old.drawnCards;let s=migrateV3(old);assert.ok(currentCard(s));assert.deepEqual(Object.keys(s.drawnCards),['location-0']);
 s=transition(s,{type:'move',locationId:'location-1'});assert.equal(currentCard(s),null);assert.ok(explorationView(s).canDraw);
});
