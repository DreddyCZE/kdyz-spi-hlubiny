import test from 'node:test';
import assert from 'node:assert/strict';
import {blackwaterContent,content} from '../src/engine/content.js';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {validatePuzzle} from '../src/engine/puzzle.js';
import {newScenarioSession,scenarioSessionView,scenarioSessionTransition} from '../src/engine/scenario-session.js';
test('pilot puzzle is opt-in and references actual Blackwater evidence and location',()=>{
 assert.equal(content.puzzles,undefined);
 assert.equal(blackwaterContent.puzzles.length,3);
 for(const p of blackwaterContent.puzzles){
  assert.deepEqual(validatePuzzle(p),[]);
  assert.ok(blackwaterContent.refs.locations.includes(p.locationId));
  for(const c of p.clues)assert.ok(blackwaterContent.refs.evidence.includes(c.sourceEvidenceId));
 }
});
test('pilot can be solved at lighthouse after finding clues and survives save reload',()=>{
 const s=newScenarioSession(blackwaterScenario,blackwaterContent);
 const game={...s.game,locationId:'location-5',evidence:['reward-10','reward-12','reward-14']};
 const start={...s,game};
 const view=scenarioSessionView(start,blackwaterScenario,blackwaterContent);
 assert.equal(view.puzzles.length,2);assert.equal(view.puzzles[0].clues.length,3);
 const p=blackwaterContent.puzzles[0];
 assert.equal(view.puzzles[0].interaction.answer,undefined);
 const solved=scenarioSessionTransition(start,{type:'attemptPuzzle',revision:game.revision,puzzleId:p.id,answer:['eye','anchor','wave']},blackwaterScenario,blackwaterContent);
 assert.equal(solved.game.flags['bell-order-solved'],true);
 assert.equal(solved.scenario.puzzles[p.id].status,'solved');
 assert.equal(JSON.parse(JSON.stringify(solved)).scenario.puzzles[p.id].status,'solved');
 assert.equal(scenarioSessionTransition(solved,{type:'attemptPuzzle',revision:solved.game.revision,puzzleId:p.id,answer:['eye','anchor','wave']},blackwaterScenario,blackwaterContent),solved);
});
