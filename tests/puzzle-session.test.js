import test from 'node:test';
import assert from 'node:assert/strict';
import {newScenarioSession,scenarioSessionTransition,scenarioSessionView} from '../src/engine/scenario-session.js';
import {content} from '../src/engine/content.js';
import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
const puzzle={id:'puzzle-check',version:1,title:'Zámek',locationId:content.refs.locations[0],type:'deduction',clues:[{id:'clue-check',text:'Odpověď je ano.',sourceEvidenceId:'reward-10'}],interaction:{options:['yes','no'],answer:'yes'},attempts:{mode:'limited',max:2},hints:[],onSolve:[{type:'setFlag',id:'puzzle-solved',value:true}],onWrong:[{type:'modifyThreat',amount:1}],fallback:{type:'alternatePath',id:'alternate-check'}};
test('puzzle transitions are atomic, revision guarded, and persist in scenario state',()=>{
  const data={...content,puzzles:[puzzle]},session=newScenarioSession(blackwaterScenario,data);
  const wrong=scenarioSessionTransition(session,{type:'attemptPuzzle',puzzleId:puzzle.id,answer:'no',revision:0},blackwaterScenario,data);
  assert.notEqual(wrong,session);assert.equal(wrong.game.threat,session.game.threat+1);assert.equal(wrong.scenario.puzzles[puzzle.id].attempts,1);
  assert.equal(scenarioSessionTransition(wrong,{type:'attemptPuzzle',puzzleId:puzzle.id,answer:'yes',revision:0},blackwaterScenario,data),wrong);
  const solved=scenarioSessionTransition(wrong,{type:'attemptPuzzle',puzzleId:puzzle.id,answer:'yes',revision:1},blackwaterScenario,data);
  assert.equal(solved.game.flags['puzzle-solved'],true);assert.equal(solved.scenario.puzzles[puzzle.id].status,'solved');
  assert.equal(scenarioSessionTransition(solved,{type:'attemptPuzzle',puzzleId:puzzle.id,answer:'yes',revision:2},blackwaterScenario,data),solved);
  assert.equal(scenarioSessionView(solved,blackwaterScenario,data).puzzles[0].status,'solved');
  assert.equal(JSON.parse(JSON.stringify(solved)).scenario.puzzles[puzzle.id].attempts,2);
});
test('invalid puzzle location and no puzzle data do not alter legacy session',()=>{
 const data={...content,puzzles:[{...puzzle,locationId:'elsewhere'}]},session=newScenarioSession(blackwaterScenario,data);
 assert.equal(scenarioSessionTransition(session,{type:'attemptPuzzle',puzzleId:puzzle.id,answer:'yes',revision:0},blackwaterScenario,data),session);
 assert.deepEqual(scenarioSessionView(session,blackwaterScenario).puzzles,[]);
});
