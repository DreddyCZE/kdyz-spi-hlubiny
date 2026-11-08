// Opt-in Blackwater puzzle content; the legacy game does not load this file.
import {createPuzzle} from '../engine/puzzle.js';
export const blackwaterPuzzles=Object.freeze([
 createPuzzle({
  id:'bw-bell-order',version:1,title:'Tři znamení zvonu',locationId:'location-5',type:'sequence',
  clues:[
   {id:'bell-archive',sourceEvidenceId:'reward-10',text:'Archivní katalog popisuje oko jako znamení těch, kdo už nemohou odpovědět.'},
   {id:'bell-witness',sourceEvidenceId:'reward-12',text:'Pacient tvrdí, že kotva patří živým; slyšel ji až po hlasu mrtvých.'},
   {id:'bell-ritual',sourceEvidenceId:'reward-14',text:'Rytina zachycuje vlnu až za kotvou, nikdy před ní.'}
  ],
  interaction:{symbols:['wave','eye','anchor'],answer:['eye','anchor','wave']},
  attempts:{mode:'limited',max:3,penaltyAfter:1},
  hints:[{id:'bell-hint',text:'První patří mrtvým, poslední moři.',sourceEvidenceId:'reward-10'}],
  onSolve:[{type:'setFlag',id:'bell-order-solved',value:true}],
  onWrong:[{type:'modifyThreat',amount:1}],
  fallback:{type:'alternatePath',id:'bell-order-force'}
 })
]);
