// Opt-in Blackwater puzzle content; the legacy game does not load this file.
import {createPuzzle} from '../engine/puzzle.js';
export const blackwaterPuzzles=Object.freeze([
 createPuzzle({
  id:'bw-bell-order',version:1,title:'Tři znamení zvonu',locationId:'location-5',type:'sequence',
  description:'Na podstavci jsou tři posuvná znamení. Jejich pořadí se dochovalo v různých záznamech města.',
  riskText:'První chybný pokus zvýší hrozbu o 1. Máš tři pokusy; pak můžeš využít náhradní cestu.',
  solvedText:'Oko mrtvých, kotva živých, vlna moře. V podstavci cvakne západka: rozpoznáš původní přísahu, nikoli modlitbu k mrtvým.',
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
  fallback:{type:'alternatePath',id:'bell-order-force',apCost:1,text:'Podepřít západku násilím · hrozba +1',resultText:'Západka povolí. Původní pořadí neznáš, ale zvon lze mechanicky zadržet. Náhradní cesta zůstává otevřená.',effects:[{type:'setFlag',id:'bell-order-forced',value:true},{type:'modifyThreat',amount:1}]}
 }),
 createPuzzle({
  id:'bw-missing-name',version:1,title:'Chybějící jméno v matrice',locationId:'location-4',type:'deduction',
  description:'Hrobník položí na stůl tři jmenovky. Urči, koho vymazali z přísahy roku 1883. Porovnej archivní opis a fotografii s rituální rytinou ze hřbitova. Kopie hledej v knihovně u Dopisu správci, rytinu na zdejším náhrobku; chybějící podklady může nahradit hrobníkův placený opis.',
  requiredEvidence:['reward-10','reward-11','reward-14'],
  clues:[
   {id:'name-register',sourceEvidenceId:'reward-10',text:'Archivní opis: čtvrtý podpis přísahy patřil tehdejšímu starostovi, nikoli kapitánovi ani dědici strážců.'},
   {id:'name-photo',sourceEvidenceId:'reward-11',text:'Popisky na fotografii: Nathaniel Voss — starosta 1883. Thomas Bell — současný správce majáku. Samuel Reed — kapitán Milosti.'},
   {id:'name-gravestone',sourceEvidenceId:'reward-14',text:'Rytina na náhrobku spojuje chybějící jmenovku s městskou pečetí a přísahou z roku 1883. Hledáš tehdejšího úředníka, ne dnešního svědka.'}
  ],interaction:{options:['samuel-reed','thomas-bell','nathaniel-voss'],answer:'nathaniel-voss'},
  labels:{'samuel-reed':'Samuel Reed','thomas-bell':'Thomas Bell','nathaniel-voss':'Nathaniel Voss'},
  attempts:{mode:'limited',max:3,penaltyAfter:1},
  riskText:'První chybný zápis zvýší hrozbu o 1. Po třech pokusech pomůže placený opis z hrobníkovy knihy.',
  wrongText:'Inkoust se rozteče do tvaru otevřených úst. Zvolený člověk neodpovídá dochovanému úřadu a datu. První chybný zápis přivolal pozornost.',
  solvedText:'Nathaniel Voss nebyl obětí požáru: byl jedním z těch, kdo záznam zfalšovali. Důkaz přísahy lze předložit jeho potomkovi v ústavu.',
  hints:[{id:'name-hint',sourceEvidenceId:'reward-10',text:'Porovnej úřad podepisujícího s popiskem a rokem fotografie.'}],
  onSolve:[{type:'setFlag',id:'registry-name-solved',value:true}],onWrong:[{type:'modifyThreat',amount:1}],
  fallback:{id:'name-gravedigger-copy',type:'alternatePath',apCost:1,text:'Požádat hrobníka o ověřený opis · hrozba +1',resultText:'Hrobník porovná kopie za tebe. Čas a otevřený rozhovor přilákají pozornost. Opis lze použít u Vosse, vlastní dedukci jsi však nedokončil.',effects:[{type:'setFlag',id:'registry-name-copied',value:true},{type:'modifyThreat',amount:1}]}
 }),
 createPuzzle({
  id:'bw-lighthouse-signal',version:1,title:'Majákový signál',locationId:'location-5',type:'mechanism',
  description:'Thomas Bell ti ukáže převody a clonu. Nastav délku pauzy a směr světla podle lodního deníku, plánu a svědectví pacienta. Chybějící podklady hledej v přístavu, knihovně a ústavu.',
  requiredEvidence:['reward-2','reward-9','reward-12'],
  clues:[
   {id:'signal-log',sourceEvidenceId:'reward-2',text:'Deník Milosti: hlas se nadechne až po dlouhé pauze. Krátká pauza mu nedovolí dokončit oslovení.'},
   {id:'signal-plan',sourceEvidenceId:'reward-9',text:'Plán čočky: clona může obrátit paprsek na město nebo přímo na moře.'},
   {id:'signal-patient',sourceEvidenceId:'reward-12',text:'Pacient: odpověď přicházela z vody; lampy namířené do ulic ji neumlčely.'}
  ],interaction:{controls:['pause','beam'],states:{pause:['long','short'],beam:['town','sea']},answer:{pause:'short',beam:'sea'}},
  labels:{pause:'Pauza mezi záblesky',beam:'Směr paprsku',long:'Dlouhá',short:'Krátká',town:'Město',sea:'Moře'},
  attempts:{mode:'limited',max:3,penaltyAfter:1},
  riskText:'První chybná aktivace zvýší hrozbu o 1. Po třech pokusech lze převzít ruční obsluhu za 1 AP a hrozbu +1.',
  wrongText:'Paprsek přejede mlhu, ale zvon odpoví stejným rytmem. Porovnej pauzu s deníkem a směr se svědectvím. První chybná aktivace zvýšila hrozbu.',
  solvedText:'Krátká pauza, světlo na moře. Hlas ztrácí rytmus. Thomas dokáže přístroj udržet v chodu, pokud se mu rozhodneš důvěřovat.',
  hints:[{id:'signal-hint',sourceEvidenceId:'reward-2',text:'Nedopřej hlasu dlouhý nádech. Hledej zdroj, nikoli okna posluchačů.'}],
  onSolve:[{type:'setFlag',id:'lighthouse-signal-solved',value:true}],onWrong:[{type:'modifyThreat',amount:1}],
  fallback:{id:'signal-manual',type:'alternatePath',apCost:1,text:'Zablokovat převod a převzít ruční obsluhu · hrozba +1',resultText:'Převod je podepřený. Thomas může světlo obsluhovat ručně, ale porucha připomene městu nebezpečí.',effects:[{type:'setFlag',id:'lighthouse-signal-manual',value:true},{type:'modifyThreat',amount:1}]}
 })
]);
