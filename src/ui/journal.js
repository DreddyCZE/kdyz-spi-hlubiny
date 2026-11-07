// Render only the public projection. Never evaluate conditions or mutate game state here.
export function createJournal(anchor, onDeduce) {
  const section=document.createElement('section'); section.className='panel detail-panel'; section.hidden=true; section.id='investigation-journal';
  const heading=document.createElement('h2'); heading.textContent='Deník důkazů';
  const evidence=document.createElement('div'); evidence.id='journal-evidence';
  const knowledgeHeading=document.createElement('h3'); knowledgeHeading.textContent='Znalosti';
  const knowledge=document.createElement('div'); knowledge.id='journal-knowledge';
  const deductionHeading=document.createElement('h3'); deductionHeading.textContent='Dedukce';
  const deductions=document.createElement('div'); deductions.id='journal-deductions';
  const available=document.createElement('div'); available.id='journal-available';
  const button=document.createElement('button'); button.textContent='Vyhodnotit důkazy'; button.id='deduce'; button.onclick=onDeduce;
  const message=document.createElement('p'); message.id='journal-status'; message.setAttribute('role','status');
  section.append(heading,evidence,knowledgeHeading,knowledge,deductionHeading,deductions,available,button,message); anchor.after(section);
  function list(target,entries,empty) {
    target.replaceChildren(...entries.map(entry=>{
      const p=document.createElement('p'),strong=document.createElement('strong'),detail=document.createElement('span');
      strong.textContent=entry.name;detail.textContent=' — '+entry.description;p.append(strong,detail);return p;
    }));
    if(!entries.length)target.textContent=empty;
  }
  return { render(view,disabled) {
    list(evidence,view.evidence,'Zatím nemáš zaznamenané důkazy.');
    list(knowledge,view.knowledge,'Zatím nemáš odvozené znalosti.');
    list(deductions,view.deductions,'Zatím nebyla vytvořena žádná dedukce.');
    list(available,view.available,'');
    button.disabled=disabled||!view.available.length;
    message.textContent=view.available.length?'Důkazy lze propojit. Vyhodnocení je zdarma.':'';
  }};
}
