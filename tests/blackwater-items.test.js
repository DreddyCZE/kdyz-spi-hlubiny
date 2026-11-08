import test from 'node:test';
import assert from 'node:assert/strict';
import {newBlackwaterGame,blackwaterTransition,publicBlackwater} from '../src/engine/blackwater.js';
import {blackwaterItems} from '../src/data/blackwater-items.js';
const act=(s,type,rest={})=>blackwaterTransition(s,{type,revision:s.revision,...rest});
test('inventory definitions use unique ids and starting consumables',()=>{
 assert.equal(new Set(blackwaterItems.map(i=>i.id)).size,blackwaterItems.length);
 assert.deepEqual(newBlackwaterGame().game.inventory,['bw-bandage','bw-salt']);
});
test('healing consumes one item only when injured and cannot be repeated',()=>{
 let s=newBlackwaterGame();
 assert.equal(act(s,'useItem',{itemId:'bw-bandage'}),s);
 s.game.hp=4;
 s=act(s,'useItem',{itemId:'bw-bandage'});
 assert.equal(s.game.hp,6);
 assert.equal(s.game.inventory.includes('bw-bandage'),false);
 assert.equal(act(s,'useItem',{itemId:'bw-bandage'}),s);
});
test('salt banishes an active enemy and cannot be reused',()=>{
 let s=newBlackwaterGame();
 s=act(s,'endRound');s=act(s,'endRound');
 s=act(s,'startCombat',{enemyId:'enemy-drowned-sailor'});
 s=act(s,'useItem',{itemId:'bw-salt'});
 assert.equal(s.combat.status,'banished');
 assert.equal(s.myth.enemies.length,0);
 assert.equal(s.game.inventory.includes('bw-salt'),false);
 assert.equal(act(s,'useItem',{itemId:'bw-salt'}),s);
 s=act(s,'closeCombat');
 assert.equal(s.combat,null);
});
