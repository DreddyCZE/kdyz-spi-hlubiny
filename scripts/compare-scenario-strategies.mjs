import {blackwaterScenario} from '../src/data/blackwater-scenario.js';
import {blackwaterContent as content} from '../src/engine/content.js';
import {simulateBatch} from '../src/engine/scenario-simulator.js';
import {createEvidenceStrategy} from '../src/engine/scenario-strategy.js';
const runs=Number(process.argv[2]||100),seed=Number(process.argv[3]||1);
const strategy=createEvidenceStrategy(blackwaterScenario,content);
const common={runs,seed,maxActions:500,...strategy};
const baseline=simulateBatch(blackwaterScenario,content,{...common,reroll:false});
const reroll=simulateBatch(blackwaterScenario,content,{...common,reroll:true});
const selective=simulateBatch(blackwaterScenario,content,{...common,reroll:({game,result})=>game.san>=5&&['criticalFailure','failure'].includes(result.key)});
const percent=(count)=>Math.round(10000*count/runs)/100;
const summarize=batch=>({
 outcomes:batch.outcomes,
 completedPercent:percent(runs-(batch.outcomes.unfinished||0)),
 exhausted:batch.exhausted,
 unfinishedReasons:batch.unfinishedReasons,
 knowledgeCoveragePercent:Object.fromEntries(Object.entries(batch.knowledgeCounts).map(([id,count])=>[id,percent(count)])),
 endingRoundStats:batch.endingRoundStats
});
console.log(JSON.stringify({scenarioId:blackwaterScenario.id,runs,seed,baseline:summarize(baseline),alwaysReroll:summarize(reroll),selectiveReroll:summarize(selective)},null,2));
