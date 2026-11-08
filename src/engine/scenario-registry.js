// Scenario packs are data bundles. The runtime depends on this contract, not on a named story.
export function createScenarioRegistry(packs){
 if(!Array.isArray(packs)||!packs.length)throw new Error('At least one scenario pack is required');
 const byId=new Map();
 for(const pack of packs){
  if(!pack||!pack.scenario||!pack.content||!pack.presentation||!pack.locations)throw new Error('Incomplete scenario pack');
  const {scenario,content}=pack;
  if(byId.has(scenario.id))throw new Error('Duplicate scenario: '+scenario.id);
  if(!scenario.locations.every(id=>content.refs.locations.includes(id)))throw new Error('Scenario locations missing from content: '+scenario.id);
  if(!pack.locations.every(l=>scenario.locations.includes(l.id)))throw new Error('Presentation locations mismatch: '+scenario.id);
  byId.set(scenario.id,Object.freeze({...pack}));
 }
 return Object.freeze({ids:Object.freeze([...byId.keys()]),get:id=>byId.get(id)||null,first:()=>byId.get(packs[0].scenario.id)});
}
