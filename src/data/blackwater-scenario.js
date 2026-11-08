import {createScenario} from '../engine/scenario.js';
// P1 pilot configuration: deliberately not activated by legacy newState.
export const blackwaterScenario=createScenario({
  id:'blackwater-bells',version:1,title:'Zvony pod přílivem',
  rules:{apPerRound:3,maxRounds:12,deductionMode:'automatic'},
  modules:['scenario-clock','conditional-events'],
  locations:['location-0','location-1','location-2','location-3','location-4','location-5','location-6'],
  clocks:[{id:'tide-bells',label:'Údery zvonu',max:7,initial:1,milestones:[{round:3,value:2},{round:5,value:3},{round:7,value:4},{round:9,value:5},{round:11,value:6},{round:13,value:7}]}],
  endings:[
    {id:'quiet-sea',title:'Tiché moře',kind:'victory',conditions:[{type:'hasKnowledge',id:'knowledge-voice'},{type:'hasKnowledge',id:'knowledge-name'},{type:'hasKnowledge',id:'knowledge-body'},{type:'flagEquals',id:'signal-ready',value:true},{type:'clockBelow',id:'tide-bells',value:7}]},
    {id:'broken-bell',title:'Zlomený zvon',kind:'costlyVictory',conditions:[{type:'hasKnowledge',id:'knowledge-body'},{type:'flagEquals',id:'bell-reachable',value:true},{type:'clockBelow',id:'tide-bells',value:7}]},
    {id:'voice-price',title:'Cena hlasu',kind:'sacrifice',conditions:[{type:'flagEquals',id:'bell-reachable',value:true},{type:'clockBelow',id:'tide-bells',value:7}]},
    {id:'deep-answers',title:'Hlubiny odpoví',kind:'defeat',conditions:[{type:'clockAtLeast',id:'tide-bells',value:7}]}
  ]
});
