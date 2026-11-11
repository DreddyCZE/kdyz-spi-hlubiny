// Keep one native modal at a time and return keyboard focus to a visible control.
const openers=new WeakMap();
const installed=new WeakSet();
export function rememberDialogFocus(dialog,opener=document.activeElement){
 if(!dialog)return;
 openers.set(dialog,opener);
 if(installed.has(dialog))return;
 installed.add(dialog);
 dialog.addEventListener('close',()=>{
  const target=openers.get(dialog);
  const fallback=document.querySelector('.v3-location-actions button:not(:disabled):not([hidden])');
  (target?.isConnected&&target.getClientRects().length&&!target.disabled?target:fallback)?.focus({preventScroll:true});
 });
}
export function openDialog(dialog,opener=document.activeElement){
 if(dialog.open)return;
 for(const other of document.querySelectorAll('dialog[open]'))other.close();
 rememberDialogFocus(dialog,opener);
 dialog.showModal();
}
