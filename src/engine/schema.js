export const outcomeKeys = ['criticalSuccess', 'greatSuccess', 'success', 'partialSuccess', 'failure', 'criticalFailure'];
export const attributes = Object.freeze({ SÍ: 1, OB: 2, VĚ: 3, VŮ: 2, VN: 2 });
export const cardTypes = ['encounter', 'event', 'item', 'evidence'];
export const isRecord = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const idOK = x => typeof x === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(x);
const scalar = x => typeof x === 'boolean' || typeof x === 'string' || Number.isFinite(x);

// Closed operation vocabulary. New card types can be registered independently of effects.
export function validateCards(cards, catalog, types = cardTypes) {
  const errors = [], ids = new Set(), choices = new Set();
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  const ref = (collection,id,path) => { if (!collection.includes(id)) fail(path, `neznámé ID ${String(id)}`); };
  const fields = (value,allowed,path) => {
    if (!isRecord(value)) { fail(path,'očekáván objekt'); return false; }
    for (const k of Object.keys(value)) if (!allowed.includes(k)) fail(`${path}.${k}`,'neznámé pole');
    return true;
  };
  function conditions(value,path) {
    if (!Array.isArray(value)) { fail(path,'očekáváno pole podmínek'); return; }
    value.forEach((c,i)=>{
      const p=`${path}[${i}]`;
      if(!fields(c,['type','id','value','round'],p))return;
      switch(c.type){
        case 'hasItem': ref(catalog.items,c.id,p+'.id'); break;
        case 'hasEvidence': ref(catalog.evidence,c.id,p+'.id'); break;
        case 'locationUnlocked': ref(catalog.locations,c.id,p+'.id'); break;
        case 'flagEquals': ref(catalog.flags,c.id,p+'.id'); if(!scalar(c.value))fail(p+'.value','očekávána skalární hodnota'); break;
        case 'minRound': case 'maxRound': if(!Number.isInteger(c.round)||c.round<1||c.round>7)fail(p+'.round','očekáváno celé číslo 1–7'); break;
        default: fail(p+'.type','neznámý typ podmínky');
      }
      const allowed = ['type', ...(['minRound','maxRound'].includes(c.type)?['round']:c.type==='flagEquals'?['id','value']:['id'])];
      for(const k of Object.keys(c))if(!allowed.includes(k))fail(p+'.'+k,'pole nepatří k tomuto typu podmínky');
    });
  }
  function effects(value,path){
    if(!Array.isArray(value)){fail(path,'očekáváno pole efektů');return;}
    value.forEach((e,i)=>{
      const p=`${path}[${i}]`;
      if(!fields(e,['type','id','stat','amount','value'],p))return;
      switch(e.type){
        case 'modifyStat': if(!['hp','san'].includes(e.stat))fail(p+'.stat','povoleno hp nebo san');
        // falls through: stat effects and tracks share integer amounts
        case 'modifyThreat': case 'modifyRitual': if(!Number.isSafeInteger(e.amount))fail(p+'.amount','očekáváno celé bezpečné číslo'); break;
        case 'addItem': case 'removeItem': ref(catalog.items,e.id,p+'.id'); break;
        case 'addEvidence': ref(catalog.evidence,e.id,p+'.id'); break;
        case 'unlockLocation': ref(catalog.locations,e.id,p+'.id'); break;
        case 'setFlag': ref(catalog.flags,e.id,p+'.id'); if(!scalar(e.value))fail(p+'.value','očekávána skalární hodnota'); break;
        default: fail(p+'.type','neznámý typ efektu');
      }
      const allowed=['type',...({modifyStat:['stat','amount'],modifyThreat:['amount'],modifyRitual:['amount'],setFlag:['id','value']}[e.type]||['id'])];
      for(const k of Object.keys(e))if(!allowed.includes(k))fail(p+'.'+k,'pole nepatří k tomuto typu efektu');
    });
  }
  if(!Array.isArray(cards)) return ['cards: očekáváno pole'];
  cards.forEach((c,i)=>{
    const p=`cards[${i}]`;
    if(!fields(c,['id','type','locationId','title','description','repeatable','conditions','choices'],p))return;
    if(!idOK(c.id)||ids.has(c.id))fail(p+'.id','neplatné nebo duplicitní ID karty'); ids.add(c.id);
    if(!types.includes(c.type))fail(p+'.type','neregistrovaný typ karty');
    ref(catalog.locations,c.locationId,p+'.locationId');
    for(const k of ['title','description'])if(typeof c[k]!=='string'||!c[k].trim())fail(p+'.'+k,'očekáván neprázdný text');
    if(typeof c.repeatable!=='boolean')fail(p+'.repeatable','očekáváno boolean');
    conditions(c.conditions,p+'.conditions');
    if(!Array.isArray(c.choices)||!c.choices.length){fail(p+'.choices','očekáváno neprázdné pole voleb');return;}
    c.choices.forEach((o,j)=>{
      const q=`${p}.choices[${j}]`;
      if(!fields(o,['id','label','apCost','conditions','test','outcomes'],q))return;
      if(!idOK(o.id)||choices.has(o.id))fail(q+'.id','neplatné nebo duplicitní ID volby'); choices.add(o.id);
      if(typeof o.label!=='string'||!o.label.trim())fail(q+'.label','očekáván neprázdný text');
      if(!Number.isInteger(o.apCost)||o.apCost<0||o.apCost>3)fail(q+'.apCost','očekáváno celé číslo 0–3');
      if(o.conditions!==undefined)conditions(o.conditions,q+'.conditions');
      if(o.test!==undefined&&fields(o.test,['attribute','difficulty','modifier'],q+'.test')){
        if(!Object.hasOwn(attributes,o.test.attribute))fail(q+'.test.attribute','neznámý atribut');
        if(!Number.isSafeInteger(o.test.difficulty)||o.test.difficulty<1)fail(q+'.test.difficulty','očekáváno kladné celé číslo');
        if(o.test.modifier!==undefined&&!Number.isSafeInteger(o.test.modifier))fail(q+'.test.modifier','očekáváno celé číslo');
      }
      const keys=o.test!==undefined?outcomeKeys:['success'];
      if(!fields(o.outcomes,keys,q+'.outcomes'))return;
      for(const key of keys){
        const r=o.outcomes[key],rpath=q+'.outcomes.'+key;
        if(!fields(r,['text','effects'],rpath))continue;
        if(typeof r.text!=='string'||!r.text.trim())fail(rpath+'.text','očekáván neprázdný text');
        effects(r.effects,rpath+'.effects');
      }
    });
  });
  return errors;
}
export function assertCards(cards,catalog,types){
  const errors=validateCards(cards,catalog,types);
  if(errors.length)throw new Error('Neplatná karetní data:\n'+errors.join('\n'));
}
