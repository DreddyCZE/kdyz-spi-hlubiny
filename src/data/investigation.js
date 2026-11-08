// Blackwater is example content. No scenario identifiers belong in the engine.
import { rewards } from './catalog.js';
const details = {
  'reward-2':['Deník zmizelého rybáře zachycuje cestu od přístavu k majáku.','document',['diary','harbor']],
  'reward-3':['Dochovaný útržek rybářova deníku.','document',['diary-fragment']],
  'reward-5':['Rybářovo svědectví o cestě zmizelých.','testimony',['witness','harbor']],
  'reward-7':['Plán podzemní chodby.','document',['map']],
  'reward-9':['Plán prostor majáku.','document',['map','lighthouse']],
  'reward-10':['Část informace ze zakázaného katalogu.','document',['archive']],
  'reward-11':['Fotografie osob spojených s kultem.','image',['cult']],
  'reward-12':['Výpověď pacienta o nočním zvonění.','testimony',['witness']],
  'reward-14':['Záznam rytiny související s rituálem.','symbol',['ritual']],
  'reward-16':['Informace o mechanismu tajného vstupu.','route',['entrance']],
};
export const evidence = rewards.filter(r=>r.kind==='evidence').map(r=>({
  id:r.id,name:r.name,description:details[r.id][0],type:details[r.id][1],tags:details[r.id][2],metadata:{legacy:true},
}));
evidence.push({id:'harbor-note-copy',name:'Opis poznámky',description:'Čitelný opis znaků z poznámky na molu.',type:'document',tags:['harbor','note'],source:'Poznámka na molu'});
export const knowledge = [
 {id:'blackwater-lighthouse-connection',name:'Spojení s majákem',description:'Nezávislé záznamy potvrzují, že cesta pohřešovaných vede k majáku.',type:'conclusion',tags:['lighthouse']},
 {id:'knowledge-voice',name:'Hlas pod přílivem',description:'Svědectví a rituální záznamy odhalují, jak hlas napodobuje mrtvé.',type:'conclusion',tags:['voice']},
 {id:'knowledge-name',name:'Pravé jméno',description:'Archivní záznamy a fotografie spojují jméno s dávným kultem.',type:'conclusion',tags:['name']},
 {id:'knowledge-body',name:'Tělo zvonu',description:'Plány a rytina odhalují fyzické jádro mechanismu.',type:'conclusion',tags:['body']},
];
export const deductions = [{
  id:'blackwater-follow-the-route',name:'Kam vedou stopy',description:'Deník a nezávislé potvrzení ukazují na společný cíl.',repeatable:false,
  conditions:{type:'any',conditions:[
    {type:'all',conditions:[{type:'hasEvidence',id:'reward-2'},{type:'hasEvidence',id:'reward-5'}]},
    {type:'all',conditions:[{type:'hasEvidence',id:'reward-2'},{type:'hasEvidence',id:'harbor-note-copy'}]},
  ]},
  effects:[{type:'addKnowledge',id:'blackwater-lighthouse-connection'}],
}];
deductions.push(
 {id:'blackwater-voice-route',name:'Kdo mluví z hlubin',description:'Svědectví pacienta a rytina objasňují povahu hlasu.',repeatable:false,
  conditions:{type:'all',conditions:[{type:'hasEvidence',id:'reward-12'},{type:'hasEvidence',id:'reward-14'}]},
  effects:[{type:'addKnowledge',id:'knowledge-voice'}]},
 {id:'blackwater-name-route',name:'Jméno z archivu',description:'Katalog a fotografie odhalují spojení s kultem.',repeatable:false,
  conditions:{type:'all',conditions:[{type:'hasEvidence',id:'reward-10'},{type:'hasEvidence',id:'reward-11'}]},
  effects:[{type:'addKnowledge',id:'knowledge-name'}]},
 {id:'blackwater-body-route',name:'Srdce mechanismu',description:'Plány majáku a rituální rytina ukazují cestu k tělu zvonu.',repeatable:false,
  conditions:{type:'all',conditions:[{type:'hasEvidence',id:'reward-9'},{type:'hasEvidence',id:'reward-14'}]},
  effects:[{type:'addKnowledge',id:'knowledge-body'}]},
);
export const investigationDefinitions = {evidence,knowledge,deductions};
