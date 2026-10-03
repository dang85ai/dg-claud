import {createClient} from 'npm:@supabase/supabase-js@2.95.0';
import {actorFromRoles} from './permissions.mjs';
import {handleMedia,cors} from './handler.mjs';
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  const url=Deno.env.get('SUPABASE_URL')!;
  const key=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')!).default;
  const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')!).default;
  const auth=req.headers.get('Authorization');
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const user=createClient(url,key,{global:{headers:auth?{Authorization:auth}:{}},auth:{persistSession:false,autoRefreshToken:false}});
  let actor=null;
  if(auth){
   if(!auth.startsWith('Bearer '))throw new Error('Please sign in.');
   const token=auth.slice(7);const verified=await user.auth.getUser(token);
   if(verified.error||!verified.data.user)throw new Error('Invalid session. Please sign in.');
   const roles=await admin.from('user_roles').select('role').eq('user_id',verified.data.user.id);if(roles.error)throw roles.error;
   // Read claims only after getUser verifies the signature/session. Never trust user_metadata.
   const claims=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
   actor=actorFromRoles(verified.data.user.id,(roles.data??[]).map(r=>r.role),claims.aal);
  }
  const site=await admin.from('site_settings').select('value').eq('key','site_public').maybeSingle();if(site.error)throw site.error;
  return await handleMedia(req,{actor,user,admin,sitePublic:site.data?.value===true,upload:(body:FormData)=>fetch(url+'/functions/v1/media-upload',{method:'POST',headers:{Authorization:auth!,apikey:key},body})});
 }catch(e){const message=e instanceof Error?e.message:'Unable to load media.';return new Response(JSON.stringify({error:message,mfa_required:message.includes('multi-factor')}),{status:message.includes('session')||message.includes('sign in')?401:403,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});}
});
