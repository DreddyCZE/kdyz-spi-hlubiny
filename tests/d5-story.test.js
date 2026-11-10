import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterContent as data} from '../src/engine/content.js';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {newScenarioSession,scenarioSessionTransition as transition,scenarioSessionView as view} from '../src/engine/scenario-session.js';
import {currentCard,visibleResult} from '../src/engine/game.js';
import {saveScenarioSession,loadScenarioSession,validScenarioSession} from '../src/engine/scenario-storage.js';
import {validatePuzzle} from '../src/engine/puzzle.js';

const act=(s,a,d=data)=>transition(s,{...a,revision:s.game.revision},def,d);
const db=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
for(const p of data.puzzles)test(`${p.id}: failure, real fallback, save and no duplicate rewards`,()=>{
 let s=newScenarioSession(def,data);s.game.locationId=p.locationId;s.game.evidence=[...(p.requiredEvidence||[])];
 const hidden=view(s,def,data).puzzles.find(x=>x.id===p.id);assert.equal(hidden.interaction.answer,undefined);assert.equal(hidden.resultText,'');
 s=act(s,{type:'attemptPuzzle',puzzleId:p.id,answer:null});assert.equal(s.game.threat,3);
 const repeated=act(s,{type:'attemptPuzzle',puzzleId:p.id,answer:null});assert.equal(repeated.game.threat,3);
 s=act(repeated,{type:'usePuzzleFallback',puzzleId:p.id});assert.equal(s.game.ap,2);assert.equal(s.game.threat,4);
 assert.equal(s.scenario.puzzles[p.id].status,'bypassed');assert.ok(validScenarioSession(s,def,data));
 const storage=db();assert.ok(saveScenarioSession(storage,s,def,data));assert.deepEqual(loadScenarioSession(storage,def,data),s);
 assert.strictEqual(act(s,{type:'usePuzzleFallback',puzzleId:p.id}),s);
 assert.strictEqual(act(s,{type:'attemptPuzzle',puzzleId:p.id,answer:p.interaction.answer}),s);
});
for(const p of data.puzzles.slice(1))test(`${p.id}: evidence gates solution and a solved attempt cannot replay`,()=>{
 let s=newScenarioSession(def,data);s.game.locationId=p.locationId;
 assert.equal(view(s,def,data).puzzles.find(x=>x.id===p.id).canAttempt,false);
 assert.strictEqual(act(s,{type:'attemptPuzzle',puzzleId:p.id,answer:p.interaction.answer}),s);
 s.game.evidence=[...p.requiredEvidence];
 const solved=act(s,{type:'attemptPuzzle',puzzleId:p.id,answer:p.interaction.answer});
 assert.equal(solved.scenario.puzzles[p.id].status,'solved');assert.equal(solved.game.threat,2);
 assert.strictEqual(transition(solved,{type:'attemptPuzzle',puzzleId:p.id,answer:p.interaction.answer,revision:s.game.revision},def,data),solved);
 assert.strictEqual(act(solved,{type:'attemptPuzzle',puzzleId:p.id,answer:p.interaction.answer}),solved);
 const storage=db();assert.ok(saveScenarioSession(storage,solved,def,data));assert.deepEqual(loadScenarioSession(storage,def,data),solved);
});
test('mechanism draft survives reload; malformed or solved drafts are rejected',()=>{
 const p=data.puzzles.find(p=>p.type==='mechanism');let s=newScenarioSession(def,data);s.game.locationId=p.locationId;
 const draft={pause:'short',beam:'town'};
 s=act(s,{type:'setPuzzleDraft',puzzleId:p.id,answer:draft});assert.equal(s.game.ap,3);assert.equal(s.scenario.puzzles[p.id].attempts,0);
 const storage=db();assert.ok(saveScenarioSession(storage,s,def,data));s=loadScenarioSession(storage,def,data);
 assert.deepEqual(view(s,def,data).puzzles.find(x=>x.id===p.id).draft,draft);
 assert.strictEqual(act(s,{type:'setPuzzleDraft',puzzleId:p.id,answer:{pause:'wrong',beam:'town'}}),s);
 const corrupt=structuredClone(s);corrupt.scenario.puzzles[p.id].draft={};assert.equal(validScenarioSession(corrupt,def,data),false);
 assert.ok(validatePuzzle({...p,requiredEvidence:'oops'}).length);
});

test('name puzzle compares archive and cemetery evidence while preserving previously solved saves',()=>{
 let s=newScenarioSession(def,data);s.game.locationId='location-4';s.game.evidence=['reward-10','reward-11'];
 assert.equal(view(s,def,data).puzzles.find(p=>p.id==='bw-missing-name').canAttempt,false);
 assert.strictEqual(act(s,{type:'attemptPuzzle',puzzleId:'bw-missing-name',answer:'nathaniel-voss'}),s);
 s.game.evidence.push('reward-14');s=act(s,{type:'attemptPuzzle',puzzleId:'bw-missing-name',answer:'nathaniel-voss'});
 assert.equal(s.scenario.puzzles['bw-missing-name'].status,'solved');
 s.game.evidence=s.game.evidence.filter(id=>id!=='reward-14');
 const storage=db();assert.ok(saveScenarioSession(storage,s,def,data));
 assert.equal(view(loadScenarioSession(storage,def,data),def,data).puzzles.find(p=>p.id==='bw-missing-name').status,'solved');
});

function journey(hero){
 let s=act(newScenarioSession(def,data),{type:'selectInvestigator',investigatorId:hero});
 const actions=[];
 const run=a=>{const before=s;s=act(s,a);assert.notStrictEqual(s,before,JSON.stringify(a));assert.ok(validScenarioSession(s,def,data));actions.push(a.type);};
 const afford=n=>{if(s.game.ap<n)run({type:'endRound'});assert.ok(s.game.round<=12);};
 const resolve=o=>{afford(o.apCost);const c=currentCard(s.game,data);if(o.test){run({type:'choose',choiceId:o.id});const bonus=view(s,def,data).testBonuses[o.test.attribute]||0;run({type:'startTest',cardId:c.id,choiceId:o.id,dice:[4,4-bonus]});assert.equal(visibleResult(s.game,data),null);run({type:'acceptTest'});}else run({type:'resolve',cardId:c.id,choiceId:o.id});run({type:'next'});};
 const seek=id=>{for(let n=0;n<60;n++){if(!currentCard(s.game,data))run({type:'draw'});const c=currentCard(s.game,data);if(c.id===id)return c;resolve(c.id==='bw-02-01'?c.choices.find(o=>o.id==='bw-02-01-alternate'):[...c.choices].filter(o=>!o.unavailableReason||o.unavailableReason==='Nedostatek AP').sort((a,b)=>a.apCost-b.apCost)[0]);}assert.fail(id);};
 return {run,resolve,seek,move:id=>{afford(1);run({type:'move',locationId:id});},get s(){return s;}};
}
for(const hero of ['detective','occultist','sailor'])for(const ending of ['quiet-sea','broken-bell','voice-price'])test(`${hero}: public narrative journey reaches ${ending} with clues, puzzles and consequences`,t=>{
 const j=journey(hero);
 j.resolve(j.seek('0-0').choices[0]);
 j.move('location-2');j.resolve(j.seek('bw-02-04').choices[0]);
 j.move('location-4');
 // The original cemetery card supplies the ritual evidence.
 j.resolve(j.seek('4-0').choices[0]);
 j.run({type:'attemptPuzzle',puzzleId:'bw-missing-name',answer:'nathaniel-voss'});
 j.move('location-3');j.resolve(j.seek('bw-03-04').choices.find(o=>o.id==='bw-03-04-ally'));
 j.move('location-5');j.resolve(j.seek('5-0').choices[0]);
 assert.ok(['reward-2','reward-9','reward-12'].every(id=>j.s.game.evidence.includes(id)),JSON.stringify(j.s.game.evidence));
 j.run({type:'attemptPuzzle',puzzleId:'bw-lighthouse-signal',answer:{pause:'short',beam:'sea'}});
 j.run({type:'attemptPuzzle',puzzleId:'bw-bell-order',answer:['eye','anchor','wave']});
 j.resolve(j.seek('bw-05-04').choices.find(o=>o.id==='bw-05-04-trust'));
 j.move('location-1');j.resolve(j.seek('bw-01-01').choices[0]);
 j.move('location-6');j.resolve(j.seek('bw-event-02').choices.find(o=>o.id==='bw-event-02-rescue'));
 const before=view(j.s,def,data);assert.deepEqual(before.epilogue,[]);assert.ok(before.availableEndings.some(e=>e.id===ending));
 j.run({type:'finishScenario',endingId:ending});const final=view(j.s,def,data);
 assert.equal(final.ending.id,ending);assert.ok(final.epilogue.join(' ').includes('Voss'));assert.ok(final.epilogue.join(' ').includes('Samuel Reed'));
 assert.strictEqual(act(j.s,{type:'endRound'}),j.s);
 const storage=db();assert.ok(saveScenarioSession(storage,j.s,def,data));assert.deepEqual(view(loadScenarioSession(storage,def,data),def,data).epilogue,final.epilogue);
 t.diagnostic(`round=${j.s.game.round}, HP=${j.s.game.hp}, SAN=${j.s.game.san}`);
});
test('waiting until the seventh bell reaches the defeat epilogue without fabricated evidence',()=>{
 let s=newScenarioSession(def,data);for(let n=0;n<12;n++)s=act(s,{type:'endRound'});
 assert.equal(view(s,def,data).ending.id,'deep-answers');assert.ok(view(s,def,data).epilogue[0].includes('Milost'));assert.deepEqual(s.game.evidence,[]);
});
