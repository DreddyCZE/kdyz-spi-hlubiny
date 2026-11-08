import {blackwaterScenario as scenario} from '../src/data/blackwater-scenario.js';
import {blackwaterContent as content} from '../src/engine/content.js';
import {createEvidenceStrategy} from '../src/engine/scenario-strategy.js';
import {simulateBatch} from '../src/engine/scenario-simulator.js';
const runs=Number(process.argv[2]||100),seed=Number(process.argv[3]||1);
const strategy=createEvidenceStrategy(scenario,content);
const goals=['victory','costlyVictory','sacrifice'];
const results={};
for(const kind of goals){
 const chooseEnding=endings=>endings.find(e=>e.kind===kind)||endings.find(e=>e.kind==='victory')||endings[0];
 const batch=simulateBatch(scenario,content,{runs,seed,maxActions:500,...strategy,chooseEnding});
 results[kind]={outcomes:batch.outcomes,unfinishedReasons:batch.unfinishedReasons,exhausted:batch.exhausted,knowledgeCounts:batch.knowledgeCounts,endingRoundStats:batch.endingRoundStats};
}
console.log(JSON.stringify({scenarioId:scenario.id,runs,seed,results},null,2));
