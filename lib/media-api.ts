import {authedFetch,publicFetch} from '@/lib/api';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,supabase} from '@/lib/supabase';
export const mediaEndpoint=SUPABASE_URL+'/functions/v1/media-library';
export type MediaActor={id:string;role:'parent'|'admin';admin:boolean};
export type Album={id:string;title:string;description:string;created_by:string;created_at:string;updated_at:string;event_date:string|null;event_id:string|null;visibility:'private'|'parents'|'shared'|'public';allow_contributions:boolean;cover_media_id:string|null;cover_id?:string|null;photo_count?:number;owner_name?:string;can_edit?:boolean;can_upload?:boolean;sort_mode:string};
export type Photo={id:string;album_id:string|null;uploader_id:string;caption:string|null;tags:string[];filename:string;status:string;created_at:string;taken_at:string|null;position:number;can_edit:boolean};
export async function mediaRequest<T>(path:string, signedIn:boolean, init?:RequestInit):Promise<T>{return (signedIn?authedFetch<T>:publicFetch<T>)(mediaEndpoint+path,init);}
export async function mediaWrite<T>(path:string,method:string,body?:unknown):Promise<T>{return mediaRequest<T>(path,true,{method,...(body!==undefined?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});}
export async function mediaImage(id:string,thumbnail=false,download=false){
 const {data}=await supabase.auth.getSession();
 const response=await fetch(mediaEndpoint+'/photos/'+encodeURIComponent(id)+'/image?thumbnail='+(thumbnail?'1':'0')+'&download='+(download?'1':'0'),{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,...(data.session?{Authorization:'Bearer '+data.session.access_token}:{})},cache:'no-store'});
 if(!response.ok)throw new Error('This photo is no longer available or access has changed.');
 const blob=await response.blob();if(!blob.type.startsWith('image/')||!blob.size)throw new Error('The photo could not be opened.');return URL.createObjectURL(blob);
}
