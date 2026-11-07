import { locations } from '../data/locations.js';
import { content, catalog } from './content.js';
import { attributes } from './schema.js';
export { attributes } from './schema.js';
export const labels={criticalSuccess:'Kritický úspěch',greatSuccess:'Velký úspěch',success:'Úspěch',partialSuccess:'Částečný úspěch',failure:'Neúspěch',criticalFailure:'Kritické selhání'};
export function newState(){return {version:2,revision:0,locationId:'location-0',round:1,ap:3,threat:2,ritual:1,hp:6,san:8,inventory:[],evidence:[],flags:{},unlockedLocations:locations.map(l=>l.id),cursors:{},choiceId:null,resolved:{},result:null,ended:false,log:['Vyšetřování začíná. Rozhodni, co uděláš.']};}
export function meetsConditions(s,conditions=[]){return conditions.every(c=>{
  switch(c.type){
    case 'hasItem':return s.inventory.includes(c.id);
    case 'hasEvidence':return s.evidence.includes(c.id);
    case 'flagEquals':return Object.hasOwn(s.flags,c.id)&&s.flags[c.id]===c.value;
    case 'minRound':return s.round>=c.round;
    case 'maxRound':return s.round<=c.round;
    case 'locationUnlocked':return s.unlockedLocations.includes(c.id);
    default:return false;
  }
});}
export function deck(s,data=content){return data.cards.filter(c=>c.locationId===s.locationId);}
function activeDefinition(s,data=content){
  const pinned=s.result&&data.byId[s.result.cardId];
  if(pinned?.locationId===s.locationId)return pinned;
  return deck(s,data).slice(s.cursors[s.locationId]||0).find(c=>meetsConditions(s,c.conditions))||null;
}
export function canChoose(s,c,o){return !s.ended&&!s.result&&(c.repeatable||!s.resolved[c.id])&&meetsConditions(s,c.conditions)&&meetsConditions(s,o.conditions)&&s.ap>=o.apCost;}
export function currentCard(s,data=content){
  const c=activeDefinition(s,data);if(!c)return null;
  // Allow-list projection: hidden text and effects never enter the public view.
  return {id:c.id,type:c.type,locationId:c.locationId,title:c.title,description:c.description,repeatable:c.repeatable,
    choices:c.choices.map(o=>({id:o.id,label:o.label,apCost:o.apCost,...(o.test?{test:{...o.test}}:{}),available:canChoose(s,c,o),unavailableReason:!meetsConditions(s,o.conditions)?'Nesplněné podmínky':s.ap<o.apCost?'Nedostatek AP':''}))};
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
export function applyEffects(state,effects){
  const s=structuredClone(state);
  for(const e of effects){switch(e.type){
    case 'modifyStat':s[e.stat]=clamp(s[e.stat]+e.amount,e.stat==='hp'?6:8);break;
    case 'modifyThreat':s.threat=clamp(s.threat+e.amount,10);break;
    case 'modifyRitual':s.ritual=clamp(s.ritual+e.amount,8);break;
    case 'addItem':if(!s.inventory.includes(e.id))s.inventory.push(e.id);break;
    case 'removeItem':if(!s.inventory.includes(e.id))return null;s.inventory=s.inventory.filter(id=>id!==e.id);break;
    case 'addEvidence':if(!s.evidence.includes(e.id))s.evidence.push(e.id);break;
    case 'setFlag':s.flags[e.id]=e.value;break;
    case 'unlockLocation':if(!s.unlockedLocations.includes(e.id))s.unlockedLocations.push(e.id);break;
    default:return null;
  }}return s;
}
export function isEnded(s){return s.hp===0||s.san===0||s.threat===10||s.ritual===8;}
export function transition(state,action,data=content){
  if(state.ended)return state;
  let s=structuredClone(state);const c=activeDefinition(s,data);
  switch(action.type){
    case 'move':
      if(!catalog.locations.includes(action.locationId)||!s.unlockedLocations.includes(action.locationId)||action.locationId===s.locationId||s.ap<1)return state;
      s.ap--;s.locationId=action.locationId;s.choiceId=null;s.result=null;s.log.unshift('Přesun: '+locations.find(l=>l.id===s.locationId).name);break;
    case 'choose':
      if(!c||!c.choices.some(o=>o.id===action.choiceId&&canChoose(s,c,o)))return state;
      s.choiceId=action.choiceId;break;
    case 'resolve':{
      if(action.revision!==s.revision||!c||action.cardId!==c.id)return state;
      const o=c.choices.find(o=>o.id===action.choiceId);if(!o||!canChoose(s,c,o))return state;
      let r={dice:null,total:null,key:'success'};
      if(o.test){if(!Array.isArray(action.dice)||action.dice.length!==2)return state;try{r=evaluate(...action.dice,attributes[o.test.attribute]+(o.test.modifier||0),o.test.difficulty);}catch{return state;}}
      s=applyEffects(s,o.outcomes[r.key].effects);if(!s)return state;
      s.ap-=o.apCost;s.choiceId=o.id;s.result={...r,cardId:c.id,choiceId:o.id,revision:state.revision+1};s.resolved[c.id]=s.result;s.log.unshift(c.title+': '+labels[r.key]);break;
    }
    case 'next':{
      if(!c||!s.resolved[c.id])return state;
      const index=deck(s,data).findIndex(card=>card.id===c.id);s.cursors[s.locationId]=c.repeatable?index:index+1;s.choiceId=null;s.result=null;break;
    }
    case 'endRound':
      if(s.round<7){s.round++;s.ap=3;}else s.ap=0;
      s.ritual=clamp(s.ritual+1,8);s.log.unshift('Nové kolo. Rituál postupuje.');break;
    default:return state;
  }
  s.revision++;s.ended=isEnded(s);if(s.ended)s.log.unshift('Konec scénáře: temnota zvítězila.');s.log=s.log.slice(0,100);return s;
}
