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
}];
