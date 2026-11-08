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
   }}
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
}];
