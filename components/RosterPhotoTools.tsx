"use client";
import { useCallback, useEffect, useState } from "react";
import { PlayerPhotoCrop } from "@/components/PlayerPhotoCrop";
import { endpoints } from "@/lib/api";
import { supabase, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase";

type PhotoRequest = { media_id: string; id: string; player_id: string; status: string };

function useProtectedImage(url: string | null) {
 const [state,setState]=useState({src:"", loading:Boolean(url), error:""});
 useEffect(()=>{
  let active=true, objectUrl="";
  if(!url) { setState({src:"",loading:false,error:"No approved image linked."});return; }
  setState({src:"",loading:true,error:""});
  (async()=>{
   try {
    const session=await supabase.auth.getSession();
    if(!session.data.session)throw new Error("Please sign in.");
    const response=await fetch(url,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+session.data.session.access_token},cache:"no-store"});
    if(!response.ok)throw new Error("Protected image not available for this account.");
    const blob=await response.blob();
    if(!blob.type.startsWith("image/"))throw new Error("Invalid processed image.");
    objectUrl=URL.createObjectURL(blob);
    if(active)setState({src:objectUrl,loading:false,error:""});else URL.revokeObjectURL(objectUrl);
   }catch(e){if(active)setState({src:"",loading:false,error:e instanceof Error?e.message:"Unable to load image."});}
  })();
  return ()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[url]);
 return state;
}

export function PendingRosterPhotoReview({request,playerName,photoConsent,disabled,onReview}:{
 request:PhotoRequest; playerName:string;photoConsent:boolean; disabled:boolean;
 onReview:(decision:"approved"|"rejected",confirmed:boolean)=>void;
}){
 const [confirmed,setConfirmed]=useState(false);
 const image=useProtectedImage(request.media_id?endpoints.mediaLibrary+"/photos/"+encodeURIComponent(request.media_id)+"/image?thumbnail=1":null);
 return <div className="rounded-2xl border p-4">
  <h3 className="font-bold">{playerName} · Pending portrait</h3>
  <div className="mt-4 flex flex-wrap items-start gap-4">
   <div className="grid h-36 w-36 shrink-0 place-items-center overflow-hidden rounded-2xl bg-neutral-100">
    {image.src?<img src={image.src} alt={"Photo awaiting review for "+playerName} className="h-full w-full object-cover"/>:<span className="p-3 text-center text-xs text-neutral-600">{image.loading?"Loading private preview…":image.error}</span>}
   </div>
   <div className="min-w-52 flex-1">
    <p className="text-sm">Public profile and photo consent: <strong>{photoConsent?"Recorded":"Not recorded"}</strong></p>
    <p className="mt-2 text-xs text-neutral-600">Verify the player's identity and current guardian consent. You cannot approve a photo unless you inspect the processed preview.</p>
    <label className="mt-3 flex items-start gap-2 text-sm">
     <input type="checkbox" disabled={disabled||!photoConsent||!image.src} checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>
     I inspected the photo and verified the player, image and current public-profile and photo consent.
    </label>
    <div className="mt-4 flex flex-wrap gap-2">
     <button className="btn btn-primary" disabled={disabled||!photoConsent||!image.src||!confirmed} onClick={()=>onReview("approved",true)}>Approve Reviewed Photo</button>
     <button className="btn btn-light" disabled={disabled} onClick={()=>onReview("rejected",false)}>Reject</button>
    </div>
   </div>
  </div>
 </div>;
}
export function ApprovedRosterPhoto({id,name}:{id:string;name:string}){
 const image=useProtectedImage(id?endpoints.rosterApi+"?private=true&photo="+encodeURIComponent(id):null);
 return <div className="mt-3 flex items-center gap-3">
  <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border bg-neutral-100">{image.src?<img src={image.src} alt={"Approved photo of "+name} className="h-full w-full object-cover"/>:"⚽"}</span>
  <span className="text-xs text-neutral-600">{image.src?"Approved roster portrait":image.loading?"Loading private portrait…":"No portrait available"}</span>
 </div>;
}
export function ParentRosterPhotoUploader({playerId,playerName,consent,onUploaded}:{
 playerId:string;playerName:string;consent:boolean;onUploaded:()=>void;
}){
 const [photo,setPhoto]=useState<File|null>(null),[confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const onReady=useCallback((file:File|null)=>{setPhoto(file);setMessage("");},[]);
 async function upload(){
  if(!photo||!confirmed||!consent||busy)return;
  setBusy(true);setMessage("");
  try{
   const {data}=await supabase.auth.getSession();
   if(!data.session)throw new Error("Please sign in.");
   const body=new FormData();
   body.append("file",photo);body.append("purpose","profile");body.append("player_id",playerId);
   body.append("caption","Roster portrait submitted for manager review");
   const response=await fetch(endpoints.mediaUpload,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+data.session.access_token},body});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Upload failed.");
   setPhoto(null);setConfirmed(false);setMessage("Portrait submitted for private manager review. It is not published yet.");
   onUploaded();
  }catch(e){setMessage(e instanceof Error?e.message:"Unable to upload photo.");}
  finally{setBusy(false);}
 }
 if(!consent)return <p className="mt-3 text-xs text-neutral-600">Current guardian profile and photo consent is required before uploading a roster portrait.</p>;
 return <section className="mt-4 border-t pt-4" aria-label={"Roster portrait for "+playerName}>
  <h4 className="font-black uppercase">Roster Photo Upload</h4>
  <p className="mt-2 text-xs text-neutral-600">Crop your photo, preview it and submit for manager approval. Private image processing removes location metadata. JPEG, PNG or WebP up to 8 MB.</p>
  <PlayerPhotoCrop onReady={onReady}/>
  <label className="mt-3 flex items-start gap-2 text-sm">
   <input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={busy}/>
   I am this player's verified guardian and confirm current consent covers roster photo use on the team website.
  </label>
  <button className="btn btn-primary mt-3" type="button" onClick={()=>void upload()} disabled={!photo||!confirmed||busy}>{busy?"Uploading…":"Submit Cropped Portrait"}</button>
  {message?<p className="notice mt-3 text-sm" role="status">{message}</p>:null}
 </section>;
}
