import test from 'node:test';
import assert from 'node:assert/strict';
import {newBlackwaterGame,blackwaterTransition,publicBlackwater} from '../src/engine/blackwater.js';
import {investigators} from '../src/data/blackwater-investigators.js';
const act=(s,type,extra={})=>blackwaterTransition(s,{type,revision:s.revision,...extra});
test('three investigators have distinct loadouts and one-use abilities',()=>{
 assert.equal(investigators.length,3);
 assert.equal(new Set(investigators.map(i=>i.id)).size,3);
 for(const investigator of investigators){
   let s=act(newBlackwaterGame(),'selectInvestigator',{investigatorId:investigator.id});
   assert.equal(publicBlackwater(s).investigatorId,investigator.id);
   assert.deepEqual(s.game.inventory,investigator.startingItems);
   const used=act(s,'useAbility');
   if(investigator.id==='sailor')assert.equal(used,s); // cannot heal at full health
   else{assert.equal(used.abilityUsed,true);assert.equal(act(used,'useAbility'),used);}
 }
});
test('investigator cannot change after scenario begins',()=>{
 let s=newBlackwaterGame();
 s=act(s,'endRound');
 assert.equal(act(s,'selectInvestigator',{investigatorId:'occultist'}),s);
});
test('sailor heals once when injured',()=>{
 let s=act(newBlackwaterGame(),'selectInvestigator',{investigatorId:'sailor'});
 s.game.hp=4;
 s=act(s,'useAbility');
 assert.equal(s.game.hp,6);
 assert.equal(s.abilityUsed,true);
 assert.equal(act(s,'useAbility'),s);
});
