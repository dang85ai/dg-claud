import { createClient } from "npm:@supabase/supabase-js@2.95.0";

// Server-only delivery worker. Do not expose any secret key to website JavaScript.
// A verified service secret or an authenticated AAL2 manager is required.
const headers={
 "Access-Control-Allow-Origin":"https://caledonunited2018girls.ca",
 "Access-Control-Allow-Headers":"authorization, apikey, content-type",
 "Access-Control-Allow-Methods":"GET, POST, OPTIONS",
 "Content-Type":"application/json","Cache-Control":"no-store"
};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const validOrigin=(s:string)=>!s||s==="https://caledonunited2018girls.ca"||s==="https://www.caledonunited2018girls.ca";
function tokenAal(token:string) {
 try {
  const part=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
  return JSON.parse(atob(part.padEnd(Math.ceil(part.length/4)*4,"="))).aal;
 }catch{return null;}
}
type MailItem = {
 id:string;kind:string;source_id:string;recipient_email:string;subject:string;
 body_text:string;status:string;attempts:number;created_at:string;
};
Deno.serve(async (req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers});
 if(!["GET","POST"].includes(req.method))return reply({error:"Method not allowed"},405);
 if(!validOrigin(req.headers.get("Origin")||""))return reply({error:"Unapproved origin"},403);
 try {
  const url=Deno.env.get("SUPABASE_URL")||"";
  const service=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  const publishable=JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")||"{}").default||Deno.env.get("SUPABASE_ANON_KEY")||"";
  if(!url||!service||!publishable)throw new Error("Database connection unavailable");
  const bearer=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
  const isService=Boolean(bearer&&bearer===service);
  if(!isService){
   if(!bearer)return reply({error:"Sign in first"},401);
   const client=createClient(url,publishable,{global:{headers:{Authorization:"Bearer "+bearer}},auth:{persistSession:false,autoRefreshToken:false}});
   const auth=await client.auth.getUser(bearer);
   if(auth.error||!auth.data.user)return reply({error:"Invalid session"},401);
   if(tokenAal(bearer)!=="aal2")return reply({error:"Manager MFA required"},403);
   const roles=await client.from("user_roles").select("role").eq("user_id",auth.data.user.id);
   if(roles.error||!roles.data?.some(x=>x.role==="manager"||x.role==="admin"))
    return reply({error:"Manager access required"},403);
  }
  const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const apiKey=Deno.env.get("RESEND_API_KEY")||"";
  const from=Deno.env.get("NOTIFICATION_FROM")||"";
  const ready=apiKey.startsWith("re_")&&from.includes("@")&&!from.includes("@resend.dev");
  if(req.method==="GET"){
   if(isService)return reply({error:"Manager session required for reporting"},403);
   const result=await db.from("notification_outbox")
    .select("id,kind,subject,recipient_email,status,attempts,last_error,created_at,accepted_at,delivered_at")
    .order("created_at",{ascending:false}).limit(100);
   if(result.error)throw result.error;
   return reply({provider_configured:ready,items:result.data||[],
     warning:ready?null:"Email provider not yet configured: pending notifications remain saved."});
  }
  let input:Record<string,unknown>={};
  try{input=await req.json();}catch{return reply({error:"Invalid request"},400);}
  const id=String(input.id||""),sourceId=String(input.source_id||"");
  if(!uuid.test(id)&&!uuid.test(sourceId))return reply({error:"Notification id required"},400);
  let query=db.from("notification_outbox").select("*").limit(1);
  query=uuid.test(id)?query.eq("id",id):query.eq("source_id",sourceId);
  const found=await query.maybeSingle();
  if(found.error)throw found.error;
  if(!found.data)return reply({status:"not_found"},404);
  const item=found.data as MailItem;
  if(["account_invite","account_recovery"].includes(item.kind))
   return reply({error:"Resend this message from Accounts & Invites to generate a fresh private link."},409);
  if(["accepted","delivered","bounced"].includes(item.status))
   return reply({status:item.status,already_processed:true});
  if(!["queued","needs_setup","failed"].includes(item.status))
   return reply({status:item.status,already_processing:true});
  if(item.attempts>=5)return reply({status:"failed",error:"Maximum retries reached"},409);
  if(!ready){
   await db.from("notification_outbox").update({status:"needs_setup",last_error:"Verified Resend sender and RESEND_API_KEY required",updated_at:new Date().toISOString()})
    .eq("id",item.id).in("status",["queued","failed","needs_setup"]);
   return reply({status:"needs_setup",provider_configured:false});
  }
  const now=new Date().toISOString();
  const claim=await db.from("notification_outbox").update({
   status:"sending",attempts:item.attempts+1,last_attempt_at:now,updated_at:now,last_error:null
  }).eq("id",item.id).eq("status",item.status).eq("attempts",item.attempts)
    .select("*").maybeSingle();
  if(claim.error)throw claim.error;
  if(!claim.data)return reply({status:"already_processing"});
  let providerId="";
  try {
   const resp=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json","Idempotency-Key":"cufc-"+item.id},
    body:JSON.stringify({
     from, to:[item.recipient_email],subject:item.subject,text:item.body_text
    }),
    signal:AbortSignal.timeout(12000)
   });
   const data=await resp.json().catch(()=>({}));
   if(!resp.ok||!data.id)throw new Error("Resend HTTP "+resp.status+": "+String(data.message||"Provider rejected message").slice(0,180));
   providerId=String(data.id);
  }catch(e){
   const message=e instanceof Error?e.message:"Provider request failed";
   await db.from("notification_outbox").update({
    status:"failed",last_error:message.slice(0,300),updated_at:new Date().toISOString()
   }).eq("id",item.id).eq("status","sending");
   return reply({status:"failed",provider_configured:true,error:"Provider did not accept the email"});
  }
  const updated=await db.from("notification_outbox").update({
   status:"accepted",provider_message_id:providerId,accepted_at:new Date().toISOString(),
   last_error:null,updated_at:new Date().toISOString()
  }).eq("id",item.id).eq("status","sending");
  if(updated.error)throw updated.error;
  return reply({status:"accepted",provider_configured:true,delivered:false});
 }catch(e){
  return reply({error:e instanceof Error?e.message:"Notification service unavailable"},500);
 }
});