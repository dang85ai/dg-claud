import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
export function validOrigin(origin:string){return origin==="https://caledon-u9-girls-2026.netlify.app"||/^https:\/\/[a-f0-9]{24}--caledon-u9-girls-2026\.netlify\.app$/.test(origin);}
export function tokenAal(token:string){try{const part=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(atob(part.padEnd(Math.ceil(part.length/4)*4,"="))).aal;}catch{return null;}}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers});
 if(req.method!=="POST")return response({error:"Method not allowed."},405);
 try{
  const auth=req.headers.get("Authorization");if(!auth?.startsWith("Bearer "))return response({error:"Please sign in."},401);
  const origin=req.headers.get("Origin")||"";if(!validOrigin(origin))return response({error:"Open the approved team website to create a parent invitation."},403);
  const url=Deno.env.get("SUPABASE_URL")!;const publishable=JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")||"{}").default||Deno.env.get("SUPABASE_ANON_KEY")!;
  const client=createClient(url,publishable,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
  const user=await client.auth.getUser(auth.slice(7));if(user.error||!user.data.user)return response({error:"Invalid or expired session."},401);
  const roles=await client.from("user_roles").select("role").eq("user_id",user.data.user.id);if(roles.error)throw roles.error;
  if(!roles.data?.some((r:{role:string})=>["manager","admin"].includes(r.role)))return response({error:"Manager access required."},403);
  if(tokenAal(auth.slice(7))!=="aal2")return response({error:"Multi-factor authentication is required.",mfa_required:true},403);
  const input=await req.json();const email=String(input.email||"").trim().toLowerCase();const full_name=String(input.full_name||"").trim().slice(0,100);
  if(email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!full_name)return response({error:"Enter the parent’s name and valid email."},400);
  const secret=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  // Never create a sign-in or reset link for an existing account.
  for(let page=1;page<=100;page++){
   const users=await admin.auth.admin.listUsers({page,perPage:100});if(users.error)throw users.error;
   const existing=users.data.users.find(u=>u.email?.toLowerCase()===email);
   if(existing)return response({existing:true,account_id:existing.id,message:"An account already exists. Ask the parent to sign in or use Forgot your password. No sign-in link was created."});
   if(users.data.users.length<100)break;
   if(page===100)throw new Error("Account search limit reached. Contact the administrator.");
  }
  const invite=await client.rpc("prepare_parent_activation",{invite_email:email,invite_full_name:full_name});if(invite.error)throw invite.error;
  const result=await admin.auth.admin.generateLink({type:"invite",email,options:{data:{full_name},redirectTo:origin+"/auth/finish"}});if(result.error)throw result.error;
  const hash=result.data.properties.hashed_token;if(!hash)throw new Error("Unable to prepare an activation link.");
  return response({existing:false,account_id:result.data.user.id,activation_url:origin+"/auth/finish#type=invite&token_hash="+encodeURIComponent(hash),message:"Parent account prepared. Share this private, single-use activation link directly with the parent. No email was sent. Child access still needs a verified Family Link."});
 }catch(error){return response({error:error instanceof Error?error.message:"Unable to prepare parent invitation."},400);}
});

