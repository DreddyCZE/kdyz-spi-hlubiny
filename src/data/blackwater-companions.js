import {createCompanion} from '../engine/companion.js';
// Optional Blackwater encounter. The dog gives atmospheric information, not a puzzle answer.
export const blackwaterCompanions=[
 createCompanion({
  id:'blackwater-dog',name:'Toulavý pes',kind:'animal',
  availability:{locationId:'location-1'},
  abilities:[
   {id:'scent',name:'Zachytit stopu',type:'active',trigger:'exploration',uses:'oncePerRound',text:'Pes se zastaví u vlhkých stop vedoucích od starých domů. Něco tudy prošlo před přílivem.'},
   {id:'warning',name:'Neklid',type:'passive',trigger:'danger',uses:'passive',text:'Pes při nebezpečí ztichne a nastraží uši.'}
  ]
 })
];
