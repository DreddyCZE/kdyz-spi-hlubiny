import test from 'node:test';
import assert from 'node:assert/strict';
import {newState,transition} from '../src/engine/game.js';
import {content} from '../src/engine/content.js';
test('legacy ritual still progresses after endRound',()=>{
 const s=newState(content),next=transition(s,{type:'endRound'},content);
 assert.equal(next.ritual,2);assert.equal(next.round,2);
});
test('scenario clock mode suppresses legacy ritual increments',()=>{
 const s=newState(content),rules={maxRounds:12,apPerRound:3,scenarioClock:true};
 let next=transition(s,{type:'endRound'},content,rules);
 assert.equal(next.ritual,1);assert.equal(next.round,2);
 for(let i=0;i<9;i++)next=transition(next,{type:'endRound'},content,rules);
 assert.equal(next.round,11);assert.equal(next.ritual,1);
});
test('legacy ritual threshold remains lethal but scenario mode ignores ritual alone',()=>{
 const s={...newState(content),ritual:7};
 const a=transition(s,{type:'endRound'},content);
 assert.equal(a.ended,true);
 const b=transition(s,{type:'endRound'},content,{maxRounds:12,apPerRound:3,scenarioClock:true});
 assert.equal(b.ended,false);
});
