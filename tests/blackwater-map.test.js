import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterRoutes,nextEnemyLocation,moveEnemies} from '../src/engine/blackwater-map.js';
import {newBlackwaterGame,blackwaterTransition} from '../src/engine/blackwater.js';
const act=(s,type,extra={})=>blackwaterTransition(s,{type,revision:s.revision,...extra});
test('routes are connected, reciprocal and point to known locations',()=>{
 const ids=Object.keys(blackwaterRoutes);
 for(const [from,neighbors] of Object.entries(blackwaterRoutes))
  for(const to of neighbors){assert.ok(ids.includes(to));assert.ok(blackwaterRoutes[to].includes(from));}
});
test('enemy pursues player by one edge and cannot teleport',()=>{
 assert.equal(nextEnemyLocation('location-0','location-6'),'location-5');
 assert.equal(nextEnemyLocation('location-3','location-6'),'location-1');
 assert.equal(nextEnemyLocation('location-2','location-2'),'location-2');
 assert.equal(nextEnemyLocation('unknown','location-0'),'unknown');
 const initial=[{enemyId:'enemy-fog-hound',locationId:'location-3'}];
 const moved=moveEnemies(initial,'location-6');
 assert.equal(moved[0].locationId,'location-1');
 assert.equal(initial[0].locationId,'location-3');
});
test('myth phase moves existing enemy toward player after each round',()=>{
 let s=newBlackwaterGame();
 s=act(s,'endRound');s=act(s,'endRound'); // drowned sailor at harbor
 s=act(s,'move',{locationId:'location-5'});
 s=act(s,'endRound');
 assert.equal(s.myth.enemies.find(e=>e.enemyId==='enemy-drowned-sailor').locationId,'location-5');
});

test('player can travel only along a connected edge',()=>{
 let s=newBlackwaterGame();
 const blocked=act(s,'move',{locationId:'location-3'});
 assert.equal(blocked,s);
 s=act(s,'move',{locationId:'location-1'});
 assert.equal(s.game.locationId,'location-1');
 assert.equal(s.game.ap,2);
 assert.equal(act(s,'move',{locationId:'location-5'}),s);
});
