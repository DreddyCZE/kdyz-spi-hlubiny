// Pure puzzle rules. The solution stays in private definitions, never in public projections.
const id=/^[a-z0-9][a-z0-9-]*$/;
const validId=x=>typeof x==='string'&&id.test(x);
const unique=a=>new Set(a).size===a.length;
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export const puzzleTypes=Object.freeze(['sequence','matching','deduction','mechanism']);
const validSymbols=a=>Array.isArray(a)&&a.length>=2&&a.length<=12&&a.every(validId)&&unique(a);
export function validatePuzzle(p){
  const errors=[],fail=(path,msg)=>errors.push(path+': '+msg);
  if(!record(p))return ['puzzle: expected object'];
  if(!validId(p.id))fail('id','invalid');
  if(!Number.isSafeInteger(p.version)||p.version<1)fail('version','invalid');
  if(typeof p.title!=='string'||!p.title.trim())fail('title','required');
  if(!validId(p.locationId))fail('locationId','invalid');
  if(!puzzleTypes.includes(p.type))fail('type','unsupported');
  if(!Array.isArray(p.clues)||!unique((p.clues||[]).map(c=>c?.id)))fail('clues','unique array required');
  for(const [i,c] of (Array.isArray(p.clues)?p.clues:[]).entries()){
    if(!record(c)||!validId(c.id)||typeof c.text!=='string'||!c.text.trim()||!validId(c.sourceEvidenceId))fail('clues['+i+']','invalid clue');
  }
  const v=p.interaction;
  if(!record(v))fail('interaction','required');
  else if(p.type==='sequence'){
    if(!validSymbols(v.symbols)||!Array.isArray(v.answer)||v.answer.length!==v.symbols.length||!unique(v.answer)||v.answer.some(x=>!v.symbols.includes(x)))fail('interaction','invalid sequence');
  }else if(p.type==='matching'){
    if(!validSymbols(v.left)||!validSymbols(v.right)||v.left.length!==v.right.length||!record(v.answer)||Object.keys(v.answer).length!==v.left.length||!v.left.every(x=>v.right.includes(v.answer[x]))||!unique(Object.values(v.answer)))fail('interaction','invalid matching');
  }else if(p.type==='deduction'){
    if(!validSymbols(v.options)||!validId(v.answer)||!v.options.includes(v.answer))fail('interaction','invalid deduction');
  }else if(p.type==='mechanism'){
    if(!validSymbols(v.controls)||!record(v.states)||!record(v.answer)||!v.controls.every(k=>Array.isArray(v.states[k])&&v.states[k].length>=2&&v.states[k].length<=12&&unique(v.states[k])&&v.states[k].every(validId)&&v.states[k].includes(v.answer[k]))||Object.keys(v.answer).length!==v.controls.length)fail('interaction','invalid mechanism');
  }
  if(!record(p.attempts)||!['unlimited','limited'].includes(p.attempts.mode)||p.attempts.mode==='limited'&&(!Number.isSafeInteger(p.attempts.max)||p.attempts.max<1)||p.attempts.penaltyAfter!==undefined&&(!Number.isSafeInteger(p.attempts.penaltyAfter)||p.attempts.penaltyAfter<1))fail('attempts','invalid');
  if(!Array.isArray(p.hints)||!unique((p.hints||[]).map(h=>h?.id)))fail('hints','unique array required');
  for(const [i,h] of (Array.isArray(p.hints)?p.hints:[]).entries())if(!record(h)||!validId(h.id)||typeof h.text!=='string'||!h.text.trim()||h.sourceEvidenceId!==undefined&&!validId(h.sourceEvidenceId))fail('hints['+i+']','invalid');
  for(const field of ['onSolve','onWrong'])if(!Array.isArray(p[field])||p[field].some(e=>!record(e)||!['setFlag','modifyThreat'].includes(e.type)||e.type==='setFlag'&&(!validId(e.id)||typeof e.value!=='boolean')||e.type==='modifyThreat'&&!Number.isSafeInteger(e.amount)))fail(field,'invalid effects');
  if(!record(p.fallback)||!validId(p.fallback.id)||p.fallback.type!=='alternatePath')fail('fallback','alternate path required');
  return errors;
}
export function createPuzzle(p){const errors=validatePuzzle(p);if(errors.length)throw new Error('Invalid puzzle:\n'+errors.join('\n'));return structuredClone(p);}
export function initialPuzzleState(){return {status:'open',attempts:0,hintIds:[]};}
export function puzzleView(p,state,game){
  const s=state||initialPuzzleState(),evidence=game.evidence||[];
  return {id:p.id,title:p.title,type:p.type,status:s.status,attempts:s.attempts,remaining:p.attempts.mode==='limited'?Math.max(0,p.attempts.max-s.attempts):null,
    clues:p.clues.filter(c=>evidence.includes(c.sourceEvidenceId)).map(c=>({id:c.id,text:c.text})),
    hints:(p.hints||[]).filter(h=>s.hintIds.includes(h.id)&&(!h.sourceEvidenceId||evidence.includes(h.sourceEvidenceId))).map(h=>({id:h.id,text:h.text})),
    availableHints:(p.hints||[]).filter(h=>!s.hintIds.includes(h.id)&&(!h.sourceEvidenceId||evidence.includes(h.sourceEvidenceId))).map(h=>({id:h.id})),
    interaction:p.type==='sequence'?{symbols:[...p.interaction.symbols]}:p.type==='matching'?{left:[...p.interaction.left],right:[...p.interaction.right]}:p.type==='deduction'?{options:[...p.interaction.options]}:{controls:[...p.interaction.controls],states:structuredClone(p.interaction.states)}};
}
function correct(p,a){
  const v=p.interaction;
  if(p.type==='sequence')return Array.isArray(a)&&a.length===v.answer.length&&a.every((x,i)=>x===v.answer[i]);
  if(p.type==='deduction')return a===v.answer;
  if(!record(a)||Object.keys(a).length!==Object.keys(v.answer).length)return false;
  return Object.keys(v.answer).every(k=>a[k]===v.answer[k]);
}
export function attemptPuzzle(p,state,answer){
  const s=state||initialPuzzleState();
  if(s.status!=='open'||p.attempts.mode==='limited'&&s.attempts>=p.attempts.max)return null;
  const n=s.attempts+1,solved=correct(p,answer);
  const penalized=!solved&&n>=(p.attempts.penaltyAfter??1)&&n===(p.attempts.penaltyAfter??1);
  return {state:{...s,attempts:n,status:solved?'solved':p.attempts.mode==='limited'&&n>=p.attempts.max?'blocked':'open'},solved,effects:solved?p.onSolve:penalized?p.onWrong:[]};
}
export function revealPuzzleHint(p,state,hintId,game){
  const s=state||initialPuzzleState(),hint=(p.hints||[]).find(h=>h.id===hintId);
  if(s.status!=='open'||!hint||s.hintIds.includes(hintId)||hint.sourceEvidenceId&&!(game.evidence||[]).includes(hint.sourceEvidenceId))return null;
  return {...s,hintIds:[...s.hintIds,hintId]};
}
