import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
export function tokenAal(token:string){try{const s=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(s.padEnd(Math.ceil(s.length/4)*4,'='))).aal;}catch{return null;}}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 try{
  const auth=req.headers.get('Authorization');if(!auth?.startsWith('Bearer '))return reply({error:'Please sign in'},401);
  const url=Deno.env.get('SUPABASE_URL')!;
  const key=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}').default||Deno.env.get('SUPABASE_ANON_KEY')!;
  const client=createClient(url,key,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
  const current=await client.auth.getUser(auth.slice(7));if(current.error||!current.data.user)return reply({error:'Invalid session'},401);
  const roles=await client.from('user_roles').select('role').eq('user_id',current.data.user.id);
  if(roles.error||!roles.data?.some((r:{role:string})=>r.role==='admin')||tokenAal(auth.slice(7))!=='aal2')return reply({error:'Administrator MFA session required'},403);
  const {action,input={}}=await req.json();
  if(['list','role','cancel'].includes(action)){const r=await client.rpc('manage_team_accounts',{action,input});if(r.error)throw r.error;return reply(r.data);}
  if(!['invite','resend','resend_invite'].includes(action))return reply({error:'Unsupported account action'},400);
  const origin=req.headers.get('Origin')||'';
  const allowed=[Deno.env.get('SITE_URL')||'https://caledon-u9-girls-2026.netlify.app','https://caledonunited2018girls.ca','https://www.caledonunited2018girls.ca',...(Deno.env.get('ALLOWED_ORIGINS')||'').split(',')];
  if(!allowed.includes(origin))return reply({error:'Use the approved team website'},403);
  const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  let email=String(input.email||'').trim().toLowerCase(),name=String(input.full_name||'').trim().slice(0,140);
  let type:'invite'|'recovery'='invite';
  if(action==='resend_invite'){
   const result=await client.rpc('manage_team_accounts',{action:'list',input:{}});
   if(result.error)throw new Error(result.error.message);
   const invitation=result.data.invites.find((row:{id:string;status:string;expires_at:string})=>
    row.id===input.id && row.status==='pending' && Date.parse(row.expires_at)>Date.now());
   if(!invitation)return reply({error:'Only pending, unexpired invitations can be resent.'},409);
   email=invitation.email;
   name=invitation.name||'';
   if(result.data.users.some((user:{email:string|null;confirmed_at:string|null})=>
    user.email?.toLowerCase()===email.toLowerCase() && user.confirmed_at)){
    return reply({error:'This account is already activated.'},409);
   }
  }else if(action==='resend'){
   const account=await admin.auth.admin.getUserById(String(input.user_id||''));
   if(account.error)throw account.error;
   email=account.data.user.email||'';
   name=String(account.data.user.user_metadata?.full_name||'');
   if(account.data.user.email_confirmed_at)type='recovery';
  }else{
   const result=await client.rpc('manage_team_accounts',{action:'invite',input:{email,full_name:name,role:input.role}});
   if(result.error)throw result.error;
  }
  if(!email)return reply({error:'Account has no email address.'},400);
  const id=crypto.randomUUID();
  const subject=type==='invite'?'Activate your Caledon United FC team account':'Set up your Caledon United FC account password';
  const apiKey=Deno.env.get('RESEND_API_KEY')||'';
  const from=Deno.env.get('NOTIFICATION_FROM')||'';
  const configured=apiKey.startsWith('re_')&&from.includes('@')&&!from.includes('@resend.dev');
  const queued=await admin.from('notification_outbox').insert({
   id,event_key:'account-mail:'+id,kind:type==='invite'?'account_invite':'account_recovery',
   source_id:id,recipient_email:email,subject,body_text:'Private account email',
   status:configured?'sending':'needs_setup',attempts:configured?1:0
  });
  if(queued.error)throw new Error('Unable to record the account notification.');
  if(!configured)return reply({email_sent:false,message:'Resend is not configured. The notification tracker records this attempt. Use Accounts & Invites to resend after setup.'});

  let providerId:string|undefined;
  try{
   const generated=await admin.auth.admin.generateLink({
    type,email,options:{data:{full_name:name},redirectTo:origin+'/auth/finish'}
   });
   if(generated.error||!generated.data.properties.hashed_token||
      (type==='invite'&&generated.data.user.email_confirmed_at))throw new Error('Unable to prepare account link.');
   const link=origin+'/auth/finish#type='+type+'&token_hash='+encodeURIComponent(generated.data.properties.hashed_token);
   const sent=await fetch('https://api.resend.com/emails',{
    method:'POST',headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json','Idempotency-Key':'cufc-'+id},
    body:JSON.stringify({from,to:[email],subject,text:subject+' using this single-use link:\n\n'+link+'\n\nIf you did not expect this email, you can ignore it.'}),
    signal:AbortSignal.timeout(12000)
   });
   const result=await sent.json().catch(()=>null);
   if(sent.ok&&typeof result?.id==='string')providerId=result.id;
  }catch{
   // The private link and provider response stay out of the tracker and logs.
  }
  const status=providerId?'accepted':'failed';
  const updated=await admin.from('notification_outbox').update({
   status,provider_message_id:providerId??null,accepted_at:providerId?new Date().toISOString():null,
   updated_at:new Date().toISOString(),last_error:providerId?null:'Account email acceptance could not be confirmed.'
  }).eq('id',id).eq('status','sending');
  if(updated.error)throw new Error('Unable to record the final email status. Check Resend before retrying.');
  return reply({email_sent:Boolean(providerId),message:providerId
   ?'Resend accepted the email. Check Email Notifications for delivery updates.'
   :'Email acceptance could not be confirmed. Check Email Notifications before resending.'});
 }catch(e){return reply({error:e instanceof Error?e.message:'Unable to manage users'},400);}
});
