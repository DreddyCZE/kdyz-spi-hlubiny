import {newScenarioSession} from './scenario-session.js';
import {validState} from './storage.js';
import {isEnded,currentCard} from './game.js';
export const SCENARIO_SAVE_KEY='hlubiny-scenario-v1';
export function validScenarioSession(s,def,data){
 if(!s||s.schemaVersion!==1||!s.game||!s.scenario)return false;
 const g=s.game,c=s.scenario;
 if(c.schemaVersion!==1||c.scenarioId!==def.id||c.scenarioVersion!==def.version)return false;
 if(!Number.isSafeInteger(g.round)||g.round<1||g.round>def.rules.maxRounds+1)return false;
 if(!Number.isSafeInteger(g.ap)||g.ap<0||g.ap>def.rules.apPerRound)return false;
 if(g.round>def.rules.maxRounds&&g.ap!==0)return false;
 // Reuse the strict legacy validator with only the scenario-specific range and ritual exception.
 const legacy={...g,round:Math.min(g.round,7),ap:Math.min(g.ap,3),ritual:Math.min(g.ritual,7),ended:isEnded(g,{scenarioClock:true})};
 if(g.ended!==legacy.ended)return false;
 if(!validState(legacy,data))return false;
 if(!c.clocks||Object.keys(c.clocks).length!==def.clocks.length)return false;
 for(const clock of def.clocks){
  const n=c.clocks[clock.id];if(!Number.isSafeInteger(n)||n<0||n>clock.max)return false;
 }
 if(!Array.isArray(c.eventLedger)||c.eventLedger.length>100||new Set(c.eventLedger).size!==c.eventLedger.length||c.eventLedger.some(x=>typeof x!=='string'||x.length>120))return false;
 if(c.pendingTest!=null){
  const p=c.pendingTest,validDice=d=>Array.isArray(d)&&d.length===2&&d.every(n=>Number.isInteger(n)&&n>=1&&n<=6);
  if(!p||typeof p.cardId!=='string'||typeof p.choiceId!=='string'||p.revision!==g.revision||!validDice(p.firstDice)||p.secondDice!==null&&!validDice(p.secondDice))return false;
  const card=currentCard(g,data),choice=card?.choices.find(x=>x.id===p.choiceId);
  if(!card||card.id!==p.cardId||!choice?.test||!choice.available||g.ended||c.endingId!==null)return false;
 }
 if(c.endingId!==null&&!def.endings.some(e=>e.id===c.endingId))return false;
 if(g.round>def.rules.maxRounds&&!c.endingId)return false;
 return true;
}
export function loadScenarioSession(storage,def,data){
 try{const raw=storage?.getItem(SCENARIO_SAVE_KEY);
  if(!raw||raw.length>150000)return newScenarioSession(def,data);
  const parsed=JSON.parse(raw);return validScenarioSession(parsed,def,data)?parsed:newScenarioSession(def,data);
 }catch{return newScenarioSession(def,data);}
}
export function saveScenarioSession(storage,s,def,data){
 try{if(!validScenarioSession(s,def,data))return false;storage?.setItem(SCENARIO_SAVE_KEY,JSON.stringify(s));return Boolean(storage);}catch{return false;}
}
