"use client";
import {RosterAvatar} from "./RosterAvatar";
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {getRoster,RosterPlayer,RosterSnapshot,rosterPhoto} from '@/lib/roster-api';
import {supabase} from '@/lib/supabase';
import {teamSquad} from '@/lib/team-squad';
import {PlayerKitCard} from './PlayerKitCard';
import {InteractiveField} from './InteractiveField';
import {RosterPlayerEditor} from './RosterPlayerEditor';
export function RosterProfiles(){
 const [data,setData]=useState<RosterSnapshot|null>(null);const [error,setError]=useState('');const [editor,setEditor]=useState<RosterPlayer|null>(null);
 async function refresh(){try{const user=await supabase.auth.getUser();let snapshot=await getRoster(false);if(user.data.user){try{snapshot=await getRoster(true);}catch{/* Public roster remains available; private controls require verified access. */}}setData(snapshot);setError('');}catch(err){setError(err instanceof Error?err.message:'Unable to load roster');}}
 useEffect(()=>{void refresh();const timer=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},15000);const onFocus=()=>void refresh();window.addEventListener('focus',onFocus);const {data:auth}=supabase.auth.onAuthStateChange(()=>{setData(null);setTimeout(()=>void refresh(),0);});return()=>{clearInterval(timer);window.removeEventListener('focus',onFocus);auth.subscription.unsubscribe();};},[]);
 const players=data?.players.filter(p=>p.active)??[];
 const squad=teamSquad.map(member=>({member,player:players.find(p=>p.id===member.recordId||p.name===member.name)}));
 return <><section aria-labelledby="squad-title"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="squad-title" className="text-2xl font-black uppercase">Meet the Squad</h2>{data?.manager?<Link className="btn btn-outline" href="/admin/players">Manage Roster</Link>:null}</div><p className="mb-5 text-sm text-neutral-600">Our U9 girls play 5v5 and learn together. Hover over a player to see the white away kit, or use the Home and Away buttons on any device. Illustrations are generic; approved portraits appear separately.</p>{error?<div role="alert" className="notice">{error}<button className="ml-3 underline" onClick={()=>void refresh()}>Retry</button></div>:null}<div className="grid grid-cols-2 gap-4 md:grid-cols-3">{squad.map(({member,player})=><div key={member.recordId} className="min-w-0"><PlayerKitCard name={player?.name||member.name} number={player?player.number:member.number}/>{player?.photo_id?<div className="mt-3 flex items-center gap-3"><RosterAvatar id={player.photo_id} name={player.name} className="h-14 w-14 rounded-full object-cover"/><span className="text-xs text-neutral-600">Approved roster portrait</span></div>:null}<p className="mt-2 text-sm text-neutral-600">{player?.position||'Positions rotating'}</p>{player?.can_edit?<button className="btn btn-outline mt-2 w-full" onClick={()=>setEditor(player)}>{data?.manager?'Edit Player':'Edit My Player'}</button>:null}</div>)}</div><Link href="/portal/players" className="btn btn-outline mt-5">My Players</Link></section><InteractiveField players={players.filter(p=>p.public_visible&&p.name_consent)} formation={data?.formation.name||'1-2-1-1'} showNames={data?.formation.show_names}/>{editor&&data?<RosterPlayerEditor player={editor} manager={data.manager} onClose={()=>setEditor(null)} onSaved={()=>void refresh()}/>:null}</>;
}
