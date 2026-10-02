"use client";
import Link from "next/link";
import { FormEvent,useCallback,useEffect,useRef,useState } from "react";
import { useParams,useRouter } from "next/navigation";
import { PortalHeader } from "@/components/PortalHeader";
import { ChildLinkRequest } from "@/components/ChildLinkRequest";
import { authedFetch,endpoints } from "@/lib/api";
import { openProcessedImage } from "@/lib/private-media";
import { SUPABASE_PUBLISHABLE_KEY,supabase } from "@/lib/supabase";
type Row=Record<string,unknown>;
type Player={id:string;first_name:string;last_name:string};
type Event={id:string;title:string;starts_at:string;venue_name?:string;notes?:string;uniform?:string;weather_alert?:string;status?:string};
type Dashboard={user:{id:string};roles:string[];guardian:{id:string}|null;profile:{full_name?:string;display_name?:string;phone?:string}|null;players:Player[];events:Event[];attendance:Row[];media:Row[];form_submissions:Row[];kit_orders:Row[];carpool:Row[];sisterhood:Row[];notification_preferences:Row|null};
const titles:Record<string,string>={attendance:"Schedule & Attendance",duties:"Game Duties",forms:"Signed Forms",media:"Team Photos",payments:"Kit & Payments",carpool:"Carpool Board",sisterhood:"Team Recognition",account:"My Account"};
const dates=(v:unknown)=>new Date(String(v)).toLocaleString("en-CA",{timeZone:"America/Toronto"});
const readable=(v:unknown)=>String(v??"—").replace(/_/g," ");
export default function FamilyActivityPage(){
 const {section}=useParams<{section:string}>();
 const router=useRouter();
 const [data,setData]=useState<Dashboard|null>(null);
 const [extra,setExtra]=useState<Record<string,Row[]>>({});
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const [images,setImages]=useState<Record<string,string>>({});
 const imageUrls=useRef<string[]>([]);
 const load=useCallback(async()=>{
   setLoading(true);setError("");
   try{
     const d=await authedFetch<Dashboard>(endpoints.parentDashboard);
     if(!d.roles.some(r=>["parent_player","manager","admin","photographer"].includes(r)))throw new Error("This account does not have team portal access. Contact the manager.");
     setData(d);
     const rows:Record<string,Row[]>={};
     if(section==="duties"){
       const duties=await supabase.from("event_duties").select("id,event_id,duty_type,instructions,duty_claims(id)").limit(200);
       const claims=d.guardian?await supabase.from("duty_claims").select("id,duty_id").eq("guardian_id",d.guardian.id):{data:[],error:null};
       if(duties.error)throw duties.error;if(claims.error)throw claims.error;
       rows.duties=(duties.data??[]).map(duty=>({...duty,is_claimed:Array.isArray(duty.duty_claims)&&duty.duty_claims.length>0}));rows.claims=claims.data??[];
     }
     if(section==="payments"&&d.kit_orders.length){
       const items=await supabase.from("kit_order_items").select("id,order_id,item_name,size,quantity,customization").in("order_id",d.kit_orders.map(r=>r.id)).limit(200);
       if(items.error)throw items.error;rows.items=items.data??[];
     }
     if(section==="forms"){
       const forms=await supabase.from("form_templates").select("id,title,version").limit(100);
       if(forms.error)throw forms.error;rows.templates=forms.data??[];
     }
     if(section==="media"){
       const requests=await supabase.from("profile_photo_requests").select("id,player_id,media_id,status").eq("submitted_by",d.user.id).limit(100);
       if(requests.error)throw requests.error;rows.requests=requests.data??[];
     }
     setExtra(rows);
   }catch(e){const detail=e instanceof Error?e.message:"Unable to load this section.";setError(detail);if(detail.includes("sign in")||detail.includes("session"))router.replace("/login");}
   finally{setLoading(false);}
 },[section,router]);
 useEffect(()=>{setMessage("");setImages({});imageUrls.current.forEach(URL.revokeObjectURL);imageUrls.current=[];void load();},[load]);
 useEffect(()=>()=>imageUrls.current.forEach(URL.revokeObjectURL),[]);
 async function action(name:string,input:Row){
   setBusy(true);setError("");setMessage("");
   try{await authedFetch(endpoints.parentActions,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:name,input})});await load();setMessage("Saved successfully.");}
   catch(e){setError(e instanceof Error?e.message:"Unable to save. Please retry.");}finally{setBusy(false);}
 }
 async function view(row:Row){
   setBusy(true);setError("");
   try{const url=await openProcessedImage(String(row.processed_private_path??row.thumbnail_path??""));imageUrls.current.push(url);setImages(v=>({...v,[String(row.id)]:url}));}
   catch(e){setError(e instanceof Error?e.message:"Unable to view photo.");}finally{setBusy(false);}
 }
 async function pdf(id:unknown){
   setBusy(true);setError("");
   try{
     const {data:session}=await supabase.auth.getSession();if(!session.session)throw new Error("Please sign in again.");
     const result=await fetch(endpoints.formPdf+"?submission_id="+encodeURIComponent(String(id)),{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+session.session.access_token},cache:"no-store"});
     if(!result.ok)throw new Error("Unable to download this signed form.");
     const url=URL.createObjectURL(await result.blob());const a=document.createElement("a");a.href=url;a.download="signed-form.pdf";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   }catch(e){setError(e instanceof Error?e.message:"Unable to download form.");}finally{setBusy(false);}
 }
 function player(id:unknown){const p=data?.players.find(p=>p.id===id);return p?(p.first_name+" "+p.last_name).trim():"Team player";}
 function event(id:unknown){return data?.events.find(e=>e.id===id)?.title??"Team event";}
 function empty(content:string){return <p className="notice">{content}</p>;}
 function button(content:string,click:()=>void){return <button className="btn btn-light mt-3" disabled={busy} onClick={click}>{content}</button>;}
 async function account(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);await action("profile.update",{full_name:f.get("full_name"),display_name:f.get("display_name"),phone:f.get("phone")});}
 async function preferences(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const input:Row={};["game_reminders","practice_reminders","weather_alerts","schedule_changes","coach_announcements","kit_payment_reminders"].forEach(k=>input[k]=f.get(k)==="on");await action("notification_preferences.set",input);}
 if(!titles[section])return <><PortalHeader title="Team Portal"/><main id="portal-main" className="container py-10"><h1>Section not found</h1><Link href="/portal">Return to portal</Link></main></>;
 return <div className="min-h-screen bg-neutral-100"><PortalHeader title={titles[section]}/><main id="portal-main" className="container py-8">
 <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-black">{titles[section]}</h1><button className="btn btn-light" disabled={busy||loading} onClick={()=>void load()}>{loading?"Loading…":"Refresh"}</button></div>
 {error?<p role="alert" className="notice mt-5">{error}</p>:null}{message?<p role="status" className="notice mt-5">{message}</p>:null}
 {!data?empty(loading?"Loading your team information…":"Unable to load. Use Refresh to retry."): <div className="mt-6 grid gap-5">
 {!data.players.length&&["attendance","duties","forms","payments"].includes(section)?<ChildLinkRequest accountId={data.user.id}/>:null}
 {section==="attendance"?(data.events.length?data.events.map(e=><section key={e.id} className="card p-5"><h2 className="text-xl font-black">{e.title}</h2><p className="mt-2">{dates(e.starts_at)} · {e.venue_name??"Venue to be confirmed"}</p>{e.weather_alert?<p className="notice mt-3">{e.weather_alert}</p>:null}{e.uniform?<p className="mt-2">Kit: {e.uniform}</p>:null}{e.notes?<p className="mt-2 whitespace-pre-wrap">{e.notes}</p>:null}
 {data.players.map(p=>{const attendance=data.attendance.find(a=>a.event_id===e.id&&a.player_id===p.id);return <form key={p.id} className="mt-4 flex flex-wrap items-end gap-3" onSubmit={ev=>{ev.preventDefault();const f=new FormData(ev.currentTarget);void action("attendance.set",{player_id:p.id,event_id:e.id,status:f.get("status"),note:f.get("note")});}}><div><label className="field-label" htmlFor={e.id+p.id}>Availability for {p.first_name}</label><select key={String(attendance?.status??"unknown")} id={e.id+p.id} name="status" className="field" defaultValue={String(attendance?.status??"unknown")} disabled={busy||e.status==="cancelled"}>{["unknown","attending","not_attending","maybe"].map(s=><option value={s} key={s}>{readable(s)}</option>)}</select></div><div><label className="field-label" htmlFor={"note-"+e.id+p.id}>Note</label><input id={"note-"+e.id+p.id} name="note" className="field" defaultValue={String(attendance?.note??"")} maxLength={500} disabled={busy}/></div><button className="btn btn-primary" disabled={busy||e.status==="cancelled"}>Save Availability</button></form>;})}</section>):empty("No upcoming events.")):null}
 {section==="duties"?((extra.duties??[]).length?(extra.duties??[]).map(d=>{const own=(extra.claims??[]).some(c=>c.duty_id===d.id);return <article key={String(d.id)} className="card p-5"><h2 className="font-black">{readable(d.duty_type)}</h2><p>{event(d.event_id)}</p><p className="mt-2">{String(d.instructions??"")}</p><p className="mt-2">{own?"Claimed by your family":d.is_claimed?"Already claimed":"Available"}</p>{data.guardian&&(!d.is_claimed||own)?button(own?"Release My Duty":"Claim Duty",()=>void action(own?"duty.release":"duty.claim",{duty_id:d.id})):null}</article>;}):empty("No game duties have been posted.")):null}
 {section==="forms"?<><Link href="/portal/tools#consent" className="btn btn-primary justify-self-start">Complete Forms & Consent</Link>{data.form_submissions.length?data.form_submissions.map(f=><article className="card p-5" key={String(f.id)}><h2 className="font-black">{String((extra.templates??[]).find(t=>t.id===f.form_template_id)?.title??"Signed form")}</h2><p>{player(f.player_id)} · Signed {dates(f.signed_at)}</p>{button("Download Signed PDF",()=>void pdf(f.id))}</article>):empty("No signed forms for your family yet.")}</>:null}
 {section==="media"?<><Link href="/portal/tools#photo" className="btn btn-primary justify-self-start">Upload Player Photo</Link>{data.media.length?data.media.map(m=><article className="card p-5" key={String(m.id)}><h2 className="font-black">{String(m.caption??"Team photo")}</h2><p className="mt-2">Review status: {readable(m.status)}</p>{(extra.requests??[]).filter(r=>r.media_id===m.id).map(r=><p key={String(r.id)} className="text-sm">{player(r.player_id)} profile photo request: {readable(r.status)}</p>)}{button("Open Private Photo",()=>void view(m))}{images[String(m.id)]?<img className="mt-4 max-h-96 max-w-full rounded-xl object-contain" src={images[String(m.id)]} alt={String(m.caption??"Private team photo")} onError={()=>setError("This image could not be decoded. Try refreshing or upload a new JPEG, PNG or WebP.")}/>:null}</article>):empty("No photos available. Uploaded photos remain pending until manager review.")}</>:null}
 {section==="payments"?<><Link href="/kit" className="btn btn-light justify-self-start">View Team Kit</Link>{data.kit_orders.length?data.kit_orders.map(o=><article key={String(o.id)} className="card p-5"><h2 className="font-black">Kit order · {player(o.player_id)}</h2><p className="mt-2">{new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(Number(o.total_cad))} · {readable(o.payment_status)}</p><ul className="mt-3">{(extra.items??[]).filter(i=>i.order_id===o.id).map(i=><li key={String(i.id)}>{String(i.item_name)} · Size {String(i.size??"—")} · Quantity {String(i.quantity)}</li>)}</ul></article>):empty("No kit orders for your family.")}<p className="text-sm text-neutral-600">Payment status is recorded by the manager. Online checkout is not available.</p></>:null}
 {section==="carpool"?<><Link href="/portal/tools#carpool" className="btn btn-primary justify-self-start">Offer or Request a Ride</Link>{data.carpool.length?data.carpool.map(c=><article className="card p-5" key={String(c.id)}><h2 className="font-black">{c.kind==="offer"?"Ride offered":"Ride requested"} · {String(c.neighbourhood)}</h2><p>{event(c.event_id)}{c.seats?" · "+String(c.seats)+" seats":""}</p><p className="mt-2">{String(c.note??"")}</p>{c.created_by===data.user.id?button("Close My Post",()=>void action("carpool.update",{id:c.id,active:false})):null}</article>):empty("No active carpool posts.")}</>:null}
 {section==="sisterhood"?<><Link href="/portal/tools#recognition" className="btn btn-primary justify-self-start">Recognize a Teammate</Link>{data.sisterhood.length?data.sisterhood.map(s=><article className="card p-5" key={String(s.id)}><h2 className="font-black">{readable(s.category)}</h2><p className="mt-2">{String(s.body)}</p><p className="mt-2 text-sm">Status: {readable(s.status)}</p></article>):empty("No recognition posts yet.")}</>:null}
 {section==="account"?<><section className="card p-5"><h2 className="text-xl font-black">Profile</h2><p className="mt-2 text-sm">Account ID: {data.user.id}. Share this with the manager to link your child.</p><form key={JSON.stringify(data.profile)} onSubmit={e=>void account(e)} className="mt-4 grid gap-4 sm:grid-cols-2">{[["full_name","Full name"],["display_name","Display name"],["phone","Phone"]].map(([k,label])=><div key={k}><label className="field-label" htmlFor={k}>{label}</label><input id={k} className="field" name={k} defaultValue={String((data.profile as Row|null)?.[k]??"")} maxLength={k==="phone"?40:100} disabled={busy}/></div>)}<button className="btn btn-primary justify-self-start" disabled={busy}>Save Profile</button></form></section>
 <section className="card p-5"><h2 className="text-xl font-black">Reminder Preferences</h2><p className="mt-2 text-sm">These preferences are saved for the team. Automatic notification delivery has not been enabled.</p><form key={JSON.stringify(data.notification_preferences)} onSubmit={e=>void preferences(e)} className="mt-4 grid gap-3">{["game_reminders","practice_reminders","weather_alerts","schedule_changes","coach_announcements","kit_payment_reminders"].map(k=><label className="flex gap-3" key={k}><input type="checkbox" name={k} defaultChecked={data.notification_preferences?.[k]!==false} disabled={busy}/>{readable(k)}</label>)}<button className="btn btn-primary justify-self-start" disabled={busy}>Save Preferences</button></form></section></>:null}
 </div>}
 </main></div>;
}
