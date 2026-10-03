"use client";
import {useEffect,useState} from 'react';
import {rosterEndpoint,rosterPhoto} from '@/lib/roster-api';
import {supabase,SUPABASE_PUBLISHABLE_KEY} from '@/lib/supabase';
export function RosterAvatar({id,name,className}:{id:string;name?:string;className?:string}){
 const [url,setUrl]=useState('');
 useEffect(()=>{let alive=true;let objectUrl='';void(async()=>{const {data}=await supabase.auth.getSession();const response=await fetch(data.session?rosterEndpoint+'?private=true&photo='+encodeURIComponent(id):rosterPhoto(id),{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,...(data.session?{Authorization:'Bearer '+data.session.access_token}:{})},cache:'no-store'});if(!response.ok)return;const blob=await response.blob();if(!blob.type.startsWith('image/'))return;objectUrl=URL.createObjectURL(blob);if(alive)setUrl(objectUrl);else URL.revokeObjectURL(objectUrl);})().catch(()=>{});return()=>{alive=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};},[id]);
 return url?<img src={url} alt={name?name+' approved roster portrait':''} draggable={false} className={className}/>:<span className={className+' inline-flex items-center justify-center bg-red-50 text-neutral-800'} aria-label="Portrait unavailable">⚽</span>;
}
