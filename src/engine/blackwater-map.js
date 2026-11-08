// Scenario-only topology: every edge is bidirectional. No teleporting enemies.
export const blackwaterRoutes=Object.freeze({
 'location-0':['location-1','location-5'],
 'location-1':['location-0','location-2','location-3','location-4'],
 'location-2':['location-1'],
 'location-3':['location-1'],
 'location-4':['location-1','location-6'],
 'location-5':['location-0','location-6'],
 'location-6':['location-4','location-5'],
});
export function nextEnemyLocation(from,target){
 if(!blackwaterRoutes[from]||!blackwaterRoutes[target]||from===target)return from;
 const queue=[from],visited=new Set([from]),previous=new Map();
 for(let i=0;i<queue.length;i++){
  const current=queue[i];
  for(const neighbor of blackwaterRoutes[current]){
   if(visited.has(neighbor))continue;
   visited.add(neighbor);previous.set(neighbor,current);queue.push(neighbor);
  }
 }
 if(!visited.has(target))return from;
 let step=target;
 while(previous.get(step)!==from)step=previous.get(step);
 return step;
}
export function moveEnemies(enemies,target){
 return enemies.map(enemy=>({...enemy,locationId:nextEnemyLocation(enemy.locationId,target)}));
}
