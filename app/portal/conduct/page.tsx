"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, CheckCircle2, ClipboardSignature, Download, ShieldCheck } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { authedFetch, endpoints } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Player={id:string;first_name:string;last_name:string;jersey_number:number|null};
type Dashboard={players:Player[]};
type Template={id:string;form_key:string;version:number;description:string|null;schema_json:{document_sha256?:string}|null};
type Receipt={id:string;player_id:string;guardian_id:string;form_template_id:string;signature_name:string;signed_at:string;submitted_data:{player_signature_name?:string;document_sha256?:string}};
const pdf="/docs/caledon-soccer-grassroots-code-of-conduct-2026.pdf";
export default function ParentCodeOfConduct(){
 const router=useRouter();
 const [players,setPlayers]=useState<Player[]>([]);
 const [template,setTemplate]=useState<Template|null>(null);
 const [receipts,setReceipts]=useState<Receipt[]>([]);
 const [selected,setSelected]=useState("");
 const [parentName,setParentName]=useState("");
 const [playerSignature,setPlayerSignature]=useState("");
 const [parentAgreed,setParentAgreed]=useState(false);
 const [discussed,setDiscussed]=useState(false);
 const [playerSigned,setPlayerSigned]=useState(false);
 const [status,setStatus]=useState("Loading your linked players and previous acknowledgements…");
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);

 const refresh=useCallback(async()=>{
  const session=await supabase.auth.getSession();
  if(!session.data.session){router.replace("/login");return;}
  const [dashboardRes,guardiansRes,templateRes]=await Promise.all([
   authedFetch<Dashboard>(endpoints.parentDashboard),
   supabase.from("guardians").select("id,full_name").eq("user_id",session.data.session.user.id).maybeSingle(),
   supabase.from("form_templates").select("id,form_key,version,description,schema_json").eq("form_key","code_of_conduct").eq("active",true).order("version",{ascending:false}).limit(1).maybeSingle()
  ]);
  if(guardiansRes.error)throw guardiansRes.error;
  if(templateRes.error)throw templateRes.error;
  const form=templateRes.data as Template|null;
  setPlayers(dashboardRes.players||[]);
  setTemplate(form);
  if(guardiansRes.data?.full_name){const signedName=guardiansRes.data.full_name;setParentName(v=>v||signedName);}
  if(form&&guardiansRes.data?.id){
   const result=await supabase.from("form_submissions")
    .select("id,player_id,guardian_id,form_template_id,signature_name,signed_at,submitted_data")
    .eq("guardian_id",guardiansRes.data.id)
    .eq("form_template_id",form.id)
    .order("signed_at",{ascending:false});
   if(result.error)throw result.error;
   setReceipts((result.data||[]) as Receipt[]);
  }else setReceipts([]);
  setLoading(false);setStatus("");
 },[router]);

 useEffect(()=>{let active=true;refresh().catch(e=>{if(active){setLoading(false);setStatus(e instanceof Error?e.message:"Unable to load code of conduct.");}});return()=>{active=false;};},[refresh]);

 const selectedPlayer=players.find(x=>x.id===selected);
 const currentReceipts=useMemo(()=>receipts.filter(x=>x.player_id===selected),[receipts,selected]);
 async function sign(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!template||!selectedPlayer||!parentName.trim()||!playerSignature.trim()||!parentAgreed||!discussed||!playerSigned)return;
  setBusy(true);setStatus("");
  try{
   await authedFetch(endpoints.parentActions,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     action:"form.submit",
     input:{form_key:"code_of_conduct",player_id:selectedPlayer.id,signature_name:parentName.trim(),
      submitted_data:{guardian_accepts:true,player_rules_discussed:true,
       player_signed:true,player_signature_name:playerSignature.trim(),
       document_sha256:template.schema_json?.document_sha256}}
    })
   });
   setParentAgreed(false);setDiscussed(false);setPlayerSigned(false);setPlayerSignature("");
   await refresh();
   setStatus("Acknowledgement recorded. Your signature, player acknowledgement, document version and signing date are saved privately.");
  }catch(e){setStatus(e instanceof Error?e.message:"Unable to save acknowledgement.");}
  finally{setBusy(false);}
 }
 return <div className="min-h-screen bg-neutral-100">
  <PortalHeader title="Code of Conduct Sign-Off"/>
  <main className="container py-8" id="portal-main">
   <div className="text-xs font-black uppercase tracking-[.18em] text-red-600">Player Safety · Family Agreement</div>
   <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Code of Conduct</h1>
   <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-700">Each linked family should read the full Caledon Soccer Grassroots Player &amp; Parent Code of Conduct and complete a signed acknowledgement for each player. This is separate from photo or social-media permission.</p>
   <div className="mt-5 flex flex-wrap gap-3">
    <Link href="/conduct" className="btn btn-light"><BookOpenCheck size={18}/> Read Team Policy</Link>
    <a href={pdf} target="_blank" rel="noopener noreferrer" className="btn btn-light"><Download size={18}/> Original Code of Conduct PDF</a>
   </div>
   {status?<div role="status" className="notice mt-6 text-sm">{status}</div>:null}
   {loading?<div className="card mt-8 p-6">Loading signed records…</div>:!template?<div className="notice mt-8">An active approved Code of Conduct form has not been configured.</div>:players.length===0?<div className="notice mt-8">No player is linked to your account. Ask a manager to verify your family links before signing.</div>:
   <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
    <section className="card p-6">
     <div className="flex flex-wrap items-start justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xl font-black uppercase"><ClipboardSignature className="text-red-600"/> Family Acknowledgement</h2>
      <span className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-bold">Version {template.version}</span>
     </div>
     <p className="mt-3 text-sm text-neutral-600">We have read and agree to follow the Caledon Soccer Grassroots Player &amp; Parent Code of Conduct.</p>
     <form className="mt-6 grid gap-4" onSubmit={sign}>
      <label className="block"><span className="field-label">Player</span>
       <select className="field" value={selected} onChange={e=>setSelected(e.target.value)} required>
        <option value="">Select the player you are signing for</option>
        {players.map(p=><option value={p.id} key={p.id}>{p.first_name} {p.last_name}{p.jersey_number===null?"":" · #"+p.jersey_number}</option>)}
       </select>
      </label>
      {selectedPlayer?<p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">Team/Age Group: Caledon United FC · 2018 Girls · 2026–27</p>:null}
      <label className="block"><span className="field-label">Parent / guardian signature (type your full name)</span>
       <input className="field" value={parentName} onChange={e=>setParentName(e.target.value)} autoComplete="name" maxLength={160} required/>
      </label>
      <label className="block"><span className="field-label">Player acknowledgement / typed signature</span>
       <input className="field" value={playerSignature} onChange={e=>setPlayerSignature(e.target.value)} placeholder="Have your child type or dictate their name" maxLength={160} required/>
       <span className="mt-1 block text-xs text-neutral-500">Complete this together with the player. Do not type a child’s name without discussing the rules with them.</span>
      </label>
      <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
       <input type="checkbox" className="mt-1" checked={parentAgreed} onChange={e=>setParentAgreed(e.target.checked)} required/>
       I have read the full Code of Conduct and agree to follow the parent/guardian rules.
      </label>
      <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
       <input type="checkbox" className="mt-1" checked={discussed} onChange={e=>setDiscussed(e.target.checked)} required/>
       I have reviewed the player rules, anti-bullying expectations and reporting process with my child.
      </label>
      <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
       <input type="checkbox" className="mt-1" checked={playerSigned} onChange={e=>setPlayerSigned(e.target.checked)} required/>
       My child participated and typed or dictated the player acknowledgement above.
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy||!selected||!template||!parentAgreed||!discussed||!playerSigned||!playerSignature.trim()||!parentName.trim()}>
       <ClipboardSignature size={18}/>{busy?"Saving Sign-Off…":"Sign and Save Acknowledgement"}
      </button>
      <p className="text-xs leading-5 text-neutral-600">Your electronic acknowledgement is recorded with your signed-in guardian account, linked player, document version and server signing time. It does not authorize public photos or Instagram publication.</p>
     </form>
    </section>
    <aside className="card p-6">
     <h2 className="flex items-center gap-2 text-xl font-black uppercase"><ShieldCheck className="text-red-600"/> My Signature Records</h2>
     <p className="mt-2 text-sm text-neutral-600">Records for the currently signed-in guardian and the active document version.</p>
     <div className="mt-5 grid gap-3">
      {players.map(p=>{
       const signed=receipts.find(x=>x.player_id===p.id);
       return <button key={p.id} type="button" onClick={()=>setSelected(p.id)} className={"rounded-xl border p-4 text-left text-sm transition hover:border-red-300 "+(selected===p.id?"border-red-400 bg-red-50":"border-neutral-200")}>
        <div className="flex items-center justify-between gap-2"><span className="font-black">{p.first_name} {p.last_name}</span>
         <span className={"font-bold "+(signed?"text-green-700":"text-amber-700")}>{signed?"Signed":"Pending"}</span></div>
        {signed?<p className="mt-2 text-xs text-neutral-600"><CheckCircle2 className="mr-1 inline text-green-700" size={14}/>{new Date(signed.signed_at).toLocaleString()} · {signed.signature_name}</p>:null}
       </button>;
      })}
     </div>
     {selected&&currentReceipts.length>0?<div className="mt-5 border-t pt-4">
      <h3 className="text-xs font-black uppercase tracking-wide">Signature history for selected player</h3>
      <ul className="mt-3 space-y-2">{currentReceipts.map(r=><li key={r.id} className="text-xs leading-5 text-neutral-600">
       Signed by {r.signature_name} · {new Date(r.signed_at).toLocaleString()} · Version {template.version}
      </li>)}</ul>
     </div>:null}
    </aside>
   </div>}
  </main>
 </div>;
}
