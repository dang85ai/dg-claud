export type FieldSlot={id:string;label:string;x:number;y:number};
export const formations:{name:string;size:number;rows:string[][]}[];
export function formationSlots(name:string):FieldSlot[];
export function placePlayer(assignments:Record<string,string>,playerId:string,slot:string):Record<string,string>;
