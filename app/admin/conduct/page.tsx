"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, Download, ShieldCheck } from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { supabase } from "@/lib/supabase";
type Player={id:string;first_name:string;last_name:string;jersey_number:number|null;active:boolean};
type FormTemplate={id:string;form_key:string;version:number};
type Receipt={id:string;player_id:string;guardian_id:string;form_template_id:string;signature_name:string;signed_at:string;submitted_data:{player_signature_name?:string;document_sha256?:string;guardian_accepts?:boolean;player_rules_discussed?:boolean}};
export default function ConductManagement(){
 const router=useRouter();
 const [players,setPlayers]=useState<Player[]>([]);
 const [receipts,setReceipts]=useState<Receipt[]>([]);
 const [template,setTemplate]=useState<FormTemplate|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{let live=true;(async()=>{
  const user=await supabase.auth.getUser();
  if(user.error||!user.data.user){router.replace("/login");return;}
  const [roles,aal]=await Promise.all([
   supabase.from("user_roles").select("role").eq("user_id",user.data.user.id),
   supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  ]);
  if(roles.error)throw roles.error;
  if(!roles.data?.some(r=>r.role==="admin"||r.role==="manager")){router.replace("/portal");return;}
  if(aal.error||aal.data.currentLevel!=="aal2"){router.replace("/mfa");return;}
  const form=await supabase.from("form_templates").select("id,form_key,version").eq("form_key","code_of_conduct").eq("active",true).order("version",{ascending:false}).limit(1).maybeSingle();
  if(form.error)throw form.error;
  const [playerResult,submissions]=await Promise.all([
   supabase.from("players").select("id,first_name,last_name,jersey_number,active").eq("active",true).order("first_name"),
   form.data?supabase.from("form_submissions")
     .select("id,player_id,guardian_id,form_template_id,signature_name,signed_at,submitted_data")
     .eq("form_template_id",form.data.id).order("signed_at",{ascending:false})
    :Promise.resolve({data:[],error:null})
  ]);
  if(playerResult.error)throw playerResult.error;
  if(submissions.error)throw submissions.error;
  if(live){setPlayers(playerResult.data||[]);setTemplate(form.data||null);setReceipts((submissions.data||[]) as Receipt[]);setLoading(false);}
 })().catch(e=>{if(live){setError(e instanceof Error?e.message:"Unable to load acknowledgements.");setLoading(false);}});return()=>{live=false;};},[router]);
 const signedPlayers=useMemo(()=>new Set(receipts.map(x=>x.player_id)),[receipts]);
 function csv(){
  if(!template)return;
  const columns=["Player","Jersey","Guardian Signature","Player Signature","Signed At (UTC)","Document Version","Document SHA-256","Receipt ID"];
  const byId=new Map(players.map(p=>[p.id,p]));
  const vals=receipts.map(r=>{
   const p=byId.get(r.player_id);
   return [p?p.first_name+" "+p.last_name:"Unknown linked player",p?.jersey_number??"",
    r.signature_name,r.submitted_data?.player_signature_name||"",r.signed_at,
    template.version,r.submitted_data?.document_sha256||"",r.id];
  });
  const escape=(value:unknown)=>'"'+String(value??"").replace(/"/g,'""')+'"';
  const content=[columns,...vals].map(row=>row.map(escape).join(",")).join("\r\n");
  const blob=new Blob(["\ufeff",content],{type:"text/csv;charset=utf-8"});
  const link=document.createElement("a"),url=URL.createObjectURL(blob);
  link.href=url;link.download="CUFC-code-of-conduct-acknowledgements-v"+template.version+".csv";
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <div className="min-h-screen bg-neutral-100">
  <PortalHeader title="Conduct Acknowledgements" isAdmin/>
  <main id="portal-main" className="container py-8">
   <p className="text-xs font-black uppercase tracking-[.18em] text-red-600">Manager Review · MFA Required</p>
   <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Code of Conduct Sign-Offs</h1>
   <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-600">Review signed acknowledgements without exposing private contact details. An entry confirms that the listed guardian acknowledged the current document for the player; it does not imply every guardian has signed.</p>
   <div className="mt-5 flex flex-wrap gap-3"><Link href="/conduct" className="btn btn-light"><ClipboardCheck size={18}/> Read Policy</Link>
    <a className="btn btn-light" href="/docs/caledon-soccer-grassroots-code-of-conduct-2026.pdf" target="_blank" rel="noopener noreferrer">Original PDF</a></div>
   {error?<div className="notice mt-6" role="alert">{error}</div>:null}
   {loading?<div className="card mt-8 p-6">Checking MFA and loading player acknowledgements…</div>:!error&&!template?<div className="notice mt-8">No current Code of Conduct template is active.</div>:!error&&template?<>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
     <div className="card p-5"><p className="text-3xl font-black tabular-nums">{players.length}</p><p className="mt-1 text-xs font-black uppercase text-neutral-600">Active players</p></div>
     <div className="card p-5"><p className="text-3xl font-black tabular-nums">{signedPlayers.size}</p><p className="mt-1 text-xs font-black uppercase text-neutral-600">Players with ≥1 sign-off</p></div>
     <div className="card p-5"><p className="text-3xl font-black tabular-nums">{receipts.length}</p><p className="mt-1 text-xs font-black uppercase text-neutral-600">Guardian sign-off records</p></div>
    </div>
    <section className="card mt-6 p-5">
     <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="text-xl font-black uppercase">Acknowledgement Register · Version {template.version}</h2>
       <p className="mt-1 text-sm text-neutral-600">Each record is stored with an authenticated guardian ID, signed name, player, document version and server timestamp.</p></div>
      <button className="btn btn-primary" type="button" onClick={csv} disabled={!receipts.length}><Download size={18}/> Export Signed Records CSV</button>
     </div>
     <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-left text-sm">
       <thead><tr className="border-b text-xs uppercase text-neutral-500"><th className="p-3">Player</th><th className="p-3">Status</th><th className="p-3">Guardian signature</th><th className="p-3">Player acknowledgement</th><th className="p-3">Latest signing date</th></tr></thead>
       <tbody>{players.map(p=>{
        const recent=receipts.find(r=>r.player_id===p.id);
        return <tr key={p.id} className="border-b align-top"><td className="p-3 font-bold">{p.first_name} {p.last_name}{p.jersey_number===null?"":" · #"+p.jersey_number}</td>
         <td className="p-3"><span className={recent?"font-bold text-green-700":"font-bold text-amber-700"}>{recent?"At least one guardian signed":"Pending"}</span></td>
         <td className="p-3">{recent?.signature_name||"—"}</td><td className="p-3">{recent?.submitted_data?.player_signature_name||"—"}</td>
         <td className="p-3">{recent?new Date(recent.signed_at).toLocaleString():"—"}</td></tr>;
       })}</tbody>
      </table>
     </div>
     <p className="mt-4 text-xs text-neutral-600"><ShieldCheck size={14} className="mr-1 inline"/> This register does not publish child or guardian signatures. Open the CSV only on a trusted device and handle it as confidential team administration data.</p>
    </section>
   </>:null}
  </main>
 </div>;
}
