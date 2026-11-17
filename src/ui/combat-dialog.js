// Cosmetic modal lifecycle only; closing the view never resolves a combat action.
export function createCombatDialog(region) {
  const home=document.createElement('div');
  region.before(home);home.append(region);
  const reopen=document.createElement('button');
  reopen.type='button';reopen.textContent='Pokračovat v souboji';reopen.hidden=true;
  home.before(reopen);
  const dialog=document.createElement('dialog');
  dialog.id='combatDialog';dialog.className='combat-dialog';
  dialog.setAttribute('aria-labelledby','combatDialogTitle');
  const title=document.createElement('h2');title.id='combatDialogTitle';title.textContent='Taktický souboj';
  const close=document.createElement('button');close.type='button';close.textContent='Zpět ke stolu';
  const hint=document.createElement('p');hint.className='combat-view-hint';
  hint.textContent='Zavření pouze skryje souboj. Pokračuj tlačítkem Pokračovat v souboji; únik vyhodnotí až hod kostkami.';
  dialog.append(title,close,hint);document.body.append(dialog);
  let active=false,dismissed=false;
  const open=()=>{dismissed=false;dialog.showModal();(region.querySelector('button:not(:disabled)')||close).focus();};
  reopen.setAttribute('aria-haspopup','dialog');reopen.setAttribute('aria-controls',dialog.id);
  reopen.onclick=open;
  close.onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{
    if(active){dismissed=true;reopen.focus({preventScroll:true});}
  });
  return {
    render(isActive,moveFocus) {
      const wasActive=active;active=isActive;reopen.hidden=!active;
      if(active){
        dialog.append(region);
        if(!wasActive)dismissed=false;
        if(!dialog.open&&!dismissed)open();
        else if(dialog.open&&moveFocus){
          (region.querySelector(`[data-combat-move="${moveFocus}"]:not(:disabled)` )||close).focus({preventScroll:true});
        }
      }else{
        if(dialog.open)dialog.close();
        home.append(region);dismissed=false;
        if(wasActive)document.getElementById('cardTitle').focus({preventScroll:true});
      }
    },
  };
}
