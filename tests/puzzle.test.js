import test from 'node:test';
import assert from 'node:assert/strict';
import {createPuzzle,validatePuzzle,initialPuzzleState,puzzleView,attemptPuzzle,revealPuzzleHint} from '../src/engine/puzzle.js';
const sample={id:'test-bells',version:1,title:'Zvony',locationId:'location-0',type:'sequence',clues:[{id:'clue-one',text:'Oko první',sourceEvidenceId:'reward-10'}],interaction:{symbols:['eye','wave','anchor'],answer:['eye','anchor','wave']},attempts:{mode:'limited',max:3,penaltyAfter:1},hints:[{id:'hint-one',text:'Začni okem',sourceEvidenceId:'reward-10'}],onSolve:[{type:'setFlag',id:'bells-solved',value:true}],onWrong:[{type:'modifyThreat',amount:1}],fallback:{type:'alternatePath',id:'bell-fallback'}};
test('validates and clones puzzle definition',()=>{assert.deepEqual(validatePuzzle(sample),[]);const p=createPuzzle(sample);p.title='Changed';assert.equal(sample.title,'Zvony');assert.ok(validatePuzzle({...sample,interaction:{symbols:['eye','wave'],answer:['eye','eye']}}).length);});
test('projects clues only when evidence exists and never exposes solution',()=>{const p=createPuzzle(sample);const hidden=puzzleView(p,initialPuzzleState(),{evidence:[]});assert.equal(hidden.clues.length,0);assert.ok(!JSON.stringify(hidden).includes('anchor,wave'));assert.equal(hidden.interaction.answer,undefined);assert.equal(puzzleView(p,initialPuzzleState(),{evidence:['reward-10']}).clues.length,1);});
test('applies penalty once, then solves once and locks',()=>{const p=createPuzzle(sample);const first=attemptPuzzle(p,initialPuzzleState(),['wave','eye','anchor']);assert.equal(first.state.attempts,1);assert.deepEqual(first.effects,p.onWrong);const second=attemptPuzzle(p,first.state,['wave','eye','anchor']);assert.deepEqual(second.effects,[]);const third=attemptPuzzle(p,second.state,['eye','anchor','wave']);assert.equal(third.solved,true);assert.deepEqual(third.effects,p.onSolve);assert.equal(attemptPuzzle(p,third.state,['eye','anchor','wave']),null);});
test('limited attempts block and retain fallback path',()=>{const p=createPuzzle({...sample,attempts:{mode:'limited',max:1}});const r=attemptPuzzle(p,initialPuzzleState(),[]);assert.equal(r.state.status,'blocked');assert.equal(attemptPuzzle(p,r.state,[]),null);assert.equal(p.fallback.id,'bell-fallback');});
test('hints require evidence and cannot repeat',()=>{const p=createPuzzle(sample),s=initialPuzzleState();assert.equal(revealPuzzleHint(p,s,'hint-one',{evidence:[]}),null);const next=revealPuzzleHint(p,s,'hint-one',{evidence:['reward-10']});assert.deepEqual(next.hintIds,['hint-one']);assert.equal(revealPuzzleHint(p,next,'hint-one',{evidence:['reward-10']}),null);assert.equal(puzzleView(p,next,{evidence:['reward-10']}).hints.length,1);});
test('matching, deduction and mechanism answers',()=>{for(const [type,interaction,good,bad] of [['matching',{left:['a','b'],right:['x','y'],answer:{a:'y',b:'x'}},{a:'y',b:'x'},{a:'x',b:'y'}],['deduction',{options:['yes','no'],answer:'yes'},'yes','no'],['mechanism',{controls:['dial','lever'],states:{dial:['a','b'],lever:['up','down']},answer:{dial:'b',lever:'up'}},{dial:'b',lever:'up'},{dial:'a',lever:'up'}]]){const p=createPuzzle({...sample,type,interaction});assert.equal(attemptPuzzle(p,initialPuzzleState(),good).solved,true);assert.equal(attemptPuzzle(p,initialPuzzleState(),bad).solved,false);}});

test('public projection only offers hints when their evidence is known',()=>{
 const p=createPuzzle(sample);
 const hidden=puzzleView(p,initialPuzzleState(),{evidence:[]});
 assert.deepEqual(hidden.availableHints,[]);
 assert.equal(JSON.stringify(hidden).includes('Začni okem'),false);
 const known=puzzleView(p,initialPuzzleState(),{evidence:['reward-10']});
 assert.deepEqual(known.availableHints,[{id:'hint-one'}]);
 assert.equal(JSON.stringify(known).includes('Začni okem'),false);
 const revealed=revealPuzzleHint(p,initialPuzzleState(),'hint-one',{evidence:['reward-10']});
 const view=puzzleView(p,revealed,{evidence:['reward-10']});
 assert.deepEqual(view.availableHints,[]);
 assert.equal(view.hints[0].text,'Začni okem');
});
