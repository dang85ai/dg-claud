import {createClient} from 'npm:@supabase/supabase-js@2.95.0';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(!['GET','POST'].includes(req.method))return respond({error:'Method not allowed'},405);
 try{
  const url=Deno.env.get('SUPABASE_URL')!;
  const key=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}').default||Deno.env.get('SUPABASE_ANON_KEY')!;
  const authorization=req.headers.get('Authorization');
  const client=createClient(url,key,{global:{headers:authorization?{Authorization:authorization}:{}},auth:{persistSession:false,autoRefreshToken:false}});
  const params=new URL(req.url).searchParams;const privateView=params.get('private')==='true';
  if(privateView||req.method==='POST'){
   if(!authorization?.startsWith('Bearer '))return respond({error:'Please sign in'},401);
   const user=await client.auth.getUser(authorization.slice(7));if(user.error||!user.data.user)return respond({error:'Session expired. Please sign in again.'},401);
  }
  if(req.method==='POST'){
   if(Number(req.headers.get('content-length')||0)>16000)return respond({error:'Request too large'},413);
   const body=await req.json();if(typeof body.action!=='string'||!body.input||typeof body.input!=='object')return respond({error:'Invalid request'},400);
   const result=await client.rpc('roster_action',{action:body.action,input:body.input});if(result.error)throw result.error;return respond(result.data);
  }
  const result=await client.rpc('roster_snapshot',{private_view:privateView});if(result.error)throw result.error;
  const photo=params.get('photo');
  if(photo){
   // Public avatars are re-authorized on every request. No storage path or signed URL is exposed.
   if(!result.data.players.some((p:{photo_id:string|null})=>p.photo_id===photo))return respond({error:'Photo unavailable'},404);
   const secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
   const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
   const media=await admin.from('media_items').select('processed_private_path').eq('id',photo).single();if(media.error)throw media.error;
   const image=await admin.storage.from('team-media-private').download(media.data.processed_private_path);if(image.error)throw image.error;
   return new Response(image.data,{headers:{...headers,'Content-Type':'image/jpeg','X-Content-Type-Options':'nosniff'}});
  }
  return respond(result.data);
 }catch(error){const message=error instanceof Error?error.message:typeof error?.message==='string'?error.message:'Unable to load roster';return respond({error:message,mfa_required:message.includes('multi-factor')},message.includes('required')||message.includes('Only')||message.includes('Manager')?403:400);}
});
