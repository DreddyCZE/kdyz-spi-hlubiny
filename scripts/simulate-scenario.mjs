import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {content} from '../src/engine/content.js';
import {simulateBatch} from '../src/engine/scenario-simulator.js';
const runs=Number(process.argv[2]||100);
const seed=Number(process.argv[3]||1);
const result=simulateBatch(blackwaterScenario,content,{runs,seed,maxActions:500});
console.log(JSON.stringify(result,null,2));
// Unfinished runs are balance diagnostics, not infrastructure errors.
// Set SIM_REQUIRE_FINISHED=1 to enforce completion as an explicit quality gate.
if(process.env.SIM_REQUIRE_FINISHED==='1'&&result.outcomes.unfinished)process.exitCode=1;
