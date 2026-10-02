const assert=require('node:assert/strict');
const fs=require('node:fs');const Module=require('node:module');const ts=require('typescript');
function load(path,deps){const mod=new Module(path,module);mod.require=n=>deps?.[n]??require(n);mod._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,path);return mod.exports;}
const {parentTasks}=load('lib/parent-tasks.ts');
const now=Date.parse('2026-10-02T16:00:00Z');const event=(id,days,status='scheduled')=>({id,starts_at:new Date(now+days*86400000).toISOString(),status});
const tasks=parentTasks({players:[{id:'a',first_name:'A'},{id:'b',first_name:'B'}],events:[event('past',-1),event('cancelled',0.1,'cancelled'),event('next',1),event('later',8)],attendance:[{player_id:'a',event_id:'next',status:'attending'},{player_id:'b',event_id:'next',status:'unknown'}],kit_orders:[{payment_status:'paid'},{payment_status:'unpaid'},{payment_status:'partial'},{payment_status:'refunded'}]},now);
assert.equal(tasks.nextEvent.id,'next');assert.equal(tasks.attendanceReplies,1);assert.equal(tasks.ordersToReview,2);assert.equal(parentTasks({players:[],events:[event('next',1)],attendance:[],kit_orders:[]},now).attendanceReplies,0);
function setup({role='manager',aal='aal2',existing=false,signedIn=true}={}){
 let callback;const calls=[];
 const query={select(){return this;},eq:async()=>({data:[{role}],error:null})};
 const client={auth:{getUser:async()=>({data:{user:signedIn?{id:'manager'}:null},error:null})},from:()=>query,rpc:async(name,input)=>{calls.push(['rpc',name,input]);return {data:'invite-id',error:null};}};
 const admin={auth:{admin:{listUsers:async()=>({data:{users:existing?[{id:'existing',email:'parent@example.com'}]:[]},error:null}),generateLink:async(input)=>{calls.push(['generate',input]);return {data:{properties:{hashed_token:'private-token'},user:{id:'new-parent'}},error:null};}}}};
 const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEYS:'{"default":"public"}',SUPABASE_SECRET_KEYS:'{"default":"secret"}'};
 global.Deno={env:{get:n=>env[n]},serve:fn=>callback=fn};let count=0;
 const exports=load('supabase/functions/parent-onboarding/index.ts',{'npm:@supabase/supabase-js@2.95.0':{createClient:()=>count++===0?client:admin}});
 return {callback,calls,exports,token:'header.'+Buffer.from(JSON.stringify({aal})).toString('base64url')+'.signature'};
}
async function request(scenario,origin='https://caledon-u9-girls-2026.netlify.app'){
 const test=setup(scenario);const response=await test.callback(new Request('https://example.com',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+test.token,'Content-Type':'application/json'},body:JSON.stringify({email:'parent@example.com',full_name:'Parent'})}));return {...test,response,body:await response.json()};
}
(async()=>{
 for(const scenario of [{role:'parent_player'},{aal:'aal1'},{signedIn:false}]){const r=await request(scenario);assert.ok([401,403].includes(r.response.status));assert.equal(r.calls.length,0);}
 const untrusted=await request({},'https://attacker.example');assert.equal(untrusted.response.status,403);assert.equal(untrusted.calls.length,0);
 const existing=await request({existing:true});assert.equal(existing.body.existing,true);assert.equal(existing.calls.length,0);assert.equal(existing.body.activation_url,undefined);
 const invited=await request({});assert.equal(invited.response.status,200);assert.equal(invited.calls[0][1],'prepare_parent_activation');assert.equal(invited.calls[1][1].type,'invite');assert.equal(invited.body.activation_url,'https://caledon-u9-girls-2026.netlify.app/auth/finish#type=invite&token_hash=private-token');
 assert.equal(invited.exports.validOrigin('https://6abf92ed34f7282e15b18bc6--caledon-u9-girls-2026.netlify.app'),true);assert.equal(invited.exports.validOrigin('https://caledon-u9-girls-2026.netlify.app.evil.example'),false);
 console.log('Parent task counts, invitation authorization/MFA/origin, and existing-account protection passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});

