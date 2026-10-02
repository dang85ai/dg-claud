"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PortalHeader } from "@/components/PortalHeader";
import { moduleConfigs, Field, Section } from "@/lib/management-config";
import { managementModules } from "@/lib/management-modules";
import { errorMessage, requireManager } from "@/lib/management-access";
import { openProcessedImage } from "@/lib/private-media";
import { authedFetch, endpoints } from "@/lib/api";
import { SUPABASE_PUBLISHABLE_KEY, supabase } from "@/lib/supabase";

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
        return [section.table,result.data ?? []] as const;
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

  function fieldControl(field:Field){
    const id="create-"+field.key;
    if(field.type==="checkbox") return <label className="flex items-center gap-3" key={field.key}><input id={id} name={field.key} type="checkbox" disabled={busy}/>{field.label}</label>;
    return <div key={field.key}><label htmlFor={id} className="field-label">{field.label}</label>
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
    }}>{editableSection.fields.map(field=><div key={field.key}><label className="field-label" htmlFor={id+"-"+field.key}>{field.label}</label>{field.options?<select id={id+"-"+field.key} name={field.key} className="field" defaultValue={String(row[field.key]??"")} required={field.required} disabled={busy}>{field.options.map(v=><option key={v} value={v}>{label(v)}</option>)}</select>:field.type==="checkbox"?<input id={id+"-"+field.key} name={field.key} type="checkbox" defaultChecked={row[field.key]===true} disabled={busy}/>:<input id={id+"-"+field.key} name={field.key} className="field" type={field.type??"text"} defaultValue={String(row[field.key]??"")} required={field.required} maxLength={field.key==="body"?5000:2000} disabled={busy}/>}</div>)}<button className="btn btn-primary justify-self-start" disabled={busy}>Save Changes</button></form></details>;
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
    <nav className="mt-5 flex flex-wrap gap-3" aria-label="Management modules">{managementModules.map(item=><Link href={item.href} key={item.label} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-bold">{item.label}</Link>)}</nav>
    <button type="button" className="btn btn-light mt-5" disabled={busy || loading} onClick={()=>void load()}>{loading?"Loading…":"Refresh Records"}</button>
    {error?<p role="alert" className="notice mt-4">{error}</p>:null}{message?<p role="status" className="notice mt-4">{message}</p>:null}
    {!loading ? config.sections.map(section=><section key={section.table} className="mt-8">
      <h2 className="text-2xl font-black uppercase">{section.title}</h2>
      {section.fields ? <form className="card mt-4 grid gap-4 p-5 md:grid-cols-2" onSubmit={e=>void create(e,section)}>
        {section.fields.map(fieldControl)}<button className="btn btn-primary justify-self-start" disabled={busy}>{busy?"Saving…":section.createLabel}</button>
      </form>:null}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {(records[section.table]??[]).length ? records[section.table].map((row,index)=><article className="card p-5" key={String(row.id ?? row.key ?? index)}>
          <h3 className="font-black">{String(row.title ?? row.item_name ?? row.caption ?? row.duty_type ?? row.key ?? section.title+" "+(index+1))}</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            {Object.entries(row).filter(([key])=>key!=="id" && !key.endsWith("_path")).map(([key,value])=><div className="grid grid-cols-[minmax(100px,1fr)_2fr] gap-3" key={key}><dt className="font-bold">{label(key)}</dt><dd className="break-words whitespace-pre-wrap">{showValue(key,value)}</dd></div>)}
          </dl>{rowActions(section.table,row)}
        </article>):<p className="notice">No {section.title.toLowerCase()} yet.</p>}
      </div>
      {(records[section.table]??[]).length===200 ? <p className="mt-3 text-sm text-neutral-600">Showing the latest 200 records. Use Data Export for the full season.</p>:null}
    </section>):null}
  </main></div>;
}
