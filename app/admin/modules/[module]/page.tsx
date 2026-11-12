"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sessions, trainingPlan } from "@/lib/training-plans";
import { PortalHeader } from "@/components/PortalHeader";
import { moduleConfigs, Field, Section } from "@/lib/management-config";
import { errorMessage, requireManager } from "@/lib/management-access";
import { openProcessedImage } from "@/lib/private-media";
import { authedFetch, endpoints } from "@/lib/api";
import { SUPABASE_PUBLISHABLE_KEY, supabase } from "@/lib/supabase";

import {teamTimeIso,teamTimeInput} from "@/lib/team-time";

type Row = Record<string, unknown>;
type Choice = { id: string; label: string };
const text = (value: unknown) => value == null ? "—" : typeof value === "boolean" ? value ? "Yes" : "No" : typeof value === "object" ? JSON.stringify(value) : String(value);
const label = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const time = (value: unknown) => new Date(String(value)).toLocaleString("en-CA", { timeZone: "America/Toronto" });

export default function ManagementModulePage() {
  const params = useParams<{ module: string }>();
  const name = params.module;
  const config = moduleConfigs[name];
  const router = useRouter();
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [pages,setPages]=useState<Record<string,number>>({});
  const [records, setRecords] = useState<Record<string, Row[]>>({});
  const [choices, setChoices] = useState<Record<string, Choice[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<Record<string, string>>({});
  const [decodedImages,setDecodedImages]=useState<Record<string,boolean>>({});
  const imageUrls=useRef<string[]>([]);
  useEffect(()=>()=>imageUrls.current.forEach(URL.revokeObjectURL),[]);

  const load = useCallback(async () => {
    if (!config) return;
    setLoading(true); setError("");
    try {
      await requireManager();
      const refs = await Promise.all([
        supabase.from("players").select("id,first_name,last_name").order("first_name"),
        supabase.from("events").select("id,title,starts_at").order("starts_at", {ascending:false}).limit(500),
        supabase.from("guardians").select("id,full_name"),
        supabase.from("equipment").select("id,item_name,status")
      ]);
      for (const ref of refs) if (ref.error) throw ref.error;
      setChoices({
        players: (refs[0].data ?? []).map((r) => ({id:r.id,label:(r.first_name+" "+r.last_name).trim()})),
        events: (refs[1].data ?? []).map((r) => ({id:r.id,label:r.title+" · "+time(r.starts_at)})),
        guardians: (refs[2].data ?? []).map((r) => ({id:r.id,label:r.full_name})),
        equipment: (refs[3].data ?? []).map((r)=>({id:r.id,label:r.item_name})),
        availableEquipment: (refs[3].data ?? []).filter((r)=>r.status==="available").map((r)=>({id:r.id,label:r.item_name}))
      });
      const loaded = await Promise.all(config.sections.map(async(section) => {
        const result = await supabase.from(section.table).select(section.columns).order(section.order,{ascending:false}).limit(200).returns<Row[]>();
        if (result.error) throw result.error;
        const rows: Row[]=section.table==="event_duties"?(result.data??[]).map(row=>({...row,is_claimed:Array.isArray(row.duty_claims)&&row.duty_claims.length>0})):(result.data??[]);
        return [section.table, section.table === "events" ? rows.map(row => ({...row, training_plan: trainingPlan({title:String(row.title), notes:String(row.notes ?? ""),event_type:String(row.event_type)})?.title ?? "Plan to be confirmed"})) : rows] as const;
      }));
      setRecords(Object.fromEntries(loaded));
    } catch (err) {
      setRecords({}); setChoices({});
      const detail = errorMessage(err);
      if (detail.includes("sign in")) { router.replace("/login"); return; }
      if (detail.includes("multi-factor")) { router.replace("/mfa"); return; }
      setError(detail);
    } finally { setLoading(false); }
  }, [config, router]);

  useEffect(() => { setImages({}); setMessage(""); void load(); }, [load]);

  async function act(action: string, input: Row) {
    await requireManager();
    if (action.startsWith("event.") && "training_plan" in input) {
      const plan = sessions.find(s => s.title === input.training_plan);
      const clean = String(input.notes ?? "").replace(/\s*\[Training: session-[1-4]\]/gi, "").trim();
      input.notes = clean + (["practice", "training"].includes(String(input.event_type)) && plan ? ` [Training: ${plan.id}]` : "");
      delete input.training_plan;
    }
    if(action.startsWith("event."))for(const key of ["starts_at","ends_at","arrival_at"])if(typeof input[key]==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(input[key])))input[key]=teamTimeIso(String(input[key]));
    await authedFetch(endpoints.adminActions, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,input})});
  }

  async function perform(operation: () => Promise<void>, success: string) {
    setBusy(true); setError(""); setMessage("");
    try { await operation(); await load(); setMessage(success); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }

  async function create(event: FormEvent<HTMLFormElement>, section: Section) {
    event.preventDefault();
    const element=event.currentTarget;
    const form=new FormData(element);
    const input:Row={};
    for (const field of section.fields ?? []) {
      const value=String(form.get(field.key) ?? "").trim();
      input[field.key]=field.type==="checkbox" ? form.get(field.key)==="on" : field.type==="number" ? value ? Number(value) : null : value || null;
    }
    await perform(async()=>{
      await requireManager();
      for(const field of section.fields??[])if(field.type==="datetime-local"&&input[field.key])input[field.key]=teamTimeIso(String(input[field.key]));
      if (section.table==="equipment_assignments" && !input.player_id && !input.assigned_to_text) throw new Error("Choose a player or enter a recipient name.");
      if (section.table==="attendance") {
        await authedFetch(endpoints.parentActions,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"attendance.set",input})});
      } else if (section.action) {
        await act(section.action,input);
      } else {
        const result=await supabase.from(section.table).insert(input).select("id").single();
        if(result.error) throw result.error;
      }
      element.reset();
    },"Saved successfully.");
  }

  async function downloadForm(id: string) {
    await perform(async()=>{
      await requireManager();
      const {data}=await supabase.auth.getSession();
      if(!data.session) throw new Error("Please sign in again.");
      const response=await fetch(endpoints.formPdf+"?submission_id="+encodeURIComponent(id),{
        headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+data.session.access_token},cache:"no-store"
      });
      if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.error ?? "Unable to download form.");}
      const url=URL.createObjectURL(await response.blob());
      const anchor=document.createElement("a");anchor.href=url;anchor.download="signed-form.pdf";anchor.click();URL.revokeObjectURL(url);
    },"Form downloaded.");
  }

  async function viewImage(row:Row){
    await perform(async()=>{
      await requireManager();
      const path=String(row.processed_private_path ?? row.thumbnail_path ?? "");
      if(!path) throw new Error("No processed private image is available.");
      const url=await openProcessedImage(path);
      imageUrls.current.push(url);
      setDecodedImages(current=>({...current,[String(row.id)]:false}));
      setImages((current)=>({...current,[String(row.id)]:url}));
    },"Private image opened. Approval is enabled after the image loads.");
  }

  function fieldControl(field:Field,table:string){
    const id="create-"+table+"-"+field.key;
    if(field.type==="checkbox") return <label className="flex items-center gap-3" key={field.key}><input id={id} name={field.key} type="checkbox" disabled={busy}/>{field.label}</label>;
    return <div key={field.key}><label htmlFor={id} className="field-label">{field.label}{field.type==="datetime-local"?" (Toronto time)":""}</label>
      {field.source || field.options ? <select id={id} name={field.key} className="field" required={field.required} disabled={busy}>
        <option value="">Select {field.label.toLowerCase()}</option>
        {field.options?.map((option)=><option key={option} value={option}>{label(option)}</option>)}
        {(choices[field.source ?? ""] ?? []).map((option)=><option key={option.id} value={option.id}>{option.label}</option>)}
      </select> : <input id={id} name={field.key} className="field" type={field.type ?? "text"} required={field.required} maxLength={field.key==="body"?5000:2000} disabled={busy}/>}
    </div>;
  }

  function showValue(key:string,value:unknown){
    const source=({player_id:"players",event_id:"events",guardian_id:"guardians",equipment_id:"equipment"} as Record<string,string>)[key];
    if(source) return choices[source]?.find((r)=>r.id===value)?.label ?? "Record unavailable";
    if(key.endsWith("_at") && value) return time(value);
    if(key==="total_cad" || key==="amount_cad") return new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(Number(value));
    if(key.endsWith("_id")) return value ? String(value).slice(0,8) : "—";
    return text(value);
  }

  function rowActions(table:string,row:Row){
    const id=String(row.id);
    const editAction=({players:"player.update",events:"event.update",announcements:"announcement.update"} as Record<string,string>)[table];
    const editableSection=config?.sections.find(s=>s.table===table);
    if(editAction&&editableSection?.fields) return <details className="mt-4"><summary className="cursor-pointer font-bold">Edit {table==="players"?"player":table==="events"?"event":"announcement"}</summary><form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={e=>{
      e.preventDefault();const form=new FormData(e.currentTarget);const input:Row={id};
      for(const field of editableSection.fields??[]){const value=String(form.get(field.key)??"").trim();input[field.key]=field.type==="checkbox"?form.get(field.key)==="on":field.type==="number"?value?Number(value):null:value||null;}
      void perform(()=>act(editAction,input),"Changes saved.");
    }}>{editableSection.fields.map(field=><div key={field.key}><label className="field-label" htmlFor={id+"-"+field.key}>{field.label}{field.type==="datetime-local"?" (Toronto time)":""}</label>{field.options?<select id={id+"-"+field.key} name={field.key} className="field" defaultValue={String(row[field.key]??"")} required={field.required} disabled={busy}>{field.options.map(v=><option key={v} value={v}>{label(v)}</option>)}</select>:field.type==="checkbox"?<input id={id+"-"+field.key} name={field.key} type="checkbox" defaultChecked={row[field.key]===true} disabled={busy}/>:<input id={id+"-"+field.key} name={field.key} className="field" type={field.type??"text"} defaultValue={field.type==="datetime-local"&&row[field.key]?teamTimeInput(String(row[field.key])):String(row[field.key]??"")} required={field.required} maxLength={field.key==="body"?5000:2000} disabled={busy}/>}</div>)}<button className="btn btn-primary justify-self-start" disabled={busy}>Save Changes</button></form></details>;
    if(table==="kit_orders") return <form className="mt-4 flex flex-wrap gap-3" onSubmit={e=>{
      e.preventDefault(); const form=new FormData(e.currentTarget);
      void perform(()=>act("kit_order.status",{id,payment_status:form.get("payment_status")}),"Payment status saved.");
    }}><label className="sr-only" htmlFor={"payment-"+id}>Payment status</label><select id={"payment-"+id} className="field !w-auto" name="payment_status" defaultValue={String(row.payment_status)} disabled={busy}>{["unpaid","partial","paid","refunded"].map(v=><option key={v} value={v}>{label(v)}</option>)}</select><button className="btn btn-primary" disabled={busy}>Save Status</button></form>;
    if(table==="sisterhood_posts" && row.status==="pending") return <div className="mt-4 flex gap-3">{["approved","rejected"].map(status=><button key={status} className="btn btn-light" disabled={busy} onClick={()=>void perform(()=>act("sisterhood.review",{id,status}),"Review saved.")}>{status==="approved"?"Approve":"Reject"}</button>)}</div>;
    if(table==="equipment_assignments" && !row.returned_at) return <button className="btn btn-light mt-4" disabled={busy} onClick={()=>void perform(()=>act("equipment.return",{assignment_id:id}),"Return recorded.")}>Record Return</button>;
    if(table==="referee_assignments") return <button className="btn btn-light mt-4" disabled={busy} onClick={()=>void perform(async()=>{await requireManager();const result=await supabase.from(table).update({confirmed:!row.confirmed}).eq("id",id).select("id").single();if(result.error)throw result.error;},"Confirmation saved.")}>{row.confirmed?"Mark Unconfirmed":"Confirm Assignment"}</button>;
    if(table==="form_submissions") return <button className="btn btn-light mt-4" disabled={busy} onClick={()=>void downloadForm(id)}>Download Signed PDF</button>;
    if(table==="site_settings" && ["birthday_board_enabled","player_of_match_enabled"].includes(String(row.key))) return <button className="btn btn-light mt-4" disabled={busy} onClick={()=>void perform(()=>act("feature.toggle",{key:row.key,enabled:row.value!==true}),"Feature setting saved.")}>{row.value===true?"Disable":"Enable"}</button>;
    if(table==="media_items") return <div className="mt-4">
      <button className="btn btn-light" disabled={busy} onClick={()=>void viewImage(row)}>View Private Image</button>
      {images[id] ? <img src={images[id]} alt={String(row.caption ?? "Private uploaded team image")} className="mt-4 max-h-96 max-w-full rounded-xl object-contain" onLoad={()=>setDecodedImages(v=>({...v,[id]:true}))} onError={()=>{setDecodedImages(v=>({...v,[id]:false}));setError("The stored image cannot be decoded. Ask the uploader to submit a new photo.");}} /> : null}
      {row.status==="pending" ? <form className="mt-4" onSubmit={e=>{
        e.preventDefault(); const form=new FormData(e.currentTarget);
        void perform(async()=>{
          if(!decodedImages[id] || row.exif_stripped!==true || !row.processed_private_path) throw new Error("View the processed private image before approving it.");
          await act("media.review",{id,status:"approved",visibility:"private_team",exif_stripped:row.exif_stripped,consent_reviewed:form.get("consent")==="on",processed_private_path:row.processed_private_path,thumbnail_path:row.thumbnail_path,processed_public_path:null});
        },"Approved for the private team portal.");
      }}><label className="flex gap-3 text-sm"><input type="checkbox" name="consent" required disabled={busy}/>I reviewed the image and confirmed private-team consent for everyone shown.</label>
      <div className="mt-3 flex flex-wrap gap-3"><button className="btn btn-primary" disabled={busy || !decodedImages[id]}>Approve Private Image</button><button type="button" className="btn btn-light" disabled={busy} onClick={()=>void perform(()=>act("media.review",{...row,id,status:"rejected",visibility:"private_team",processed_public_path:null}),"Image rejected.")}>Reject</button></div></form>:null}
    </div>;
    return null;
  }

  if(!config) return <div className="container py-12"><h1>Management module not found</h1><Link href="/admin">Return to dashboard</Link></div>;
  return <div className="min-h-screen bg-neutral-100"><PortalHeader title={config.title} isAdmin/><main id="portal-main" className="container py-8">
    <h1 className="text-4xl font-black uppercase">{config.title}</h1><p className="mt-3 max-w-3xl text-neutral-600">{config.description}</p>
    <Link href="/admin" className="mt-4 inline-block text-sm font-bold text-red-700 underline">Management dashboard</Link>
    <div className="mt-5 flex flex-wrap items-end gap-3"><div className="min-w-48 flex-1"><label className="field-label" htmlFor="record-search">Search records</label><input id="record-search" className="field" value={search} onChange={e=>{setSearch(e.target.value);setPages({});}}/></div><div><label className="field-label" htmlFor="record-status">Status</label><select id="record-status" className="field" value={filter} onChange={e=>{setFilter(e.target.value);setPages({});}}><option value="all">All statuses</option>{Array.from(new Set(Object.values(records).flat().flatMap(row=>[row.status,row.payment_status].filter(v=>typeof v==="string")))).map(v=><option key={String(v)} value={String(v)}>{label(String(v))}</option>)}</select></div></div>
    <button type="button" className="btn btn-light mt-5" disabled={busy || loading} onClick={()=>void load()}>{loading?"Loading…":"Refresh Records"}</button>
    {error?<p role="alert" className="notice mt-4">{error}</p>:null}{message?<p role="status" className="notice mt-4">{message}</p>:null}
    {!loading ? config.sections.map(section=>{const matches=(records[section.table]??[]).filter(row=>(filter==="all"||row.status===filter||row.payment_status===filter)&&Object.entries(row).filter(([key])=>!key.endsWith("_path")&&key!=="id"&&key!=="duty_claims").some(([key,value])=>showValue(key,value).toLowerCase().includes(search.toLowerCase())));const page=Math.min(pages[section.table]??0,Math.max(0,Math.ceil(matches.length/12)-1));return <section key={section.table} className="mt-8">
      <h2 className="text-2xl font-black uppercase">{section.title}</h2>
      {section.fields ? <form className="card mt-4 grid gap-4 p-5 md:grid-cols-2" onSubmit={e=>void create(e,section)}>
        {section.fields.map(field=>fieldControl(field,section.table))}<button className="btn btn-primary justify-self-start" disabled={busy}>{busy?"Saving…":section.createLabel}</button>
      </form>:null}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {matches.length ? matches.slice(page*12,page*12+12).map((row,index)=><article className="card p-5" key={String(row.id ?? row.key ?? index)}>
          <h3 className="font-black">{String(row.title ?? row.item_name ?? row.caption ?? row.duty_type ?? row.key ?? section.title+" "+(index+1))}</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            {Object.entries(row).filter(([key])=>key!=="id" && key!=="duty_claims" && !key.endsWith("_path")).map(([key,value])=><div className="grid grid-cols-[minmax(100px,1fr)_2fr] gap-3" key={key}><dt className="font-bold">{label(key)}</dt><dd className="break-words whitespace-pre-wrap">{showValue(key,value)}</dd></div>)}
          </dl>{section.table === "events" && row.training_plan !== "Plan to be confirmed" ? <Link className="mt-3 block font-bold text-red-600" href={`/portal/training#${trainingPlan({title:String(row.title),notes:String(row.notes ?? ""),event_type:String(row.event_type)})?.id}-coach`}>Open Coach Plan / Print Session Card →</Link> : null}{rowActions(section.table,row)}
        </article>):<p className="notice">No {section.title.toLowerCase()} match these filters.</p>}
      </div>
      <p className="mt-3 text-sm text-neutral-600" role="status">{matches.length} matching records</p>
      {matches.length>12?<nav className="mt-3 flex items-center gap-3" aria-label={section.title+" pages"}><button className="btn btn-light" disabled={page===0} onClick={()=>setPages(v=>({...v,[section.table]:page-1}))}>Previous</button><span>Page {page+1} of {Math.ceil(matches.length/12)}</span><button className="btn btn-light" disabled={(page+1)*12>=matches.length} onClick={()=>setPages(v=>({...v,[section.table]:page+1}))}>Next</button></nav>:null}
      {(records[section.table]??[]).length===200 ? <p className="mt-3 text-sm text-neutral-600">Showing the latest 200 records. Use Data Export for the full season.</p>:null}
    </section>;}):null}
  </main></div>;
}


