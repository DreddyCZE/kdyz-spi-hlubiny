// Scenario-independent evidence, condition trees and deterministic deductions.
const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const idOK = x => typeof x === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(x);
const text = x => typeof x === 'string' && x.trim().length > 0;
const scalar = x => typeof x === 'boolean' || typeof x === 'string' || Number.isFinite(x);
const freeze = x => { Object.freeze(x); for (const v of Object.values(x)) if (v && typeof v === 'object' && !Object.isFrozen(v)) freeze(v); return x; };
const leafRefs = { hasItem:'items', hasEvidence:'evidence', hasKnowledge:'knowledge', deductionCompleted:'deductions', flagEquals:'flags', locationUnlocked:'locations', cardUnlocked:'cards', choiceUnlocked:'choices' };

export function validateCondition(condition, refs, path = 'condition') {
  const errors = [], stack = new Set();
  let nodes = 0;
  const fail = (p, message) => errors.push(`${p}: ${message}`);
  function visit(c, p, depth) {
    if (!record(c)) { fail(p, 'očekáván objekt podmínky'); return; }
    if (stack.has(c) || depth > 32 || ++nodes > 1000) { fail(p, 'cyklus nebo příliš složitá podmínka'); return; }
    stack.add(c);
    let allowed = ['type'];
    if (c.type === 'all' || c.type === 'any') {
      allowed.push('conditions');
      if (!Array.isArray(c.conditions) || !c.conditions.length) fail(p+'.conditions', 'očekáváno neprázdné pole');
      else Array.from(c.conditions).forEach((child,i) => visit(child, `${p}.conditions[${i}]`, depth+1));
    } else if (c.type === 'not') {
      allowed.push('condition'); visit(c.condition, p+'.condition', depth+1);
    } else if (Object.hasOwn(leafRefs, c.type)) {
      allowed.push('id');
      if (!idOK(c.id) || !(refs[leafRefs[c.type]] || []).includes(c.id)) fail(p+'.id', `neplatný nebo neznámý odkaz ${String(c.id)}`);
      if (c.type === 'flagEquals') { allowed.push('value'); if (!scalar(c.value)) fail(p+'.value', 'očekávána skalární hodnota'); }
    } else if (c.type === 'minRound' || c.type === 'maxRound') {
      allowed.push('round');
      if (!Number.isInteger(c.round) || c.round < 1 || c.round > 7) fail(p+'.round','očekáváno celé číslo 1–7');
    } else fail(p+'.type', 'neznámý typ podmínky');
    for (const key of Object.keys(c)) if (!allowed.includes(key)) fail(p+'.'+key, 'neznámé pole');
    stack.delete(c);
  }
  visit(condition, path, 0); return errors;
}

export function conditionMet(s, c, itemEvidence = {}) {
  switch (c.type) {
    case 'all': return c.conditions.every(child => conditionMet(s,child,itemEvidence));
    case 'any': return c.conditions.some(child => conditionMet(s,child,itemEvidence));
    case 'not': return !conditionMet(s,c.condition,itemEvidence);
    case 'hasItem': return s.inventory.includes(c.id);
    case 'hasEvidence': return s.evidence.includes(c.id) || s.inventory.some(id => Object.hasOwn(itemEvidence,id) && itemEvidence[id].includes(c.id));
    case 'hasKnowledge': return s.knowledge.includes(c.id);
    case 'deductionCompleted': return Object.hasOwn(s.deductions,c.id) && s.deductions[c.id] > 0;
    case 'flagEquals': return Object.hasOwn(s.flags,c.id) && s.flags[c.id] === c.value;
    case 'minRound': return s.round >= c.round;
    case 'maxRound': return s.round <= c.round;
    case 'locationUnlocked': return s.unlockedLocations.includes(c.id);
    case 'cardUnlocked': return s.unlockedCards.includes(c.id);
    case 'choiceUnlocked': return s.unlockedChoices.includes(c.id);
    default: return false;
  }
}

const effectRefs = { addKnowledge:'knowledge', unlockChoice:'choices', unlockLocation:'locations', unlockCard:'cards', setFlag:'flags' };
function inputKeys(c) {
  if (c.type === 'all' || c.type === 'any') return c.conditions.flatMap(inputKeys);
  if (c.type === 'not') return inputKeys(c.condition);
  return leafRefs[c.type] ? [`${leafRefs[c.type]}:${c.id}`] : [];
}
const outputKey = e => `${effectRefs[e.type]}:${e.id}`;

export function validateInvestigation(def, refs, itemEvidence = {}) {
  const errors = [], fail = (p,m) => errors.push(`${p}: ${m}`);
  if (!record(def)) return ['investigation: očekáván objekt'];
  for (const key of Object.keys(def)) if (!['evidence','knowledge','deductions'].includes(key)) fail(key,'neznámé pole');
  for (const kind of ['evidence','knowledge','deductions']) {
    const ids = new Set();
    if (!Array.isArray(def[kind])) { fail(kind,'očekáváno pole'); continue; }
    Array.from(def[kind]).forEach((entry,i) => {
      const p = `${kind}[${i}]`;
      if (!record(entry)) { fail(p,'očekáván objekt'); return; }
      if (!idOK(entry.id) || ids.has(entry.id)) fail(p+'.id','neplatné nebo duplicitní ID');
      ids.add(entry.id);
      for (const field of ['name','description']) if (!text(entry[field])) fail(p+'.'+field,'očekáván neprázdný text');
      const allowed = kind === 'deductions' ? ['id','name','description','repeatable','conditions','effects'] : ['id','name','description','type','tags','source','metadata'];
      for (const field of Object.keys(entry)) if (!allowed.includes(field)) fail(p+'.'+field,'neznámé pole');
      if (kind !== 'deductions') {
        if (!text(entry.type)) fail(p+'.type','očekáván typ informace');
        if (!Array.isArray(entry.tags) || !Array.from(entry.tags).every(text) || new Set(entry.tags).size !== entry.tags.length) fail(p+'.tags','očekávány unikátní textové štítky');
        if (entry.source !== undefined && !text(entry.source)) fail(p+'.source','očekáván textový zdroj');
        if (entry.metadata !== undefined && !jsonObject(entry.metadata)) fail(p+'.metadata','očekáván prostý JSON objekt');
      } else if (typeof entry.repeatable !== 'boolean') fail(p+'.repeatable','očekáváno boolean');
    });
  }
  if (errors.length) return errors;
  const allRefs = {...refs, evidence:def.evidence.map(x=>x.id), knowledge:def.knowledge.map(x=>x.id), deductions:def.deductions.map(x=>x.id)};
  for (const [id,ids] of Object.entries(itemEvidence)) {
    if (!idOK(id) || !(refs.items||[]).includes(id) || !Array.isArray(ids) || new Set(ids).size!==ids.length || !Array.from(ids).every(e=>allRefs.evidence.includes(e))) fail('itemEvidence.'+id,'neplatný předmět nebo odkaz na důkaz');
  }
  for (const [i,d] of def.deductions.entries()) {
    const p = `deductions[${i}]`;
    errors.push(...validateCondition(d.conditions,allRefs,p+'.conditions'));
    if (!Array.isArray(d.effects) || !d.effects.length) { fail(p+'.effects','očekáváno neprázdné pole'); continue; }
    Array.from(d.effects).forEach((e,j) => {
      const q = `${p}.effects[${j}]`;
      if (!record(e) || !Object.hasOwn(effectRefs,e.type)) { fail(q+'.type','neznámý efekt dedukce'); return; }
      if (!idOK(e.id) || !(allRefs[effectRefs[e.type]] || []).includes(e.id)) fail(q+'.id',`neplatný nebo neznámý odkaz ${String(e.id)}`);
      for (const key of Object.keys(e)) if (!['type','id',...(e.type==='setFlag'?['value']:[])].includes(key)) fail(q+'.'+key,'neznámé pole');
      if (e.type === 'setFlag' && !scalar(e.value)) fail(q+'.value','očekávána skalární hodnota');
    });
  }
  if (!errors.length) {
    try { dependencyOrder(def.deductions); } catch (e) { errors.push(e.message); }
  }
  return errors;
}

function jsonObject(x) {
  if (!record(x)) return false;
  const seen = new Set();
  function visit(value, depth) {
    if (value === null || scalar(value)) return true;
    if ((!record(value) && !Array.isArray(value)) || seen.has(value) || depth > 32 || ![Object.prototype,Array.prototype,null].includes(Object.getPrototypeOf(value))) return false;
    seen.add(value); const ok = Object.values(value).every(v=>visit(v,depth+1)); seen.delete(value); return ok;
  }
  return visit(x,0);
}

function dependencyOrder(deductions) {
  const producers = new Map(), byId = new Map(deductions.map(d=>[d.id,d]));
  for (const d of deductions) for (const key of [`deductions:${d.id}`,...d.effects.map(outputKey)]) producers.set(key,[...(producers.get(key)||[]),d.id]);
  const visited = new Set(), active = new Set(), order = [];
  function visit(id) {
    if (active.has(id)) throw new Error(`deductions.${id}: cyklická závislost (${[...active,id].join(' → ')})`);
    if (visited.has(id)) return;
    active.add(id);
    for (const key of inputKeys(byId.get(id).conditions)) for (const producer of producers.get(key)||[]) visit(producer);
    active.delete(id); visited.add(id); order.push(id);
  }
  for (const d of deductions) visit(d.id);
  return order;
}

export function createInvestigation(def, refs, itemEvidence = {}) {
  const errors = validateInvestigation(def,refs,itemEvidence);
  if (errors.length) throw new Error('Neplatné definice vyšetřování:\n'+errors.join('\n'));
  const copy = structuredClone(def);
  return freeze({...copy, order:dependencyOrder(copy.deductions), itemEvidence:structuredClone(itemEvidence)});
}

export function rememberEvidence(s, itemEvidence) {
  for (const id of s.inventory) for (const evidenceId of Object.hasOwn(itemEvidence,id)?itemEvidence[id]:[]) if (!s.evidence.includes(evidenceId)) s.evidence.push(evidenceId);
  return s;
}

export function deduce(state, model) {
  const s = structuredClone(state);
  let changed = false;
  for (const id of model.order) {
    const d = model.deductions.find(d=>d.id===id);
    if ((!d.repeatable && Object.hasOwn(s.deductions,id)) || !conditionMet(s,d.conditions,model.itemEvidence)) continue;
    for (const e of d.effects) {
      const key = {addKnowledge:'knowledge',unlockLocation:'unlockedLocations',unlockCard:'unlockedCards',unlockChoice:'unlockedChoices'}[e.type];
      if (key) { if (!s[key].includes(e.id)) s[key].push(e.id); }
      else if (e.type === 'setFlag') s.flags[e.id] = e.value;
      else return state; // All effects are validated; keep rollback if an unvalidated caller slips through.
    }
    const count = (Object.hasOwn(s.deductions,id)?s.deductions[id]:0) + 1;
    if (!Number.isSafeInteger(count)) return state;
    s.deductions[id] = count; s.log.unshift('Dedukce: '+d.name); changed = true;
  }
  return changed ? s : state;
}

export function publicInvestigation(s, model) {
  const info = x => ({id:x.id,name:x.name,description:x.description,type:x.type,tags:[...x.tags],...(x.source?{source:x.source}:{})});
  const known = id => s.evidence.includes(id) || s.inventory.some(item=>Object.hasOwn(model.itemEvidence,item)&&model.itemEvidence[item].includes(id));
  const eligible = d => conditionMet(s,d.conditions,model.itemEvidence);
  return {
    evidence:model.evidence.filter(e=>known(e.id)).map(e=>({...info(e),carriedBy:s.inventory.filter(item=>Object.hasOwn(model.itemEvidence,item)&&model.itemEvidence[item].includes(e.id))})),
    knowledge:model.knowledge.filter(k=>s.knowledge.includes(k.id)).map(info),
    deductions:model.deductions.filter(d=>Object.hasOwn(s.deductions,d.id)).map(d=>({id:d.id,name:d.name,description:d.description,count:s.deductions[d.id]})),
    available:model.deductions.filter(d=>(d.repeatable||!Object.hasOwn(s.deductions,d.id))&&eligible(d)).map(d=>({id:d.id,name:d.name,description:d.description})),
  };
}
