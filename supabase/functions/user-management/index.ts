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
  if(!['invite','resend'].includes(action))return reply({error:'Unsupported account action'},400);
  const origin=req.headers.get('Origin')||'';
  const allowed=[Deno.env.get('SITE_URL')||'https://caledon-u9-girls-2026.netlify.app',...(Deno.env.get('ALLOWED_ORIGINS')||'').split(',')];
  if(!allowed.includes(origin))return reply({error:'Use the approved team website'},403);
  const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  let email=String(input.email||'').trim().toLowerCase(),name=String(input.full_name||'').trim().slice(0,140);
  if(action==='resend'){
   const u=await admin.auth.admin.getUserById(String(input.user_id||''));if(u.error)throw u.error;
   if(u.data.user.email_confirmed_at){
    const email=u.data.user.email;if(!email)throw new Error('Account has no email address');
    const sent=await admin.auth.resetPasswordForEmail(email,{redirectTo:origin+'/auth/finish'});
    const log=await client.rpc('manage_team_accounts',{action:'delivery',input:{email,outcome:sent.error?'access_email_failed':'access_email_accepted'}});if(log.error)throw new Error(log.error.message);
    if(sent.error)throw new Error('Access email was not sent: '+sent.error.message);
    return reply({message:'This account is already activated. A password setup email was accepted for sending to '+email+'. Their password changes only if they use the link.',email_sent:true});
   }
   email=u.data.user.email||'';name=String(u.data.user.user_metadata?.full_name||'');
  }else{const r=await client.rpc('manage_team_accounts',{action:'invite',input:{email,full_name:name,role:input.role}});if(r.error)throw r.error;}
  // Authentication links are never returned for activated accounts.
  const sent=await admin.auth.admin.inviteUserByEmail(email,{data:{full_name:name},redirectTo:origin+'/auth/finish'});
  if(!sent.error){await client.rpc('manage_team_accounts',{action:'delivery',input:{email,outcome:'email_accepted'}});return reply({message:'Invitation email accepted for sending. Check the inbox and spam folder.',email_sent:true});}
  const generated=await admin.auth.admin.generateLink({type:'invite',email,options:{data:{full_name:name},redirectTo:origin+'/auth/finish'}});
  if(generated.error)throw new Error('Invitation email failed: '+sent.error.message+'. '+generated.error.message);
  if(generated.data.user.email_confirmed_at)throw new Error('Account is already activated. Use password recovery.');
  const hash=generated.data.properties.hashed_token;if(!hash)throw new Error('Unable to generate an activation link');
  const log=await client.rpc('manage_team_accounts',{action:'delivery',input:{email,outcome:'email_failed_manual_link'}});if(log.error)throw log.error;
  return reply({email_sent:false,account_id:generated.data.user.id,message:'Email was not sent: '+sent.error.message+'. Share the private activation link directly with this recipient.',activation_url:origin+'/auth/finish#type=invite&token_hash='+encodeURIComponent(hash)});
 }catch(e){return reply({error:e instanceof Error?e.message:'Unable to manage users'},400);}
});
