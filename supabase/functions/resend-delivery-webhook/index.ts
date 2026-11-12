import { createClient } from "npm:@supabase/supabase-js@2.95.0";

// Resend signs the exact raw request body with Svix. No unsigned event may
// update notification delivery status.
const resp=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
function safeEqual(a:Uint8Array,b:Uint8Array){
 if(a.length!==b.length)return false;
 let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
 return diff===0;
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return resp({error:"Method not allowed"},405);
 try{
  const secret=Deno.env.get("RESEND_WEBHOOK_SECRET")||"";
  if(!secret.startsWith("whsec_"))return resp({error:"Webhook not configured"},503);
  const id=req.headers.get("svix-id")||"";
  const stamp=req.headers.get("svix-timestamp")||"";
  const signature=req.headers.get("svix-signature")||"";
  if(!id||!stamp||!signature)return resp({error:"Missing signature"},401);
  const ts=Number(stamp);
  if(!Number.isFinite(ts)||Math.abs(Date.now()/1000-ts)>300)return resp({error:"Expired signature"},401);
  const raw=await req.text();
  const message=new TextEncoder().encode(id+"."+stamp+"."+raw);
  const secretBytes=Uint8Array.from(atob(secret.slice(6)),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey("raw",secretBytes,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const calculated=new Uint8Array(await crypto.subtle.sign("HMAC",key,message));
  const verified=signature.split(" ").some(value=>{
   const candidate=value.startsWith("v1,")?value.slice(3):"";
   try{return safeEqual(calculated,Uint8Array.from(atob(candidate),c=>c.charCodeAt(0)));}
   catch{return false;}
  });
  if(!verified)return resp({error:"Invalid signature"},401);
  const event=JSON.parse(raw);
  const type=String(event.type||"");
  const messageId=String(event.data?.email_id||"");
  if(!messageId)return resp({ok:true,ignored:true});
  const next=type==="email.delivered"?"delivered":
   ["email.bounced","email.failed","email.complained"].includes(type)?"bounced":null;
  if(!next)return resp({ok:true,ignored:true});
  const url=Deno.env.get("SUPABASE_URL")||"";
  const service=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  if(!url||!service)return resp({error:"Database unavailable"},503);
  const client=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const row=await client.from("notification_outbox").update({
   status:next,delivered_at:next==="delivered"?new Date().toISOString():null,
   last_error:next==="bounced"?"Email rejected by the recipient provider":null,
   updated_at:new Date().toISOString()
  }).eq("provider_message_id",messageId).in("status",["accepted","delivered","bounced"])
    .select("id").maybeSingle();
  if(row.error)throw row.error;
  return resp({ok:true});
 }catch{
  return resp({error:"Unable to process verified webhook"},500);
 }
});