export const formations = [
  {name:'1-2-1-1',size:5,rows:[['GK'],['LB','RB'],['CM'],['ST']]},
  {name:'1-2-2',size:5,rows:[['GK'],['LB','RB'],['LS','RS']]},
  {name:'1-3-2-1',size:7,rows:[['GK'],['LB','CB','RB'],['LM','RM'],['ST']]},
  {name:'1-2-3-1',size:7,rows:[['GK'],['LB','RB'],['LM','CM','RM'],['ST']]},
  {name:'1-3-3-2',size:9,rows:[['GK'],['LB','CB','RB'],['LM','CM','RM'],['LS','RS']]},
  {name:'1-4-3-1',size:9,rows:[['GK'],['LB','LCB','RCB','RB'],['LM','CM','RM'],['ST']]}
];
export function formationSlots(name){
 const formation=formations.find(f=>f.name===name)||formations[0];
 return formation.rows.flatMap((row,y)=>row.map((label,x)=>({id:label,label,x:100*(x+1)/(row.length+1),y:84-y*22})));
}
export function placePlayer(assignments,playerId,slot){
 const next={...assignments};const previous=Object.keys(next).find(key=>next[key]===playerId);const displaced=next[slot];
 if(previous)delete next[previous];
 if(displaced&&previous)next[previous]=displaced;
 next[slot]=playerId;return next;
}
