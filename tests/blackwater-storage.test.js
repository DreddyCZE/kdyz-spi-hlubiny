import test from 'node:test';
import assert from 'node:assert/strict';
import {saveBlackwater,loadBlackwater,clearBlackwater} from '../src/engine/blackwater-storage.js';
import {newBlackwaterGame} from '../src/engine/blackwater.js';
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
test('scenario save round trips independently',()=>{
 const store=storage(),game=newBlackwaterGame();
 assert.equal(saveBlackwater(store,game),true);
 assert.deepEqual(loadBlackwater(store),game);
 assert.equal(clearBlackwater(store),true);
 assert.equal(loadBlackwater(store),null);
});
test('invalid, stale or unavailable storage fails closed',()=>{
 const store=storage();
 store.setItem('ksh-blackwater-v1','not json');assert.equal(loadBlackwater(store),null);
 store.setItem('ksh-blackwater-v1',JSON.stringify({...newBlackwaterGame(),version:999}));assert.equal(loadBlackwater(store),null);
 assert.equal(loadBlackwater(null),null);
 assert.equal(saveBlackwater(null,newBlackwaterGame()),false);
});
