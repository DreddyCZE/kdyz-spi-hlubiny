// Presentation only: consumes reached/public values and never changes a game session.
import { blackwaterImage } from '../data/story-art.js';

export function createTablePresentation() {
  const get=id=>document.getElementById(id);
  let lastSceneKey='',myth=null,puzzleFocused=false,lastThreatId='';
  const mythNotice=get('mythNotice');
  get('scenario-puzzles').addEventListener('focusin',()=>{puzzleFocused=true;setPhase('puzzle','Hádanky');});
  document.querySelector('[data-phase="puzzle"]').addEventListener('click',event=>{
    event.preventDefault();
    const target=get('scenario-puzzles');
    target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'nearest',behavior:'auto'});
  });
  function setPhase(phase,label) {
    get('storyPanel').dataset.scene=phase;
    get('scenePhase').textContent=label;
    for(const step of document.querySelectorAll('[data-phase]')){
      if(step.dataset.phase===phase)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');
    }
  }
  return {
    clear() { myth=null;puzzleFocused=false; },
    showMyth(round,clocks) { myth={round,clocks};puzzleFocused=false; },
    render({scene,cardId,locationId,legacy,rolling}) {
      const fog=(scene.mythEvents||[]).find(e=>e.status==='pending');
      if(fog&&lastThreatId!==fog.id){myth={round:scene.round,clocks:scene.clocks};lastThreatId=fog.id;}
      if(!scene.mythEvents?.length)lastThreatId='';
      const investigator=scene.investigator;
      get('fieldName').textContent=investigator?.name||(legacy?'Eleanor Whitmore':scene.investigatorId===null?'Vyber vyšetřovatele':'Vyšetřovatel');
      get('fieldRole').textContent=investigator?.role||(legacy?'Výzkumnice':'Zvony pod přílivem');
      const portrait=blackwaterImage('investigators',investigator?.id||'occultist');
      get('fieldPortrait').style.backgroundImage=portrait?`url("${new URL(portrait,document.baseURI).href}")`:'';
      get('hpLimit').textContent=investigator?.hp||6;
      get('sanLimit').textContent=investigator?.san||8;
      const phase=scene.combat?.status==='active'?'combat':myth?'myth':puzzleFocused&&scene.puzzles.length?'puzzle':'exploration';
      setPhase(phase,scene.ending?'Závěr vyšetřování':({combat:'Souboj',myth:'Mýtus',puzzle:'Hádanky',exploration:scene.pendingTest?'Zkouška · potvrď hod':'Průzkum'})[phase]);
      const puzzleLink=document.querySelector('[data-phase="puzzle"]');
      puzzleLink.hidden=!scene.puzzles.length;
      mythNotice.hidden=!myth;
      mythNotice.classList.toggle('myth-event-card',Boolean(fog));
      mythNotice.replaceChildren();
      if(myth){
        mythNotice.style.setProperty('--myth-art',`url("${new URL(blackwaterImage('myths',fog?'myth-fog':'myth-bell'),document.baseURI).href}")`);
        const title=document.createElement('h3');title.textContent='Mýtus · začíná '+myth.round+'. kolo';
        const info=document.createElement('p');info.textContent=myth.clocks.map(c=>`${c.label}: ${c.current} / ${c.max}`).join(' · ');
        const text=document.createElement('p');text.textContent='Konec kola byl vyhodnocen. Aktuální AP a stav vyšetřovatele vidíš vedle mapy.';
        const close=document.createElement('button');close.textContent='Zpět k průzkumu';close.onclick=()=>{myth=null;mythNotice.hidden=true;setPhase('exploration','Průzkum');get('cardTitle').focus({preventScroll:true});};
        mythNotice.append(title,info,text,close);
        if(fog){
          const art=document.createElement('img');art.src=blackwaterImage('myths','myth-fog');art.alt='Mlha nad opuštěnými moly';art.className='myth-card-art';
          const eventTitle=document.createElement('h3');eventTitle.textContent=fog.title;
          const warning=document.createElement('p');warning.textContent=fog.text;
          const impact=document.createElement('p');impact.className='myth-impact';impact.textContent=`Místo dopadu: ${fog.locationName||fog.locationId} · Termín: konec ${fog.dueRound}. kola`;
          mythNotice.prepend(art,eventTitle,impact,warning);
        }
      }
      const key=[phase,locationId,cardId,scene.combat?.exchange,Boolean(scene.pendingTest),Boolean(scene.ending)].join(':');
      if(key!==lastSceneKey&&!rolling){
        const panel=get('storyPanel');panel.classList.remove('scene-enter');
        // Restart the short cosmetic entrance only after an actual scene change.
        void panel.offsetWidth;panel.classList.add('scene-enter');lastSceneKey=key;
      }
    },
  };
}
