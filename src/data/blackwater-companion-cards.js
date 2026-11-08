// Optional investigation lead revealed only after the companion finds a scent.
export const blackwaterCompanionCards=[{
 id:'bw-dog-trail',type:'evidence',locationId:'location-1',
 title:'Stopa za zdí',
 description:'Pes se zastaví u popraskané zdi. Pod omítkou se táhne úzký pruh zaschlé soli a otisky malých bot vedou k zamčenému dvoru.',
 repeatable:false,
 conditions:[{type:'flagEquals',id:'dog-scent-found',value:true}],
 choices:[
  {id:'bw-dog-trail-mark',label:'Zaznamenat směr stop a pokračovat v pátrání',apCost:1,
   outcomes:{success:{text:'Zaznamenáš směr stop. Zdá se, že někdo prošel starým městem ještě před posledním přílivem. Záznam můžeš porovnat s dalšími svědectvími.',effects:[{type:'setFlag',id:'dog-trail-recorded',value:true}]}}},
  {id:'bw-dog-trail-leave',label:'Nechat dvůr být a hledat jiné důkazy',apCost:0,
   outcomes:{success:{text:'Stopu si zapamatuješ, ale do dvora nevstoupíš. Další odpovědi budeš hledat jinde.',effects:[]}}}
 ]
},{
 id:'bw-lighthouse-salt',type:'evidence',locationId:'location-5',
 title:'Sůl na schodech',
 description:'Pod schodištěm majáku se na kameni usadila sůl. Její vzor připomíná úzkou cestu, ale bez dalšího svědectví nevíš, odkud sem vede.',
 repeatable:false,conditions:[],choices:[
  {id:'bw-lighthouse-salt-study',label:'Prozkoumat solný vzor',apCost:1,
   test:{attribute:'VN',difficulty:9},outcomes:{
    criticalSuccess:{text:'Všimneš si stop po údržbářských botách a skrytého průchodu. Získáváš přesnější představu o cestě k pobřeží.',effects:[{type:'setFlag',id:'salt-route-known',value:true}]},
    greatSuccess:{text:'Objevíš směr staré servisní cesty.',effects:[{type:'setFlag',id:'salt-route-known',value:true}]},
    success:{text:'Rozpoznáš značky staré servisní cesty.',effects:[{type:'setFlag',id:'salt-route-known',value:true}]},
    partialSuccess:{text:'Zachytíš směr cesty, ale pohled do temného schodiště tě zneklidní.',effects:[{type:'setFlag',id:'salt-route-known',value:true},{type:'modifyStat',stat:'san',amount:-1}]},
    failure:{text:'Vzor se rozpadá pod prsty. Zatím nemáš jistotu, kudy cesta vedla.',effects:[]},
    criticalFailure:{text:'Za zdí se ozve skřípění. Musíš ustoupit.',effects:[{type:'modifyThreat',amount:1}]}
   }},
  {id:'bw-lighthouse-salt-leave',label:'Nechat solný vzor být a pokračovat v pátrání',apCost:0,
   outcomes:{success:{text:'Solný vzor necháš nedotčený. Další souvislosti můžeš hledat v ostatních stopách.',effects:[]}}}
 ]
},{
 id:'bw-lighthouse-dog-trail',type:'evidence',locationId:'location-5',
 title:'Stejná stopa u majáku',
 description:'Pod schody majáku najdeš otisky stejné soli a obuvi jako u staroměstského dvora. Někdo znal cestu mezi oběma místy.',
 repeatable:false,conditions:[{type:'flagEquals',id:'dog-trail-recorded',value:true}],choices:[
  {id:'bw-lighthouse-dog-compare',label:'Porovnat oba záznamy',apCost:1,
   outcomes:{success:{text:'Záznamy do sebe zapadnou: obě místa spojuje servisní cesta. Je to vodítko, nikoli řešení toho, co se děje v jeskyních.',effects:[{type:'setFlag',id:'salt-route-known',value:true}]}}},
  {id:'bw-lighthouse-dog-ignore',label:'Pokračovat bez porovnání',apCost:0,
   outcomes:{success:{text:'Souvislost zůstane otevřená. Maják můžeš prozkoumat i bez psího vodítka.',effects:[]}}}
 ]
},{
 id:'bw-cave-service-route',type:'encounter',locationId:'location-6',
 title:'Průchod pod skálou',
 description:'Příliv zaplavuje ústí jeskyně. Za zříceným ochozem vede stará servisní štola; druhá cesta pokračuje přes kluzké kameny přímo k dunění zvonu.',
 repeatable:false,conditions:[],choices:[
  {id:'bw-cave-route-known',label:'Využít zaznamenanou servisní cestu',apCost:1,
   conditions:[{type:'flagEquals',id:'salt-route-known',value:true}],
   outcomes:{success:{text:'Díky dřívějšímu pátrání rozpoznáš servisní značky. Projdeš bezpečnějším úsekem a dostaneš se blíž ke zvonu, ale samotný rituál musíš stále rozluštit.',effects:[{type:'setFlag',id:'cave-service-route-used',value:true}]}}},
  {id:'bw-cave-route-ordinary',label:'Prozkoumat kluzký průchod bez mapy',apCost:1,
   test:{attribute:'VN',difficulty:9},outcomes:{
    criticalSuccess:{text:'Najdeš pevné stupy ve skále a dostaneš se dál bez úhony.',effects:[{type:'setFlag',id:'cave-service-route-used',value:true}]},
    greatSuccess:{text:'Opatrně projdeš a objevíš známky starého servisního přístupu.',effects:[{type:'setFlag',id:'cave-service-route-used',value:true}]},
    success:{text:'Dostaneš se do chodby za ochozem. Cesta byla nebezpečná, ale zvládl jsi ji.',effects:[{type:'setFlag',id:'cave-service-route-used',value:true}]},
    partialSuccess:{text:'Proklouzneš úzkým průchodem, ale uklouzneš na mokré skále.',effects:[{type:'setFlag',id:'cave-service-route-used',value:true},{type:'modifyStat',stat:'hp',amount:-1}]},
    failure:{text:'Voda tě donutí ustoupit. Tento průchod dnes nepřekonáš; vrať se k pátrání po jiných důkazech. Cesta k závěru vyšetřování zůstává otevřená.',effects:[]},
    criticalFailure:{text:'Příliv tě srazí na kolena. Ze tmy se ozve odpověď.',effects:[{type:'modifyThreat',amount:1}]}
   }}
 ]
}];
