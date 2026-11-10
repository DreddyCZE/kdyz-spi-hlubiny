import {writeFile} from 'node:fs/promises';
import {blackwaterScenario as def} from '../src/data/blackwater-scenario.js';
import {blackwaterContent as data} from '../src/engine/content.js';
import {simulateScenario} from '../src/engine/scenario-simulator.js';
import {createEvidenceStrategy} from '../src/engine/scenario-strategy.js';
const runs=Number(process.argv[2]||100),seed=Number(process.argv[3]||42);
if(!Number.isSafeInteger(runs)||runs<1||runs>1000||!Number.isSafeInteger(seed))throw new RangeError('runs/seed');
const strategies={
 cautious:{reroll:({game,result})=>game.san>=4&&['failure','criticalFailure'].includes(result.key),useEquipment:true,useAbilities:true},
 investigative:{...createEvidenceStrategy(def,data),reroll:({result})=>['failure','criticalFailure'].includes(result.key),useEquipment:true,useAbilities:true},
 confrontational:{...createEvidenceStrategy(def,data),combat:'attack',useEquipment:true,useAbilities:true,reroll:false},
 evasive:{...createEvidenceStrategy(def,data),combat:'escape',puzzles:true,useEquipment:true,useAbilities:true,reroll:false},
};
const results=[];
for(const investigatorId of ['detective','occultist','sailor'])for(const [strategy,options] of Object.entries(strategies)){
 const samples=Array.from({length:runs},(_,i)=>simulateScenario(def,data,{...options,seed:seed+i,investigatorId,maxActions:500}));
 const counts=values=>Object.fromEntries([...new Set(values)].sort().map(id=>[id,values.filter(x=>x===id).length]));
 const mean=key=>Number((samples.reduce((n,s)=>n+s[key],0)/runs).toFixed(2));
 const actions=counts(samples.flatMap(s=>s.trace.map(t=>t.type)));
 results.push({investigatorId,strategy,runs,outcomes:counts(samples.map(s=>s.endingId||(s.hp===0?'hp-defeat':s.san===0?'san-defeat':s.threat===10?'threat-defeat':'unfinished'))),meanRound:mean('round'),meanAPSpent:mean('apSpent'),meanHPLost:mean('hpLost'),meanSANLost:mean('sanLost'),meanFinalHP:mean('hp'),meanFinalSAN:mean('san'),exhausted:samples.filter(s=>s.exhausted).length,nonterminal:samples.filter(s=>!s.endingId&&!s.ended).length,actionCounts:actions,evidenceCounts:counts(samples.flatMap(s=>s.evidence)),knowledgeCounts:counts(samples.flatMap(s=>s.knowledge))});
}
const endingAudit=[];
for(const investigatorId of ['detective','occultist','sailor'])for(const endingId of ['quiet-sea','broken-bell','voice-price']){
 const outcomes={};
 for(let i=0;i<runs;i++){
  const result=simulateScenario(def,data,{...strategies.investigative,investigatorId,seed:seed+i,chooseEnding:endings=>endings.find(e=>e.id===endingId)||endings[0]});
  const key=result.endingId||(result.hp===0?'hp-defeat':result.san===0?'san-defeat':result.threat===10?'threat-defeat':'unfinished');outcomes[key]=(outcomes[key]||0)+1;
 }
 endingAudit.push({investigatorId,requestedEnding:endingId,outcomes});
}
const report={scenarioId:def.id,runsPerCell:runs,seed,totalRuns:runs*(results.length+endingAudit.length),notes:['Heuristic strategies; not an estimate of human win rate.','Card choice policy may inspect definitions for reachability; it is not a spoiler-free player model.','Combat strategies deliberately enter optional fights; evasive uses paid puzzle alternatives.','Round/AP and losses reflect actual transitions, including healing and rerolls.'],results,endingAudit};
const json=JSON.stringify(report,null,2)+'\n';
if(process.argv[4])await writeFile(process.argv[4],json);else process.stdout.write(json);
