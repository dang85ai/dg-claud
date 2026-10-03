"use client";
import {RosterAvatar} from "./RosterAvatar";
import {useState} from 'react';
import {formationSlots} from '@/lib/roster-formations.mjs';
import {RosterPlayer,rosterPhoto} from '@/lib/roster-api';
export function InteractiveField({players,formation,showNames=true,editable=false,onAssign}:{players:RosterPlayer[];formation:string;showNames?:boolean;editable?:boolean;onAssign?:(playerId:string,slot:string)=>void}){
 const [selected,setSelected]=useState<RosterPlayer|null>(null);const [dragSlot,setDragSlot]=useState('');const slots=formationSlots(formation);
 return <section className="card mt-6 min-w-0 overflow-hidden p-4 sm:p-6" aria-labelledby="field-title">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-widest text-red-600">Every position, every teammate</div><h2 id="field-title" className="mt-1 text-2xl font-black uppercase">On the Field</h2></div><span className="rounded-full bg-green-100 px-3 py-2 text-sm font-bold text-green-900">{formation}</span></div>
  <p className="my-4 text-sm text-neutral-600">A shared team formation, not a match selection or ranking. Tap a player to see their role. Players rotate positions as they learn.</p>
  <div className="relative mx-auto aspect-[3/4] w-full max-w-xl overflow-hidden rounded-2xl border-4 border-green-950 bg-green-800" style={{backgroundImage:'repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 12.5%,transparent 12.5%,transparent 25%)'}}>
   <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-hidden="true"><g fill="none" stroke="#fff" strokeWidth="1.6" opacity=".8"><rect x="12" y="12" width="276" height="376"/><path d="M12 200H288"/><circle cx="150" cy="200" r="38"/><circle cx="150" cy="200" r="2" fill="white"/><path d="M70 12V75H230V12 M110 12V39H190V12 M70 388V325H230V388 M110 388V361H190V388 M125 12V3H175V12 M125 388V397H175V388"/><path d="M122 75Q150 102 178 75 M122 325Q150 298 178 325"/></g></svg>
   {slots.map(slot=>{const player=players.find(p=>p.slot===slot.id&&(editable||p.show_on_field));return <div key={slot.id} className={'absolute -translate-x-1/2 -translate-y-1/2 rounded-xl p-1 '+(dragSlot===slot.id?'bg-white/30 outline outline-2 outline-yellow-300':'')} style={{left:slot.x+'%',top:slot.y+'%',width:'28%',maxWidth:125}} onDragOver={editable?event=>{event.preventDefault();setDragSlot(slot.id);}:undefined} onDragLeave={()=>setDragSlot('')} onDrop={editable?event=>{event.preventDefault();const id=event.dataTransfer.getData('text/roster-player');if(players.some(p=>p.id===id))onAssign?.(id,slot.id);setDragSlot('');}:undefined}>
    <button type="button" className="mx-auto flex min-h-11 w-full flex-col items-center rounded-xl text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300" aria-label={player?`${player.name}, ${player.number===null?'number pending':'number '+player.number}, ${player.position||slot.label}`:`${slot.label}, empty position`} draggable={editable&&Boolean(player)} onDragStart={event=>{if(player)event.dataTransfer.setData('text/roster-player',player.id);}} onClick={()=>setSelected(player||null)} onMouseEnter={()=>{if(player)setSelected(player);}}>
     <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-green-950 shadow-lg sm:h-16 sm:w-16">{player?.photo_id?<RosterAvatar id={player.photo_id} className="h-full w-full object-cover"/>:<span className="text-sm font-black">{player?(player.number===null?'⚽':player.number):slot.label}</span>}</span>
     {player&&showNames?<span className="mt-1 max-w-full break-words rounded-md bg-green-950/90 px-1.5 py-1 text-center text-[10px] font-bold leading-tight sm:text-xs">{player.name}{player.number!==null?' · #'+player.number:''}</span>:null}
     <span className="mt-1 text-[10px] font-bold">{slot.label}</span>
    </button>
   </div>;})}
  </div>
  <div className="mt-4 min-h-12 rounded-xl bg-green-50 p-3 text-sm text-green-950" role="status">{selected?<><strong>{selected.name}</strong> · {selected.number===null?'Number pending':'#'+selected.number} · {selected.position||'Position developing'} <button className="ml-3 underline" onClick={()=>setSelected(null)}>Close</button></>:'Choose a player marker to learn more. Empty markers are positions awaiting an assignment.'}</div>
  {players.some(p=>!p.slot&&p.active)?<p className="mt-3 break-words text-sm text-neutral-600"><strong>Rotating squad:</strong> {players.filter(p=>!p.slot&&p.active).map(p=>p.name).join(', ')}. Everyone is part of the team.</p>:null}
 </section>;
}
