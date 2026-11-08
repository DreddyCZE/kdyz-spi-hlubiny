// Scenario investigator identity. No legacy save or game-stat mutations.
// Keep identities separate from the old Blackwater combat classes until
// scenario-specific HP/SAN caps and items have their own validated rules.
export const scenarioInvestigators = Object.freeze([
  Object.freeze({id:'detective',name:'Detektiv',role:'Pátrání',portraitId:'detective',description:'Sleduje stopy a skládá svědectví.'}),
  Object.freeze({id:'occultist',name:'Eleanor Whitmore',role:'Výzkumnice okultismu',portraitId:'occultist',description:'Rozpoznává znamení a staré rituály.'}),
  Object.freeze({id:'sailor',name:'Námořník',role:'Přežití',portraitId:'sailor',description:'Zná přístav a nebezpečí přílivu.'}),
]);
export const defaultScenarioInvestigatorId='occultist';
export function scenarioInvestigator(id){return scenarioInvestigators.find(i=>i.id===id)||null;}
export function selectScenarioInvestigator(session,id){
  const candidate=scenarioInvestigator(id);
  if(!candidate||!session||session.schemaVersion!==1||session.scenario?.endingId||session.scenario?.pendingTest)return session;
  const g=session.game;
  if(!g||g.round!==1||g.revision!==0||g.ended||g.ap!==3||Object.keys(g.drawnCards||{}).length)return session;
  const current=session.scenario.investigatorId||defaultScenarioInvestigatorId;
  if(current===id)return session;
  return {...session,scenario:{...session.scenario,investigatorId:id}};
}
