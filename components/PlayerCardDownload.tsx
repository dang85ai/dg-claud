"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { endpoints } from "@/lib/api";
import { SUPABASE_PUBLISHABLE_KEY, supabase } from "@/lib/supabase";

type CardPlayer = { name:string;number:number|null;position:string|null;photo_id:string|null;photo_consent:boolean;can_edit:boolean };
type Kit = "home"|"away";
function imageFrom(src:string):Promise<HTMLImageElement>{
 return new Promise((resolve,reject)=>{
  const image=new window.Image();
  image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Card artwork could not be loaded."));
  image.src=src;
 });
}
function cover(ctx:CanvasRenderingContext2D, image:HTMLImageElement,x:number,y:number,w:number,h:number){
 const ratio=Math.max(w/image.naturalWidth,h/image.naturalHeight);
 const dw=image.naturalWidth*ratio,dh=image.naturalHeight*ratio;
 ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function fitName(ctx:CanvasRenderingContext2D,text:string,maxW:number){
 let size=72;do{ctx.font="900 "+size+"px Arial, sans-serif";if(ctx.measureText(text).width<=maxW)break;size-=3;}while(size>32);
}
async function approvedPhoto(id:string):Promise<HTMLImageElement|null>{
 try{
  const {data}=await supabase.auth.getSession();
  if(!data.session)return null;
  const response=await fetch(endpoints.rosterApi+"?photo="+encodeURIComponent(id)+"&private=true",{
   headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+data.session.access_token},cache:"no-store"
  });
  if(!response.ok)return null;
  const blob=await response.blob();
  if(!blob.type.startsWith("image/"))return null;
  const url=URL.createObjectURL(blob);
  try{return await imageFrom(url);}finally{URL.revokeObjectURL(url);}
 }catch{return null;}
}
/** Download is only offered to authenticated managers or an approved linked guardian.
 * The server validates individual portrait access; private URLs are not embedded in files. */
export function PlayerCardDownload({player,kit}:{player:CardPlayer;kit:Kit}){
 const [busy,setBusy]=useState(false),[status,setStatus]=useState("");
 async function download(){
  if(busy||!player.can_edit)return;
  setBusy(true);setStatus("Preparing your private player card…");
  try{
   const canvas=document.createElement("canvas");canvas.width=900;canvas.height=1200;
   const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image export is unavailable in this browser.");
   const dark="#0B0D12",accent=kit==="home"?"#D71930":"#E5E7EB";
   ctx.fillStyle=dark;ctx.fillRect(0,0,900,1200);
   ctx.fillStyle=accent;ctx.fillRect(0,0,900,22);
   ctx.fillStyle="#fff";ctx.font="900 38px Arial, sans-serif";ctx.textAlign="center";
   ctx.fillText("CALEDON UNITED FC",450,90);
   ctx.font="700 24px Arial, sans-serif";ctx.fillStyle="#D1D5DB";
   ctx.fillText("2018 GIRLS  •  2026–27 WINTER LEAGUE",450,130);
   const art=await imageFrom(kit==="home"?"/roster/home-jersey-2026.webp":"/roster/away-jersey-2026.webp");
   ctx.save();ctx.beginPath();ctx.roundRect(45,163,810,745,30);ctx.clip();cover(ctx,art,45,163,810,745);ctx.restore();
   if(player.photo_id&&player.photo_consent){
    const portrait=await approvedPhoto(player.photo_id);
    if(portrait){
     ctx.save();ctx.beginPath();ctx.arc(725,770,100,0,2*Math.PI);ctx.clip();cover(ctx,portrait,625,670,200,200);ctx.restore();
     ctx.beginPath();ctx.arc(725,770,101,0,2*Math.PI);ctx.lineWidth=8;ctx.strokeStyle="#fff";ctx.stroke();
    }
   }
   ctx.fillStyle=accent;ctx.fillRect(45,930,810,6);
   ctx.fillStyle="#fff";fitName(ctx,player.name.toUpperCase(),790);
   ctx.fillText(player.name.toUpperCase(),450,1024);
   ctx.font="900 54px Arial, sans-serif";ctx.fillText(player.number===null?"NUMBER PENDING":"#"+String(player.number),450,1093);
   ctx.font="700 22px Arial, sans-serif";ctx.fillStyle="#BFC2C9";
   ctx.fillText((player.position||"ROTATING POSITIONS").toUpperCase()+"   •   "+(kit==="home"?"HOME":"AWAY")+" KIT",450,1150);
   const output=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/png"));
   if(!output)throw new Error("The player card could not be exported.");
   const url=URL.createObjectURL(output),a=document.createElement("a");
   try{
    a.href=url;a.download="CUFC-"+player.name.replace(/[^A-Za-z0-9_-]/g,"-")+"-"+kit+"-2026-27.png";
    a.style.display="none";document.body.appendChild(a);a.click();a.remove();
   }finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}
   setStatus("Download prepared.");
  }catch(e){setStatus(e instanceof Error?e.message:"Unable to create card.");}
  finally{setBusy(false);}
 }
 return <div className="border-t border-neutral-200 px-5 py-3">
  <button type="button" disabled={busy||!player.can_edit} onClick={()=>void download()}
   className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-black uppercase text-neutral-900 hover:border-red-400 disabled:opacity-60">
   <Download size={16} aria-hidden="true"/>{busy?"Preparing…":"Download "+(kit==="home"?"Home":"Away")+" Player Card"}
  </button>
  {status?<p role="status" className="mt-2 text-xs text-neutral-600">{status}</p>:null}
 </div>;
}
