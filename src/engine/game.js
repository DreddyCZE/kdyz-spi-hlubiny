import { content } from './content.js';
import { attributes } from './schema.js';
import { conditionMet, deduce, publicInvestigation, rememberEvidence } from './investigation.js';
export { attributes } from './schema.js';
export const labels={criticalSuccess:'Kritický úspěch',greatSuccess:'Velký úspěch',success:'Úspěch',partialSuccess:'Částečný úspěch',failure:'Neúspěch',criticalFailure:'Kritické selhání'};
export function newState(data=content){return {version:4,drawnCards:{},revision:0,locationId:data.refs.locations[0],round:1,ap:3,threat:2,ritual:1,hp:6,san:8,inventory:[],evidence:[],knowledge:[],deductions:{},unlockedCards:[],unlockedChoices:[],flags:{},unlockedLocations:[...data.refs.locations],cursors:{},choiceId:null,resolved:{},result:null,ended:false,log:['Vyšetřování začíná. Rozhodni, co uděláš.']};}
export function meetsConditions(s,conditions=[],data=content){return conditions.every(c=>conditionMet(s,c,data.investigation.itemEvidence));}
export function investigationView(s,data=content){return publicInvestigation(s,data.investigation);}
export function deck(s,data=content){return data.cards.filter(c=>c.locationId===s.locationId);}
// Stable scenario order; conditional cards stay deferred rather than being discarded.
function nextDefinition(s,data=content){
  const cards=deck(s,data),cursor=s.cursors[s.locationId]||0;
  const eligible=c=>!Object.hasOwn(s.resolved,c.id)&&meetsConditions(s,c.conditions,data);
  return cards.slice(0,cursor).find(eligible)||cards.slice(cursor).find(eligible)
    ||[...cards.slice(cursor),...cards.slice(0,cursor)].find(c=>c.repeatable&&meetsConditions(s,c.conditions,data))||null;
}
function activeDefinition(s,data=content){
  const id=s.drawnCards[s.locationId],card=id&&data.byId[id];
  return card?.locationId===s.locationId&&(Object.hasOwn(s.resolved,card.id)||meetsConditions(s,card.conditions,data))?card:null;
}
export function explorationView(s,data=content){
  const cards=deck(s,data),remaining=cards.filter(c=>c.repeatable||!Object.hasOwn(s.resolved,c.id));
  const available=remaining.filter(c=>meetsConditions(s,c.conditions,data)).length;
  const metadata=data.decksByLocation[s.locationId];
  return {name:metadata.name,description:metadata.description,available,deferred:remaining.length-available,
    consumed:cards.filter(c=>!c.repeatable&&Object.hasOwn(s.resolved,c.id)).length,
    canDraw:!s.ended&&!activeDefinition(s,data)&&available>0};
}
export function canChoose(s,c,o,data=content){return !s.ended&&!s.result&&(c.repeatable||!s.resolved[c.id])&&meetsConditions(s,c.conditions,data)&&meetsConditions(s,o.conditions,data)&&s.ap>=o.apCost;}
export function currentCard(s,data=content){
  const c=activeDefinition(s,data);if(!c)return null;
  // Allow-list projection: hidden text and effects never enter the public view.
  return {id:c.id,type:c.type,locationId:c.locationId,title:c.title,description:c.description,repeatable:c.repeatable,
    choices:c.choices.filter(o=>s.resolved[c.id]?.choiceId===o.id||!containsLockedChoice(s,o.conditions||[],data)).map(o=>({id:o.id,label:o.label,apCost:o.apCost,...(o.test?{test:{...o.test}}:{}),available:canChoose(s,c,o,data),unavailableReason:!meetsConditions(s,o.conditions,data)?'Nesplněné podmínky':s.ap<o.apCost?'Nedostatek AP':''}))};
}
// Explicit unlock gates hide future choice labels, not just the outcome text.
function containsLockedChoice(s,conditions,data){
  const gated=c=>c.type==='choiceUnlocked'||c.type==='hasKnowledge'||c.type==='deductionCompleted'||c.type==='flagEquals'||(c.conditions||[]).some(gated)||c.condition&&gated(c.condition);
  return conditions.some(c=>gated(c)&&!conditionMet(s,c,data.investigation.itemEvidence));
}
export function selectedChoice(s,c=currentCard(s)){return c?.choices.find(o=>o.id===s.choiceId)||c?.choices.find(o=>o.available)||c?.choices[0]||null;}
export function visibleResult(s,data=content){const c=activeDefinition(s,data),r=c&&s.resolved[c.id];if(!r||(c.repeatable&&!s.result))return null;const o=c.choices.find(o=>o.id===r.choiceId);return {...r,text:o.outcomes[r.key].text,test:o.test?{...o.test}:null};}
export function evaluate(a,b,bonus,difficulty){
  if(![a,b].every(n=>Number.isInteger(n)&&n>=1&&n<=6)||!Number.isFinite(bonus)||!Number.isFinite(difficulty))throw new RangeError('Neplatný test nebo kostka');
  const total=a+b+bonus,margin=total-difficulty;
  const key=a===6&&b===6?'criticalSuccess':a===1&&b===1?'criticalFailure':margin>=3?'greatSuccess':margin>=0?'success':margin>=-2?'partialSuccess':'failure';
  return {dice:[a,b],total,key};
}
export function rollDice(random=Math.random){return [1+Math.floor(random()*6),1+Math.floor(random()*6)];}
const clamp=(n,max)=>Math.max(0,Math.min(max,n));
export function applyEffects(state,effects,data=content,limits={hp:6,san:8}){
  const s=rememberEvidence(structuredClone(state),data.investigation.itemEvidence);
  for(const e of effects){switch(e.type){
    case 'modifyStat':s[e.stat]=clamp(s[e.stat]+e.amount,e.stat==='hp'?limits.hp:limits.san);break;
    case 'modifyThreat':s.threat=clamp(s.threat+e.amount,10);break;
    case 'modifyRitual':s.ritual=clamp(s.ritual+e.amount,8);break;
    case 'addItem':if(!s.inventory.includes(e.id))s.inventory.push(e.id);rememberEvidence(s,data.investigation.itemEvidence);break;
    case 'removeItem':if(!s.inventory.includes(e.id))return null;s.inventory=s.inventory.filter(id=>id!==e.id);break;
    case 'addEvidence':if(!s.evidence.includes(e.id))s.evidence.push(e.id);break;
    case 'addKnowledge':if(!s.knowledge.includes(e.id))s.knowledge.push(e.id);break;
    case 'unlockCard':if(!s.unlockedCards.includes(e.id))s.unlockedCards.push(e.id);break;
    case 'unlockChoice':if(!s.unlockedChoices.includes(e.id))s.unlockedChoices.push(e.id);break;
    case 'setFlag':s.flags[e.id]=e.value;break;
    case 'unlockLocation':if(!s.unlockedLocations.includes(e.id))s.unlockedLocations.push(e.id);break;
    default:return null;
  }}return rememberEvidence(s,data.investigation.itemEvidence);
}
export function isEnded(s,rules={}){return s.hp===0||s.san===0||s.threat===10||(!rules.scenarioClock&&s.ritual===8);}
export function transition(state,action,data=content,rules={}){
  if(state.ended)return state;
  let s=structuredClone(state);const c=activeDefinition(s,data);
  switch(action.type){
    case 'deduce':{
      if(action.revision!==s.revision)return state;
      const next=deduce(s,data.investigation);if(next===s)return state;
      s=next;break;
    }
    case 'draw':{
      if(action.revision!==s.revision||activeDefinition(s,data))return state;
      const drawn=nextDefinition(s,data);if(!drawn)return state;
      if(drawn.repeatable)delete s.resolved[drawn.id];
      s.drawnCards[s.locationId]=drawn.id;s.choiceId=null;s.result=s.resolved[drawn.id]&&!drawn.repeatable?s.resolved[drawn.id]:null;break;
    }
    case 'move':
      if(!data.refs.locations.includes(action.locationId)||!s.unlockedLocations.includes(action.locationId)||action.locationId===s.locationId||s.ap<1)return state;
      s.ap--;s.locationId=action.locationId;s.choiceId=null;s.result=s.resolved[s.drawnCards[s.locationId]]||null;s.log.unshift('Přesun: '+data.locationsById[s.locationId].name);break;
    case 'choose':
      if(!c||!c.choices.some(o=>o.id===action.choiceId&&canChoose(s,c,o,data)))return state;
      s.choiceId=action.choiceId;break;
    case 'resolve':{
      if(action.revision!==s.revision||!c||action.cardId!==c.id)return state;
      const o=c.choices.find(o=>o.id===action.choiceId);if(!o||!canChoose(s,c,o,data))return state;
      let r={dice:null,total:null,key:'success'};
      if(o.test){if(!Array.isArray(action.dice)||action.dice.length!==2)return state;const bonus=rules.testBonuses?.[o.test.attribute]||0;try{r=evaluate(...action.dice,attributes[o.test.attribute]+(o.test.modifier||0)+bonus,o.test.difficulty);if(bonus)r.testBonus=bonus;}catch{return state;}}
      let reduction=rules.hpDamageReduction||0;
      const effects=o.outcomes[r.key].effects.map(e=>{
        if(e.type!=='modifyStat'||e.stat!=='hp'||e.amount>=0||!reduction)return e;
        const prevented=Math.min(reduction,-e.amount);reduction=0;return {...e,amount:e.amount+prevented};
      });
      s=applyEffects(s,effects,data,rules.statLimits||{hp:6,san:8});if(!s)return state;
      s.ap-=o.apCost;s.choiceId=o.id;s.result={...r,cardId:c.id,choiceId:o.id,revision:state.revision+1};s.resolved[c.id]=s.result;s.log.unshift(c.title+': '+labels[r.key]);break;
    }
    case 'next':{
      if(!c||!s.result||!s.resolved[c.id])return state;
      const index=deck(s,data).findIndex(card=>card.id===c.id);s.cursors[s.locationId]=c.repeatable?index+1:Math.max(s.cursors[s.locationId]||0,index+1);delete s.drawnCards[s.locationId];s.choiceId=null;s.result=null;break;
    }
    case 'endRound':
      if(s.round<(rules.maxRounds||7)){s.round++;s.ap=rules.apPerRound||3;}else s.ap=0;
      if(!rules.scenarioClock)s.ritual=clamp(s.ritual+1,8);
      s.log.unshift(rules.scenarioClock?'Nové kolo.':'Nové kolo. Rituál postupuje.');break;
    default:return state;
  }
  s.revision++;s.ended=isEnded(s,rules);if(s.ended)s.log.unshift('Konec scénáře: temnota zvítězila.');s.log=s.log.slice(0,100);return s;
}
