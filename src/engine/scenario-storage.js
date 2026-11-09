import {investigatorById} from './scenario-investigators.js';
import {newScenarioSession} from './scenario-session.js';
import {validState} from './storage.js';
import {isEnded,currentCard} from './game.js';
import {validatePuzzle} from './puzzle.js';
import {validateCompanion} from './companion.js';
export const SCENARIO_SAVE_KEY='hlubiny-scenario-v1';
export const scenarioSaveKey=def=>SCENARIO_SAVE_KEY+'-'+def.id;
export function validScenarioSession(s,def,data){
 if(!s||s.schemaVersion!==1||!s.game||!s.scenario)return false;
 const g=s.game,c=s.scenario;
 const hero=s.investigatorId===undefined||s.investigatorId===null?null:investigatorById[s.investigatorId];
 if(s.investigatorId!==undefined&&s.investigatorId!==null&&!hero)return false;
 if(s.abilityUsed!==undefined&&typeof s.abilityUsed!=='boolean')return false;
 if(s.investigatorId===null&&(g.revision!==0||s.abilityUsed))return false;
 if(hero&&(g.hp>hero.hp||g.san>hero.san))return false;
 if(c.schemaVersion!==1||c.scenarioId!==def.id||c.scenarioVersion!==def.version)return false;
 if(!Number.isSafeInteger(g.round)||g.round<1||g.round>def.rules.maxRounds+1)return false;
 if(!Number.isSafeInteger(g.ap)||g.ap<0||g.ap>def.rules.apPerRound+(hero?.id==='detective'?1:0))return false;
 if(g.round>def.rules.maxRounds&&g.ap!==0)return false;
 // Reuse the strict legacy validator with only the scenario-specific range and ritual exception.
 const legacy={...g,round:Math.min(g.round,7),ap:Math.min(g.ap,3),hp:Math.min(g.hp,6),san:Math.min(g.san,8),ritual:Math.min(g.ritual,7),ended:isEnded(g,{scenarioClock:true})};
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
 if(c.puzzles!==undefined){
  if(!c.puzzles||typeof c.puzzles!=='object'||Array.isArray(c.puzzles))return false;
  const defs=new Map((data.puzzles||[]).filter(p=>validatePuzzle(p).length===0).map(p=>[p.id,p]));
  if(Object.keys(c.puzzles).length>defs.size)return false;
  for(const [id,p] of Object.entries(c.puzzles)){
   const d=defs.get(id);
   if(!d||!p||!['open','solved','blocked'].includes(p.status)||!Number.isSafeInteger(p.attempts)||p.attempts<0||p.attempts>10000||!Array.isArray(p.hintIds)||new Set(p.hintIds).size!==p.hintIds.length||p.hintIds.some(h=>!d.hints.some(x=>x.id===h)))return false;
   if(d.attempts.mode==='limited'&&p.attempts>d.attempts.max)return false;
   if(p.status==='blocked'&&(d.attempts.mode!=='limited'||p.attempts!==d.attempts.max))return false;
   if(p.status==='solved'&&p.attempts===0)return false;
  }
 }
 if(c.companion!==undefined){
  const companion=c.companion;
  if(!companion||typeof companion!=='object'||Array.isArray(companion)||!Object.hasOwn(companion,'activeId')||!Object.hasOwn(companion,'usedRoundByAbility'))return false;
  const definitions=(data.companions||[]).filter(d=>!validateCompanion(d).length);
  const active=definitions.find(d=>d.id===companion.activeId);
  if(companion.activeId!==null&&!active)return false;
  const used=companion.usedRoundByAbility;
  if(!used||typeof used!=='object'||Array.isArray(used)||(!active&&Object.keys(used).length))return false;
  if(active&&Object.entries(used).some(([id,round])=>!active.abilities.some(a=>a.id===id&&a.type==='active')||!Number.isSafeInteger(round)||round<1||round>g.round))return false;
 }
 if(c.endingId!==null&&!def.endings.some(e=>e.id===c.endingId))return false;
 if(g.round>def.rules.maxRounds&&!c.endingId)return false;
 return true;
}
export function loadScenarioSession(storage,def,data){
 try{const raw=storage?.getItem(scenarioSaveKey(def));
  if(!raw||raw.length>150000)return newScenarioSession(def,data);
  const parsed=JSON.parse(raw);return validScenarioSession(parsed,def,data)?parsed:newScenarioSession(def,data);
 }catch{return newScenarioSession(def,data);}
}
export function saveScenarioSession(storage,s,def,data){
 try{if(!validScenarioSession(s,def,data))return false;storage?.setItem(scenarioSaveKey(def),JSON.stringify(s));return Boolean(storage);}catch{return false;}
}
