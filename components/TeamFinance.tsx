"use client";

import Link from "next/link";
import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {PortalHeader} from "@/components/PortalHeader";
import {supabase} from "@/lib/supabase";
import {BudgetLine,Transaction,FinanceDocument,FinanceSettings,budgetSpent,cashMovement,csvCell,financeTotals,kindLabels,money,parseCents,statementDifference} from "@/lib/team-finance";

type Snapshot={settings:FinanceSettings;lines:BudgetLine[];transactions:Transaction[];documents:FinanceDocument[]};
type Audit={id:number;table_name:string;record_id:string;operation:string;changed_at:string};
const dateLabel=(s:string)=>new Date(s+"T12:00:00").toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"});
const inputClass="field mt-1 w-full";
async function allRows(table:string,columns:string,order:string){
 let rows:unknown[]=[];
 for(let start=0;;start+=500){
  const result=await supabase.from(table).select(columns).order(order).order("id").range(start,start+499);
  if(result.error)throw new Error(result.error.message);
  rows=rows.concat(result.data??[]);if((result.data?.length??0)<500)return rows;
 }
}
const transactionColumns="id,occurred_on,kind,description,amount_cents,budget_line_id,created_at,voided_at,void_reason";
const documentColumns="id,kind,title,storage_path,transaction_id,period_start,period_end,closing_cents,shared,redaction_confirmed,created_at";

export function TeamFinance({admin=false}:{admin?:boolean}){
 const router=useRouter();
 const [data,setData]=useState<Snapshot|null>(null),[authorized,setAuthorized]=useState(false),[status,setStatus]=useState("Checking team access…"),[error,setError]=useState("");
 const [busy,setBusy]=useState(false),[audit,setAudit]=useState<Audit[]>([]),[reviewed,setReviewed]=useState<string[]>([]);
 const [filter,setFilter]=useState("all"),[search,setSearch]=useState(""),[kind,setKind]=useState<Transaction["kind"]>("expense");
 const [docKind,setDocKind]=useState("receipt"),[budgetId,setBudgetId]=useState(""),[budgetAmount,setBudgetAmount]=useState("");
 const transactionId=useRef<string|null>(null);
 const reload=useCallback(async()=>{
  const [settings,lines,transactions,documents]=await Promise.all([
   supabase.from("team_finance_settings").select("id,season,currency,source,opening_cents,opening_date,updated_at").eq("id","winter-2026-27").single(),
   allRows("team_budget_lines","id,category,label,quantity,unit_cents,planned_cents,sort_order,updated_at","sort_order"),
   allRows("team_transactions",transactionColumns,"occurred_on"),allRows("team_finance_documents",documentColumns,"created_at")
  ]);
  if(settings.error)throw new Error(settings.error.message);
  setData({settings:settings.data,lines:lines as BudgetLine[],transactions:transactions as Transaction[],documents:(documents as FinanceDocument[]).filter(d=>admin||(d.shared&&d.redaction_confirmed))});
  if(admin){const result=await supabase.from("team_finance_audit").select("id,table_name,record_id,operation,changed_at").order("changed_at",{ascending:false}).limit(30);if(result.error)throw new Error(result.error.message);setAudit(result.data??[]);}
 },[admin]);
 useEffect(()=>{
  let live=true;
  async function check(){
   setAuthorized(false);setData(null);
   const user=await supabase.auth.getUser();if(!live)return;
   if(user.error||!user.data.user){router.replace("/login");return;}
   const roles=await supabase.from("user_roles").select("role").eq("user_id",user.data.user.id);if(!live)return;
   if(roles.error){setError("Unable to verify team access. Refresh to retry.");return;}
   const manager=roles.data.some(r=>["manager","admin"].includes(r.role));
   if(admin&&!manager){router.replace("/portal/finances");return;}
   if(!manager&&!roles.data.some(r=>r.role==="parent_player")){setError("Team parent or manager access is required.");return;}
   if(manager){const aal=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();if(!live)return;if(aal.error||aal.data.currentLevel!=="aal2"){router.replace("/mfa");return;}}
   try{await reload();if(live){setAuthorized(true);setStatus("");setError("");}}catch(e){if(live)setError(e instanceof Error?e.message:"Unable to load team finances.");}
  }
  void check();
  const {data:listener}=supabase.auth.onAuthStateChange(event=>{if(event==="SIGNED_OUT"){setData(null);setAuthorized(false);router.replace("/login");}else if(event==="SIGNED_IN")setTimeout(()=>{if(live)void check();},0);});
  return()=>{live=false;listener.subscription.unsubscribe();};
 },[admin,reload,router]);

 async function run(task:()=>Promise<void>,message:string){
  if(busy)return;setBusy(true);setError("");setStatus("");
  try{await task();await reload();setStatus(message);}catch(e){setError(e instanceof Error?e.message:"Unable to save. Please retry.");}finally{setBusy(false);}
 }
 async function addTransaction(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const formElement=event.currentTarget;const f=new FormData(formElement);
  await run(async()=>{
   const amount=parseCents(String(f.get("amount")));if(amount<=0)throw new Error("Enter an amount greater than zero.");
   const row={id:transactionId.current??crypto.randomUUID(),occurred_on:String(f.get("date")),kind:String(f.get("kind")),description:String(f.get("description")).trim(),amount_cents:amount,budget_line_id:String(f.get("line"))||null};
   transactionId.current=row.id;
   const result=await supabase.from("team_transactions").insert(row);
   if(result.error){
    // Retry the same request safely after a lost network response.
    if(result.error.code!=="23505")throw new Error(result.error.message);
    const existing=await supabase.from("team_transactions").select(transactionColumns).eq("id",row.id).single();
    if(existing.error||Object.entries(row).some(([key,value])=>(existing.data as Record<string,unknown>)[key]!==value))throw new Error("Unable to confirm this transaction. Refresh before adding it again.");
   }
   transactionId.current=null;formElement.reset();setKind("expense");
  },"Transaction saved and visible to team parents.");
 }
 async function saveOpening(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const f=new FormData(event.currentTarget);
  await run(async()=>{const result=await supabase.from("team_finance_settings").update({opening_cents:parseCents(String(f.get("opening")),true),opening_date:String(f.get("opening_date"))}).eq("id","winter-2026-27").select("id").single();if(result.error)throw new Error(result.error.message);},"Opening balance saved. The ledger balance has been recalculated.");
 }
 async function saveBudget(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  await run(async()=>{const result=await supabase.from("team_budget_lines").update({planned_cents:parseCents(budgetAmount)}).eq("id",budgetId).select("id").single();if(result.error)throw new Error(result.error.message);},"Budget allocation updated. The change is recorded in the audit history.");
 }
 async function addDocument(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const formElement=event.currentTarget;const f=new FormData(formElement);
  await run(async()=>{
   const isStatement=f.get("kind")==="statement";
   const closing=isStatement?parseCents(String(f.get("closing")),true):null;
   if(isStatement&&String(f.get("period_end"))<String(f.get("period_start")))throw new Error("Statement end must be on or after its start.");
   const file=f.get("file") as File;if(!file?.size||file.size>10485760)throw new Error("Choose a PDF, JPG or PNG up to 10 MB.");
   const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());
   const extension=bytes[0]===37&&bytes[1]===80&&bytes[2]===68&&bytes[3]===70?"pdf":bytes[0]===255&&bytes[1]===216&&bytes[2]===255?"jpg":bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71?"png":null;
   if(!extension)throw new Error("The file must be a valid PDF, JPG or PNG.");
   let blob:Blob=file;
   if(extension!=="pdf"){
    const bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>40000000){bitmap.close();throw new Error("Please resize this image before uploading (maximum 40 megapixels).");}
    const canvas=document.createElement("canvas");canvas.width=bitmap.width;canvas.height=bitmap.height;const context=canvas.getContext("2d");if(!context){bitmap.close();throw new Error("Unable to process this image.");}context.drawImage(bitmap,0,0);bitmap.close();
    blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Unable to process image.")),extension==="jpg"?"image/jpeg":"image/png",0.92));
   }
   const user=await supabase.auth.getUser();if(user.error||!user.data.user)throw new Error("Please sign in again.");
   const path=user.data.user.id+"/"+crypto.randomUUID()+"."+extension;
   const upload=await supabase.storage.from("team-finance-private").upload(path,blob,{contentType:extension==="pdf"?"application/pdf":extension==="jpg"?"image/jpeg":"image/png",upsert:false});if(upload.error)throw new Error(upload.error.message);
   const row={kind:String(f.get("kind")),title:String(f.get("title")).trim(),storage_path:path,transaction_id:isStatement?null:String(f.get("transaction")),period_start:isStatement?String(f.get("period_start")):null,period_end:isStatement?String(f.get("period_end")):null,closing_cents:closing};
   const save=await supabase.from("team_finance_documents").insert(row);
   if(save.error){await supabase.storage.from("team-finance-private").remove([path]);throw new Error(save.error.message);}
   formElement.reset();setDocKind("receipt");
  },"Document uploaded privately. Review it below, then share it with parents.");
 }
 async function download(doc:FinanceDocument){
  setError("");try{const result=await supabase.storage.from("team-finance-private").download(doc.storage_path);if(result.error)throw new Error(result.error.message);const url=URL.createObjectURL(result.data);const a=document.createElement("a");a.href=url;a.download=doc.kind+"-"+doc.id+"."+doc.storage_path.split(".").pop();a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}catch(e){setError(e instanceof Error?e.message:"Document unavailable.");}
 }
 function exportLedger(){
  if(!data)return;
  const rows=[["Date","Type","Description","Budget item","Amount CAD","Cash movement CAD","Status","Void reason"],...data.transactions.map(t=>[t.occurred_on,kindLabels[t.kind],t.description,data.lines.find(l=>l.id===t.budget_line_id)?.label??"",(t.amount_cents/100).toFixed(2),(cashMovement(t)/100).toFixed(2),t.voided_at?"Voided":"Recorded",t.void_reason??""])];
  const url=URL.createObjectURL(new Blob(["\uFEFF"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="caledon-winter-2026-27-ledger.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
 }
 function printReport(){
  const details=Array.from(document.querySelectorAll<HTMLDetailsElement>("#budget details"));
  const closed=details.filter(d=>!d.open);closed.forEach(d=>{d.open=true;});window.print();closed.forEach(d=>{d.open=false;});
 }

 const totals=data?financeTotals(data.lines,data.transactions,data.settings):null;
 const displayed=data?.transactions.filter(t=>(filter==="all"||filter==="voided"?filter!=="voided"||!!t.voided_at:t.kind===filter&&!t.voided_at)&&`${t.description} ${data.lines.find(l=>l.id===t.budget_line_id)?.label??""}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.occurred_on.localeCompare(a.occurred_on)||b.created_at.localeCompare(a.created_at))??[];
 const categories=[...new Set(data?.lines.map(l=>l.category)??[])];
 return <div className="min-h-screen bg-neutral-100">
  <PortalHeader title="Team Budget & Accounts" isAdmin={admin}/>
  <main id="portal-main" className="container py-8">
   <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-wider text-red-600">Financial transparency · Winter 2026–27</div><h1 className="mt-2 text-3xl font-black md:text-4xl">Team Budget & Accounts</h1><p className="mt-3 max-w-3xl text-neutral-600">See the planned budget, money received, spending and supporting documents. All amounts are in Canadian dollars.</p></div>{authorized?<div className="no-print flex flex-wrap gap-2"><button className="btn btn-light" disabled={busy} onClick={()=>void run(async()=>{},"Records refreshed.")}>Refresh</button><button className="btn btn-dark" onClick={exportLedger}>Export ledger</button><button className="btn btn-light" onClick={printReport}>Print</button>{admin?<Link href="/portal/finances" className="btn btn-light">Parent view</Link>:null}</div>:null}</div>
   {error?<div role="alert" className="notice mt-5 text-red-700">{error}</div>:null}{status?<div role="status" className="notice mt-5">{status}</div>:null}
   {authorized&&data&&totals?<>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[{label:"Planned budget",value:money(totals.planned)},{label:"Money received (net)",value:money(totals.received)},{label:"Spending (net)",value:money(totals.spent)},{label:"Budget remaining",value:money(totals.remaining)},{label:"Recorded account balance",value:totals.balance===null?"Unconfirmed":money(totals.balance)}].map(card=><div className="card p-5" key={card.label}><div className="text-xs font-bold uppercase text-neutral-500">{card.label}</div><div className="mt-3 text-2xl font-black">{card.value}</div></div>)}</div>
    <p className="mt-4 text-sm text-neutral-600">{data.settings.opening_date?`Balance starts from ${money(Number(data.settings.opening_cents))} at the beginning of ${dateLabel(data.settings.opening_date)} and includes recorded movements from that date. It is not a live bank balance.`:"An opening bank balance has not been entered. Recorded transactions show money movement, but do not establish the bank balance."} Budget remaining is a spending allocation, not available cash. Refunds reduce the related spending or income; voided records are excluded from totals.</p>
    {data.transactions.length===0?<div className="notice mt-5">No actual transactions have been recorded yet. The imported workbook is a spending plan; it does not confirm payments or money held by the team.</div>:null}
    <nav aria-label="Finance sections" className="no-print mt-6 flex flex-wrap gap-3"><a className="btn btn-light" href="#budget">Budget</a><a className="btn btn-light" href="#transactions">Transactions</a><a className="btn btn-light" href="#documents">Receipts & Statements</a>{admin?<a className="btn btn-primary" href="#finance-manage">Add records</a>:null}</nav>

    <section id="budget" className="card mt-8 scroll-mt-28 p-5 md:p-6"><h2 className="text-2xl font-bold">Planned budget versus spending</h2><p className="mt-2 text-sm text-neutral-600">Imported from {data.settings.source}. The source estimates total {money(data.lines.reduce((sum,line)=>sum+Math.round(Number(line.quantity)*Number(line.unit_cents)),0))}, including a 5% contingency. Managers can revise allocations; changes are recorded. Imported quantities and unit estimates remain as source reference.</p>
     {categories.map(category=>{const lines=data.lines.filter(l=>l.category===category);return <details className="mt-4 rounded-xl border border-neutral-200" key={category}><summary className="cursor-pointer p-4 font-bold">{category} <span className="ml-2 text-sm font-normal text-neutral-500">{money(lines.reduce((s,l)=>s+Number(l.planned_cents),0))} planned</span></summary><div className="overflow-x-auto px-4 pb-4"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b"><th className="py-3">Item</th><th className="px-3">Source estimate</th><th className="px-3">Budget</th><th className="px-3">Spent</th><th className="px-3">Remaining</th></tr></thead><tbody>{lines.map(l=>{const spent=budgetSpent(l.id,data.transactions);return <tr className="border-b border-neutral-100" key={l.id}><th className="py-3 font-normal">{l.label}</th><td className="px-3 text-neutral-500">{l.quantity} × {money(l.unit_cents)}</td><td className="px-3 whitespace-nowrap">{money(l.planned_cents)}</td><td className="px-3 whitespace-nowrap">{money(spent)}</td><td className={"px-3 whitespace-nowrap "+(l.planned_cents-spent<0?"font-bold text-red-700":"")}>{money(l.planned_cents-spent)}</td></tr>;})}</tbody></table></div></details>;})}
    </section>

    <section id="transactions" className="card mt-8 scroll-mt-28 p-5 md:p-6"><h2 className="text-2xl font-bold">Transactions</h2><p className="mt-2 text-sm text-neutral-600">Team-level records are shared with parents. Individual family payment status remains in the existing private payments tools.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Find a transaction<input className={inputClass+" mt-2"} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Description or budget item"/></label><label className="text-sm font-bold">Show<select className={inputClass+" mt-2"} value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All records</option>{Object.entries(kindLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}<option value="voided">Voided records</option></select></label></div>
     <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b"><th className="py-3">Date</th><th className="px-3">Description</th><th className="px-3">Type</th><th className="px-3">Amount</th><th className="px-3">Receipts</th></tr></thead><tbody>{displayed.map(t=><tr className="border-b border-neutral-100 align-top" key={t.id}><td className="py-4 whitespace-nowrap">{dateLabel(t.occurred_on)}</td><td className="px-3 py-4"><div className="font-bold">{t.description}</div><div className="mt-1 text-xs text-neutral-500">{data.lines.find(l=>l.id===t.budget_line_id)?.label??"Team income"}</div>{t.voided_at?<p className="mt-2 text-red-700">Voided: {t.void_reason}</p>:null}</td><td className="px-3 py-4">{kindLabels[t.kind]}</td><td className="px-3 py-4 whitespace-nowrap">{money(t.amount_cents)}</td><td className="px-3 py-4">{data.documents.filter(d=>d.transaction_id===t.id&&d.shared).map(d=><button key={d.id} className="block py-1 font-bold text-red-700 underline" onClick={()=>void download(d)}>{d.title}</button>)}{!data.documents.some(d=>d.transaction_id===t.id&&d.shared)?<span className="text-neutral-500">No shared receipt</span>:null}</td></tr>)}</tbody></table></div>{displayed.length===0?<p className="py-5 text-neutral-500">No transactions match this view.</p>:null}
    </section>

    <section id="documents" className="mt-8 scroll-mt-28"><h2 className="text-2xl font-bold">Receipts & Statements</h2><p className="mt-2 text-sm text-neutral-600">Parents can download documents after management reviews them for sharing. Statements show the reported closing balance and any difference from the recorded ledger.</p><div className="mt-5 grid gap-4 lg:grid-cols-2">{data.documents.slice().reverse().map(d=>{const difference=statementDifference(d,data.transactions,data.settings);return <article className="card p-5" key={d.id}><div className="text-xs font-bold uppercase text-red-600">{d.kind} · {d.shared?"Shared with parents":"Manager draft"}</div><h3 className="mt-2 text-lg font-bold">{d.title}</h3>{d.kind==="statement"?<div className="mt-3 text-sm"><p>{dateLabel(d.period_start!)} – {dateLabel(d.period_end!)}</p><p className="mt-2">Statement closing balance: <strong>{money(Number(d.closing_cents))}</strong></p><p className="mt-1">{difference===null?"Ledger comparison needs an opening balance dated on or before the statement end.":difference===0?"Matches the recorded ledger at this date.":`Difference from ledger: ${money(difference)}. Management should reconcile this difference.`}</p></div>:<p className="mt-3 text-sm text-neutral-600">{data.transactions.find(t=>t.id===d.transaction_id)?.description??"Linked transaction"}</p>}<button className="btn btn-light mt-4" onClick={()=>void download(d)}>Download {d.kind}</button>{admin?<div className="mt-4 border-t pt-4">{!d.shared?<><label className="flex gap-2 text-sm"><input type="checkbox" checked={reviewed.includes(d.id)} onChange={e=>setReviewed(r=>e.target.checked?[...r,d.id]:r.filter(id=>id!==d.id))}/>I reviewed this document and removed account numbers, addresses and personal payment details.</label><button className="btn btn-primary mt-3" disabled={busy||!reviewed.includes(d.id)} onClick={()=>void run(async()=>{const r=await supabase.from("team_finance_documents").update({shared:true,redaction_confirmed:true}).eq("id",d.id).select("id").single();if(r.error)throw new Error(r.error.message);setReviewed(ids=>ids.filter(id=>id!==d.id));},"Document shared with parents.")}>Share with parents</button></>:<button className="btn btn-light" disabled={busy} onClick={()=>void run(async()=>{const r=await supabase.from("team_finance_documents").update({shared:false,redaction_confirmed:false}).eq("id",d.id).select("id").single();if(r.error)throw new Error(r.error.message);},"Document returned to manager-only view.")}>Stop sharing</button>}</div>:null}</article>;})}</div>{data.documents.length===0?<div className="card mt-4 p-5 text-neutral-500">No {admin?"documents uploaded":"receipts or statements shared"} yet.</div>:null}</section>

    {admin?<section id="finance-manage" className="no-print mt-8 scroll-mt-28"><h2 className="text-2xl font-bold">Manage financial records</h2><p className="mt-2 text-sm text-neutral-600">Record bank movements once, including refunds. Describe team purchases without identifying individual families. Upload only team documents; review and redact before sharing.</p><fieldset disabled={busy} className="mt-5 grid gap-5 lg:grid-cols-2">
     <form className="card p-5" onSubmit={addTransaction} onChange={()=>{transactionId.current=null;}}><h3 className="text-lg font-bold">Add transaction</h3><div className="mt-4 grid gap-4"><label>Date<input name="date" type="date" required className={inputClass}/></label><label>Type<select name="kind" className={inputClass} value={kind} onChange={e=>setKind(e.target.value as Transaction["kind"])}>{Object.entries(kindLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>Team description<input name="description" required maxLength={300} className={inputClass} placeholder="e.g. Tournament entry fee"/></label><label>Amount (CAD)<input name="amount" type="number" min="0.01" max="1000000" step="0.01" required className={inputClass}/></label><label>Budget item<select name="line" required={kind==="expense"||kind==="expense_refund"} className={inputClass}><option value="">Choose an item{kind==="income"||kind==="income_refund"?" (optional for income)":""}</option>{data.lines.map(l=><option value={l.id} key={l.id}>{l.label}</option>)}</select></label><button className="btn btn-primary">Save transaction</button></div></form>
     <form className="card p-5" onSubmit={addDocument}><h3 className="text-lg font-bold">Upload receipt or statement</h3><p className="mt-2 text-sm text-neutral-600">New uploads stay private to management until shared. JPG/PNG metadata is removed during upload. PDF content must be reviewed and redacted before sharing.</p><div className="mt-4 grid gap-4"><label>Document type<select name="kind" value={docKind} onChange={e=>setDocKind(e.target.value)} className={inputClass}><option value="receipt">Receipt</option><option value="statement">Account statement</option></select></label><label>Title<input name="title" required maxLength={180} className={inputClass}/></label>{docKind==="receipt"?<label>Linked transaction<select name="transaction" required className={inputClass}><option value="">Choose a transaction</option>{data.transactions.filter(t=>!t.voided_at).map(t=><option key={t.id} value={t.id}>{t.occurred_on} · {t.description} · {money(t.amount_cents)}</option>)}</select></label>:<><label>Period start<input name="period_start" type="date" required className={inputClass}/></label><label>Period end<input name="period_end" type="date" required className={inputClass}/></label><label>Statement closing balance (CAD)<input name="closing" type="number" step="0.01" required className={inputClass}/></label></>}<label>PDF, JPG or PNG (up to 10 MB)<input name="file" type="file" accept="application/pdf,image/jpeg,image/png" required className={inputClass}/></label><button className="btn btn-primary">Upload manager draft</button></div></form>
     <form className="card p-5" onSubmit={saveOpening} key={data.settings.updated_at}><h3 className="text-lg font-bold">Opening account balance</h3><p className="mt-2 text-sm text-neutral-600">Enter the bank balance at the beginning of the selected day. Only transactions on or after this date contribute to the recorded balance. Confirm it against a bank statement.</p><div className="mt-4 grid gap-4"><label>Balance (CAD)<input name="opening" type="number" step="0.01" required defaultValue={data.settings.opening_cents===null?"":data.settings.opening_cents/100} className={inputClass}/></label><label>Opening date<input name="opening_date" type="date" required defaultValue={data.settings.opening_date??""} className={inputClass}/></label><button className="btn btn-primary">Save opening balance</button></div></form>
     <form className="card p-5" onSubmit={saveBudget}><h3 className="text-lg font-bold">Revise a budget allocation</h3><div className="mt-4 grid gap-4"><label>Budget item<select required className={inputClass} value={budgetId} onChange={e=>{setBudgetId(e.target.value);setBudgetAmount(String((data.lines.find(l=>l.id===e.target.value)?.planned_cents??0)/100));}}><option value="">Choose an item</option>{data.lines.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}</select></label><label>New planned amount (CAD)<input type="number" min="0" step="0.01" required value={budgetAmount} onChange={e=>setBudgetAmount(e.target.value)} className={inputClass}/></label><button className="btn btn-primary">Save allocation</button></div></form>
     <form className="card p-5 lg:col-span-2" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const form=e.currentTarget;void run(async()=>{const result=await supabase.from("team_transactions").update({voided_at:new Date().toISOString(),void_reason:String(f.get("reason")).trim()}).eq("id",String(f.get("transaction"))).is("voided_at",null).select("id").single();if(result.error)throw new Error(result.error.message);form.reset();},"Transaction voided. The original record and reason remain visible.");}}><h3 className="text-lg font-bold">Correct an entry</h3><p className="mt-2 text-sm text-neutral-600">Void an incorrect transaction, then add the replacement. Original records remain visible; they cannot be deleted or overwritten.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label>Transaction<select name="transaction" required className={inputClass}><option value="">Choose an entry to void</option>{data.transactions.filter(t=>!t.voided_at).map(t=><option key={t.id} value={t.id}>{t.occurred_on} · {t.description} · {money(t.amount_cents)}</option>)}</select></label><label>Reason<input name="reason" minLength={3} maxLength={300} required className={inputClass}/></label><button className="btn btn-light sm:col-span-2">Void transaction</button></div></form>
    </fieldset><details className="card mt-5 p-5"><summary className="cursor-pointer font-bold">Recent audit history (management only)</summary><ul className="mt-4 space-y-2 text-sm">{audit.map(a=><li key={a.id}>{new Date(a.changed_at).toLocaleString("en-CA")} · {a.table_name.replace("team_","").replaceAll("_"," ")} · {a.operation==="INSERT"?"Created":"Updated"} · Record {a.record_id}</li>)}</ul></details></section>:null}
   </>:null}
  </main>
 </div>;
}
