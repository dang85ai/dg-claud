const assert=require("node:assert/strict");
const fs=require("node:fs");
const Module=require("node:module");
const ts=require("typescript");
function load(path,deps={}){
 const source=fs.readFileSync(path,"utf8");
 const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const mod=new Module(path,module);mod.require=n=>deps[n]??require(n);mod._compile(code,path);return mod.exports;
}
const modules=load("lib/management-modules.ts").managementModules;
const nav=load("lib/portal-navigation.ts",{"@/lib/management-modules":{managementModules:modules}});
assert.equal(nav.navigationForRoles([]).family.length,0);
assert.equal(nav.navigationForRoles(["sponsor"]).management.length,0);
assert.equal(nav.navigationForRoles(["parent_player"]).management.length,0);
assert.equal(nav.navigationForRoles(["photographer"]).management.length,0);
assert.equal(nav.navigationForRoles(["manager"]).management.length,modules.length+1);
assert.equal(nav.navigationForRoles(["admin"]).management.length,modules.length+1);
for(const link of nav.familyLinks){
 const [url,hash]=link.href.split("#");
 if(url.startsWith("/portal/activity/"))assert.ok(fs.readFileSync("app/portal/activity/[section]/page.tsx","utf8").includes(url.split("/").pop()+':'));
 else if(hash)assert.ok(fs.readFileSync(url==="/portal"?"components/PortalSchedule.tsx":"app/portal/tools/page.tsx","utf8").includes('id="'+hash+'"'));
}
assert.equal(nav.activePortalLink("/portal","/portal/activity/media"),false);
assert.equal(nav.activePortalLink("/portal/tools#photo","/portal/tools","#photo"),true);
console.log("Role navigation, family destinations and active states passed.");

function handler(path,roles,aal="aal2"){
 let callback;const writes=[];
 const row={id:"test-id",guardian_id:"test-guardian",exif_stripped:true,processed_private_path:"private.jpg",consent_reviewed:false};
 const client={auth:{getUser:async()=>({data:{user:{id:"test-user"}},error:null})},from(table){
   const q={select(){return q;},eq(){return q;},in(){return q;},is(){return q;},order(){return q;},limit(){return q;},
   update(value){writes.push({table,value});return q;},insert(value){writes.push({table,value});return q;},upsert(value){writes.push({table,value});return q;},
   single:async()=>({data:row,error:null}),maybeSingle:async()=>({data:table==="guardians"?{id:"test-guardian"}:row,error:null}),
   then(resolve){return Promise.resolve({data:table==="user_roles"?roles.map(role=>({role})):[],error:null}).then(resolve);}};
   return q;
 }};
 const code=fs.readFileSync(path,"utf8").replace(/^import .*supabase-js.*;$/m,"");
 const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 new Function("createClient","Deno",js)(()=>client,{env:{get:n=>n==="SUPABASE_URL"?"https://test.invalid":'{"default":"test-key"}'},serve:fn=>callback=fn});
 const token="x."+Buffer.from(JSON.stringify({aal})).toString("base64url")+".x";
 return {writes,send:async(action,input={},authenticated=true)=>callback(new Request("https://test.invalid",{method:"POST",headers:{"Content-Type":"application/json",...(authenticated?{Authorization:"Bearer "+token}:{})},body:JSON.stringify({action,input})}))};
}
(async()=>{
 const adminPath="supabase/functions/admin-actions/index.ts";
 for(const [roles,aal,status] of [[["parent_player"],"aal1",403],[["manager"],"aal1",403],[["manager"],"aal2",200]]){
   const h=handler(adminPath,roles,aal);const res=await h.send("media.review",{id:"test-id",status:"approved",consent_reviewed:true,processed_private_path:"tampered-path"});
   assert.equal(res.status,status);
   if(status!==200)assert.equal(h.writes.length,0);
   else{const media=h.writes.find(w=>w.table==="media_items");assert.equal(media.value.visibility,"private_team");assert.equal(media.value.processed_private_path,undefined);assert.equal(h.writes.find(w=>w.table==="profile_photo_requests").value.status,"approved");}
 }
 const noConsent=handler(adminPath,["manager"]);assert.equal((await noConsent.send("media.review",{id:"test-id",status:"approved",consent_reviewed:false})).status,400);assert.equal(noConsent.writes.length,0);
 const parentPath="supabase/functions/parent-actions/index.ts";
 const missingAuth=handler(parentPath,["parent_player"]);assert.equal((await missingAuth.send("attendance.set",{},false)).status,401);assert.equal(missingAuth.writes.length,0);
 const badAttendance=handler(parentPath,["parent_player"]);assert.equal((await badAttendance.send("attendance.set",{status:"invalid"})).status,400);assert.equal(badAttendance.writes.length,0);
 const signedConsent=handler(parentPath,["parent_player"]);assert.equal((await signedConsent.send("form.submit",{form_key:"photo_consent",signature_name:"Test",player_id:"test-player",submitted_data:{private_team_photo_consent:false}})).status,200);assert.equal(signedConsent.writes.find(w=>w.table==="consents").value.private_team_photo_consent,false);
 console.log("Handler authentication, manager MFA, consent review, profile request sync and private-path preservation passed.");
 const pdf=fs.readFileSync("supabase/functions/form-pdf/index.ts","utf8");
 const helpers=pdf.slice(pdf.indexOf("function printable"),pdf.indexOf("Deno.serve"));
 const helpersJs=ts.transpileModule(helpers,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 const p=new Function(helpersJs+";return {printable,labelize};")();
 assert.equal(p.printable("sports   permissions"),"sports permissions");
 assert.equal(p.labelize("signature_name"),"Signature Name");
 console.log("Signed PDF text formatting passed.");
})().catch(e=>{console.error(e);process.exit(1)});
