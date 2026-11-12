"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, MailCheck, RefreshCw } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";

type Item = {
 id:string; kind:"contact"|"sponsorship"|"signed_form";
 subject:string;recipient_email:string;status:string;attempts:number;
 last_error:string|null;created_at:string;accepted_at:string|null;delivered_at:string|null;
};
type Monitor={provider_configured:boolean;items:Item[];warning:string|null};
export default function NotificationMonitor(){
 const [data,setData]=useState<Monitor|null>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState("");
 const load=useCallback(async()=>{
  try{setData(await authedFetch<Monitor>(endpoints.notificationDispatch));setError("");}
  catch(e){setError(e instanceof Error?e.message:"Unable to load notification records.");}
 },[]);
 useEffect(()=>{void load();},[load]);
 async function retry(id:string){
  if(!data?.provider_configured)return;
  setBusy(id);setError("");
  try{
   const result=await authedFetch<{status:string;error?:string}>(endpoints.notificationDispatch,{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})
   });
   if(result.status==="failed")setError("Provider rejected the attempt; review the updated status and retry only after fixing the issue.");
   await load();
  }catch(e){setError(e instanceof Error?e.message:"Could not retry notification.");}
  finally{setBusy("");}
 }
 const count=(s:string)=>data?.items.filter(x=>x.status===s).length||0;
 const blocked=count("queued")+count("needs_setup")+count("failed");
 return <div className="min-h-screen bg-neutral-100">
  <PortalHeader title="Email Notification Monitor" isAdmin/>
  <main id="portal-main" className="container py-8">
   <p className="text-xs font-black uppercase tracking-[.15em] text-red-600">Private · Management MFA</p>
   <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Notification Delivery</h1>
   <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-600">
    Tracks contact, sponsorship and parent form emails from submission through provider acceptance and delivery.
    <strong> Provider accepted does not mean the recipient opened or received the message.</strong>
   </p>
   {error?<p role="alert" className="notice mt-5 text-sm">{error}</p>:null}
   {!data?<p className="card mt-6 p-5">Loading secure notification records…</p>:<>
    {!data.provider_configured?<div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
     <AlertTriangle className="shrink-0" size={20}/>
     <div><strong>Outbound email not configured.</strong>
      <p className="mt-1">Connect Resend, verify caledonunited2018girls.ca and set server-only RESEND_API_KEY and NOTIFICATION_FROM secrets.
      Saved submissions remain in the queue and are not lost. A manager can retry after the provider is ready.</p></div>
    </div>:null}
    <div className="mt-6 grid gap-4 sm:grid-cols-4">
     {[
      ["Saved / blocked",blocked],
      ["Provider accepted",count("accepted")],
      ["Delivered",count("delivered")],
      ["Bounced",count("bounced")]
     ].map(([label,value])=><div key={label} className="card p-5">
      <p className="text-3xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-600">{label}</p>
     </div>)}
    </div>
    <section className="card mt-7 overflow-hidden">
     <div className="flex flex-wrap items-center justify-between gap-3 p-5">
      <div><h2 className="text-xl font-black uppercase">Latest Notification Attempts</h2>
       <p className="mt-1 text-xs text-neutral-500">Most recent 100 entries; no medical or photo information is emailed.</p>
      </div>
      <button type="button" className="btn btn-light" onClick={()=>void load()}><RefreshCw size={17}/> Refresh</button>
     </div>
     <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
       <thead className="bg-neutral-100 text-xs uppercase"><tr>
        <th className="p-3">Event / Date</th><th className="p-3">Recipient</th>
        <th className="p-3">Status</th><th className="p-3">Attempts</th><th className="p-3">Action</th>
       </tr></thead>
       <tbody>{data.items.length?data.items.map(item=><tr className="border-t align-top" key={item.id}>
        <td className="p-3"><div className="font-bold">{item.subject}</div>
         <div className="mt-1 text-xs text-neutral-500">{new Date(item.created_at).toLocaleString()}</div></td>
        <td className="p-3">{item.recipient_email}</td>
        <td className="p-3"><span className="font-bold">{item.status.replace("_"," ")}</span>
         {item.last_error?<div className="mt-1 max-w-[300px] text-xs text-red-700">{item.last_error}</div>:null}</td>
        <td className="p-3">{item.attempts}</td>
        <td className="p-3">{["queued","needs_setup","failed"].includes(item.status)?
         <button className="btn btn-light !px-3 !py-2" type="button"
          disabled={!!busy||!data.provider_configured||item.attempts>=5}
          onClick={()=>void retry(item.id)}>{busy===item.id?"Retrying…":"Retry"}</button>:"—"}</td>
       </tr>):<tr><td colSpan={5} className="p-5 text-neutral-500">No new notifications have been recorded.</td></tr>}</tbody>
      </table>
     </div>
    </section>
    <section className="card mt-6 p-5">
     <h2 className="flex items-center gap-2 text-xl font-black uppercase"><MailCheck size={19}/> Other Delivery Services</h2>
     <p className="mt-3 text-sm leading-6 text-neutral-600">
      Parent invitations from Accounts & Invites use the Supabase Auth mail service. Its accepted response is not proof of inbox delivery.
      The team kit order uses Netlify Forms, which requires its own confirmed email notification recipient.
     </p>
     <p className="mt-3 text-sm text-neutral-600">Configure and confirm the kit notification recipient in Netlify → Forms → Submission notifications.
      Parent invite failures or manual links remain in <Link className="font-bold underline" href="/admin/accounts">Accounts & Invites</Link>.</p>
    </section>
   </>}
  </main>
 </div>;
}
