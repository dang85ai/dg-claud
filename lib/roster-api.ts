import {authedFetch,publicFetch,endpoints} from '@/lib/api';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,supabase} from '@/lib/supabase';
export type RosterPlayer={id:string;name:string;number:number|null;position:string|null;active:boolean;slot:string|null;show_on_field:boolean;public_visible:boolean;can_edit:boolean;name_consent:boolean;photo_consent:boolean;photo_id:string|null;parents:{guardian_id:string;name:string;relationship:string|null}[]};
export type RosterRequest={id:string;requested_by:string;player_id:string|null;kind:'link'|'name';child_name:string;verification_info:string;relationship:string;status:string;requested_at:string};
export type RosterSnapshot={manager:boolean;players:RosterPlayer[];formation:{name:string;show_names:boolean};requests:RosterRequest[];photo_requests:{id:string;player_id:string;media_id:string;status:string}[]};
export const rosterEndpoint=SUPABASE_URL+'/functions/v1/roster-api';
export const rosterPhoto=(id:string)=>rosterEndpoint+'?photo='+encodeURIComponent(id);
export const getRoster=(privateView=false)=>privateView?authedFetch<RosterSnapshot>(rosterEndpoint+'?private=true'):publicFetch<RosterSnapshot>(rosterEndpoint);
export const rosterAction=(action:string,input:Record<string,unknown>)=>authedFetch<{ok:boolean}>(rosterEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,input})});
export async function uploadRosterPhoto(playerId:string,file:File){
 const {data}=await supabase.auth.getSession();if(!data.session)throw new Error('Please sign in');
 const form=new FormData();form.append('file',file);form.append('purpose','profile');form.append('player_id',playerId);form.append('caption','Roster portrait submitted for review');
 const response=await fetch(endpoints.mediaUpload,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+data.session.access_token},body:form});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Upload failed');return result;
}
