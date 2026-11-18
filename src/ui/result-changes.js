// Describe actual committed changes, independent of narrative and effect definitions.
export function resultChanges(before,after){
  const changes=[];
  for(const [stat,label] of [['hp','HP'],['san','SAN'],['ap','AP'],['threat','Hrozba']]){
    const delta=after[stat]-before[stat];
    if(delta)changes.push(`${delta>0?'+':'−'}${Math.abs(delta)} ${label}`);
  }
  for(const [key,label] of [['evidence','Nová stopa'],['knowledge','Nová znalost'],['inventory','Nová výbava']]){
    const count=after[key].filter(id=>!before[key].includes(id)).length;
    if(count)changes.push(label+(count>1?' · '+count:''));
  }
  return changes;
}
export function createResultReceipt(storage,key){
  const identity=state=>JSON.stringify([state.revision,state.result]);
  return {
    record(before,after){
      const receipt={identity:identity(after),changes:resultChanges(before,after)};
      try{storage?.setItem(key,JSON.stringify(receipt));}catch{/* Optional UI cache. */}
      return receipt;
    },
    read(state){
      try{const v=JSON.parse(storage?.getItem(key)||'null');return v?.identity===identity(state)&&Array.isArray(v.changes)&&v.changes.length<=12&&v.changes.every(s=>typeof s==='string'&&s.length<100)?v:null;}catch{return null;}
    },
    clear(){try{storage?.removeItem(key);}catch{/* No game state depends on this cache. */}},
  };
}
