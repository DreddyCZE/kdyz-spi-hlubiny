import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, currentCard, transition as act, evaluate, rollDice } from '../src/engine/game.js';
import { load, save, validState } from '../src/engine/storage.js';
import { locations } from '../src/data/locations.js';

test('dice thresholds and natural doubles override attribute totals', () => {
  for (const [a,b,bonus,diff,index] of [[1,1,20,2,4],[6,6,-20,99,0],[4,4,3,8,0],[3,3,2,8,1],[2,2,2,8,2],[1,2,1,8,3]]) assert.equal(evaluate(a,b,bonus,diff).index,index);
  assert.throws(() => evaluate(0,7,2,8), RangeError);
  assert.deepEqual(rollDice(() => 0), [1,1]);
  assert.deepEqual(rollDice(() => .999), [6,6]);
});
test('moves cost AP, cannot underflow, and leave input immutable', () => {
  const s = newState(); let next = act(s,{type:'move',place:1});
  assert.equal(next.ap,2); assert.equal(s.place,0);
  next.ap=0; assert.equal(act(next,{type:'move',place:2}),next);
  assert.equal(act(s,{type:'move',place:-1}),s);
});
test('combined HP and SAN loss matches story and resolves only once', () => {
  const s=act(newState(),{type:'roll',dice:[1,1]});
  assert.equal(s.hp,4); assert.equal(s.san,7); assert.equal(s.ap,2);
  assert.equal(act(s,{type:'roll',dice:[6,6]}),s);
  assert.equal(act(s,{type:'choose',choice:1}),s);
});
test('resolved cards survive travel and round changes; decks exhaust', () => {
  let s=act(newState(),{type:'roll',dice:[6,6]});
  s=act(s,{type:'move',place:1}); s=act(s,{type:'move',place:0});
  s=act(s,{type:'endRound'});
  assert.equal(act(s,{type:'roll',dice:[6,6]}),s);
  s=act(s,{type:'next'}); assert.equal(currentCard(s).title,'Muž z mlhy');
  s=act(s,{type:'roll',dice:[6,6]}); s=act(s,{type:'next'});
  assert.equal(currentCard(s),null); assert.equal(s.inventory.length,2);
});
test('terminal thresholds block all actions and values are clamped', () => {
  for(const override of [{hp:1},{san:1},{threat:9,place:4},{ritual:7,place:5}]) {
    const s=act({...newState(),...override},{type:'roll',dice:[1,1]});
    assert.equal(s.ended,true); assert.ok(s.hp>=0 && s.san>=0);
    for(const type of ['move','roll','choose','next','endRound']) assert.equal(act(s,{type}),s);
  }
});
test('seven rounds, restored AP, ritual deadline', () => {
  let s=newState(); for(let i=0;i<6;i++) s=act(s,{type:'endRound'});
  assert.equal(s.round,7); assert.equal(s.ap,3); assert.equal(s.ended,false);
  s=act(s,{type:'endRound'}); assert.equal(s.ritual,8); assert.equal(s.ended,true); assert.equal(s.round,7);
});
test('all story cards contain valid choices and explicit effects', () => {
  const ids=new Set();
  for(const l of locations) for(const c of l.cards) {
    assert.ok(!ids.has(c.id)); ids.add(c.id); assert.equal(c.outcomes.length,5);
    assert.ok(c.choices.every(o=>['SÍ','OB','VĚ','VŮ','VN'].includes(o.attribute)));
    for(const o of c.outcomes) for(const key of ['hp','san','threat','ritual']) assert.ok(Number.isInteger(o.effects[key]));
  }
  assert.equal(ids.size,8);
});
test('save round trip includes resolved result and journal', () => {
  let raw; const storage={setItem:(_,value)=>raw=value,getItem:()=>raw};
  const s=act(newState(),{type:'roll',dice:[6,6]});
  assert.equal(save(storage,s),true); assert.deepEqual(load(storage),s);
  assert.equal(validState(act(s,{type:'next'})),true);
});
test('corrupt, unsupported and blocked storage falls back safely', () => {
  for(const data of [null,{}, {...newState(),place:99}, {...newState(),hp:-1}, {...newState(),indices:{0:-1}}, {...newState(),resolved:{bad:{}}}, {...newState(),ended:true}, {...newState(),result:{}}]) assert.deepEqual(load({getItem:()=>JSON.stringify(data)}),newState());
  assert.deepEqual(load({getItem:()=>'{broken'}),newState());
  assert.deepEqual(load(undefined),newState()); assert.equal(save(undefined,newState()),false);
});
