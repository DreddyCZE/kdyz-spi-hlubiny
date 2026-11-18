import test from 'node:test';
import assert from 'node:assert/strict';
import {resultChanges,createResultReceipt} from '../src/ui/result-changes.js';
const before={hp:6,san:8,ap:3,threat:2,evidence:[],knowledge:[],inventory:[],revision:1,result:null};
test('result summary uses actual net values and newly gained IDs',()=>{
 const after={...before,hp:6,san:7,ap:2,evidence:['e'],inventory:['i']};
 assert.deepEqual(resultChanges(before,after),['−1 SAN','−1 AP','Nová stopa','Nová výbava']);
 assert.deepEqual(resultChanges(after,after),[]);
});
test('result receipt reloads only for the same committed result and tolerates storage failure',()=>{
 let raw;const db={setItem:(_,v)=>raw=v,getItem:()=>raw,removeItem:()=>raw=null};
 const after={...before,revision:2,result:{cardId:'card',revision:2},ap:2};
 const receipt=createResultReceipt(db,'test');receipt.record(before,after);
 assert.deepEqual(createResultReceipt(db,'test').read(after).changes,['−1 AP']);
 assert.equal(receipt.read({...after,revision:3}),null);receipt.clear();assert.equal(receipt.read(after),null);
 const broken=createResultReceipt({getItem(){throw Error();},setItem(){throw Error();}},'test');
 assert.equal(broken.read(after),null);assert.deepEqual(broken.record(before,after).changes,['−1 AP']);
});
