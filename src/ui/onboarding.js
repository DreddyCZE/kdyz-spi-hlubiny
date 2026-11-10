import {blackwaterPrologue,blackwaterHints} from '../data/blackwater-onboarding.js';
export const ONBOARDING_KEY='hlubiny-onboarding-v1';
export function createOnboarding(anchor,storage,initial){
 let prefs;try{prefs=JSON.parse(storage?.getItem(ONBOARDING_KEY)||'null');}catch{}
 const valid=prefs&&prefs.version===1&&typeof prefs.enabled==='boolean'&&typeof prefs.introSeen==='boolean'&&Array.isArray(prefs.seen)&&prefs.seen.every(id=>Object.hasOwn(blackwaterHints,id));
 if(!valid)prefs={version:1,enabled:initial.game.revision===0,introSeen:initial.game.revision!==0,seen:[]};
 const save=()=>{try{storage?.setItem(ONBOARDING_KEY,JSON.stringify(prefs));}catch{}};
 save();
 const section=document.createElement('section');section.className='scenario-feature onboarding';section.setAttribute('aria-label','Průvodce Blackwaterem');anchor.before(section);
 const b=(text,fn)=>{const el=document.createElement('button');el.textContent=text;el.type='button';el.onclick=fn;return el;};
 let lastSession=initial,lastScene={},showIntro=false;
 const render=(session=lastSession,scene=lastScene)=>{
  lastSession=session;lastScene=scene;section.replaceChildren();section.hidden=!prefs.enabled;
  if(!prefs.enabled)return;
  const g=session.game;
  if(showIntro||!prefs.introSeen&&g.revision===0){
   const h=document.createElement('h2');h.textContent='Příjezd do Blackwateru';section.append(h);
   for(const text of blackwaterPrologue){const p=document.createElement('p');p.textContent=text;section.append(p);}
   section.append(b('Vstoupit do Blackwateru',()=>{showIntro=false;prefs.introSeen=true;save();render();}),b('Přeskočit úvod a nápovědy',()=>{showIntro=false;prefs.enabled=false;prefs.introSeen=true;save();render();}));return;
  }
  if(scene.ending||g.ended){section.hidden=true;return;}
  const card=Object.hasOwn(g.drawnCards,g.locationId);
  const options=[scene.combat?.status==='active'&&'combat',scene.pendingTest&&'roll',g.evidence.length>0&&'evidence',scene.puzzles?.length>0&&'puzzle',g.round>1&&'clock',scene.investigatorId===null?'investigator':card?'card':'map',scene.equipment?.length>0&&'equipment'];
  const id=options.find(id=>id&&!prefs.seen.includes(id));if(!id){section.hidden=true;return;}
  const hint=blackwaterHints[id],h=document.createElement('h3'),p=document.createElement('p');h.textContent=hint.title;p.textContent=hint.text;
  section.append(h,p,b('Rozumím',()=>{prefs.introSeen=true;prefs.seen.push(id);save();render();}),b('Vypnout nápovědy',()=>{prefs.enabled=false;prefs.introSeen=true;save();render();}));
 };
 return {render,restart(){showIntro=false;prefs={version:1,enabled:true,introSeen:false,seen:[]};save();render();},reopen(){showIntro=true;prefs={version:1,enabled:true,introSeen:false,seen:[]};save();render();section.scrollIntoView({block:'nearest'});section.querySelector('button')?.focus({preventScroll:true});}};
}
