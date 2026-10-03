const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
function load(relative, deps = {}) {
  const filename = path.resolve(relative);
  const source = fs.readFileSync(filename,"utf8");
  const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const mod = new Module(filename,module);
  mod.filename=filename; mod.paths=module.paths;
  mod.require=name=>Object.prototype.hasOwnProperty.call(deps,name)?deps[name]:require(name);
  mod._compile(js,filename);
  return mod.exports;
}
const {teamSquad}=load("lib/team-squad.ts");
const {managementModules}=load("lib/management-modules.ts");
const {moduleConfigs}=load("lib/management-config.ts",{"@/lib/training-plans":load("lib/training-plans.ts")});
assert.equal(teamSquad.length,9);
assert.equal(new Set(teamSquad.map(p=>p.recordId)).size,9);
assert.equal(new Set(managementModules.map(m=>m.label)).size,21);
for(const item of managementModules){
  if(item.href.startsWith("/admin/modules/"))assert.ok(moduleConfigs[item.href.split("/").pop()],item.label);
  else {
    const [route,hash]=item.href.split("#");
    const source=fs.readFileSync(path.join("app",route.slice(1),"page.tsx"),"utf8");
    if(hash && hash!=="families")assert.ok(source.includes('id="'+hash+'"'),item.label);
  }
}
const makeClient = (scenario) => {
  const writes=[];
  const client={auth:{
    getUser:async()=>({data:{user:scenario==="signed-out"?null:{id:"manager"}},error:null}),
    mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:scenario==="aal1"?"aal1":"aal2"},error:null})}
  },from(table){
    const chain={
      select(){return chain;},eq(){return chain;},ilike(){return chain;},
      upsert(row){writes.push({table,row});return chain;},
      single:async()=>({data:{id:teamSquad[0].recordId,active:true},error:scenario==="write-fails"?{message:"Permission denied"}:null}),
      then(resolve,reject){
        const data=table==="user_roles"?[{role:scenario==="parent"?"parent_player":"admin"}]:
        scenario==="existing"?[{id:"existing-player",first_name:"Seva",active:true}]:
        scenario==="ambiguous"?[{id:"one",active:true},{id:"two",active:true}]:
        scenario==="inactive"?[{id:"one",active:false}]:[];
        return Promise.resolve({data,error:scenario==="write-fails"&&writes.length?{message:"Permission denied"}:null}).then(resolve,reject);
      }
    };return chain;
  }};
  return {client,writes};
};
const vm=require("node:vm");
const handlers={}, stored=[];
let cacheControl="";
vm.runInNewContext(fs.readFileSync("public/sw.js","utf8"),{
  URL,
  self:{location:{origin:"https://preview.example"},addEventListener:(event,handler)=>handlers[event]=handler,skipWaiting(){},clients:{claim(){}}},
  caches:{open:async()=>({addAll:async()=>{},put:async(req)=>stored.push(req.url)}),match:async()=>null},
  fetch:async()=>({ok:true,headers:{get:()=>cacheControl},clone(){return this;}})
});
async function checkCache(url,auth=false){
  let response;const waits=[];
  handlers.fetch({request:{method:"GET",url,headers:{has:(name)=>auth&&name==="authorization"}},respondWith(p){response=p;},waitUntil(p){waits.push(p);}});
  if(response)await response;
  await Promise.all(waits);
  return Boolean(response);
}

(async()=>{
  for(const scenario of ["signed-out","parent","aal1","existing","new","ambiguous","inactive","write-fails"]){
    const {client,writes}=makeClient(scenario);
    const helper=load("lib/management-access.ts",{"@/lib/supabase":{supabase:client},"@/lib/team-squad":{teamSquad}});
    if(["signed-out","parent","aal1","ambiguous","inactive","write-fails"].includes(scenario)){
      await assert.rejects(()=>helper.resolveSquadPlayer("squad:Seva"));
      if(scenario!=="write-fails")assert.equal(writes.length,0);
    } else {
      const id=await helper.resolveSquadPlayer("squad:Seva");
      assert.equal(id,scenario==="existing"?"existing-player":teamSquad[0].recordId);
      assert.equal(writes.length,scenario==="existing"?0:1);
      if(writes.length){assert.equal(writes[0].row.last_name,"");assert.equal(writes[0].row.jersey_number,6);}
    }
    console.log("Squad linking "+scenario+": passed");
  }
  for(const url of ["https://preview.example/portal","https://preview.example/admin/manage","https://preview.example/api/kit-pricing","https://project.supabase.co/functions/v1/parent-dashboard","https://preview.example/roster?_rsc=1"]){
    assert.equal(await checkCache(url),false);
  }
  assert.equal(await checkCache("https://preview.example/roster",true),false);
  cacheControl="private, no-store";
  await checkCache("https://preview.example/roster");
  assert.equal(stored.length,0);
  cacheControl="public";
  await checkCache("https://preview.example/roster");
  assert.equal(stored.length,1);
  console.log("Private/authenticated responses excluded from offline cache: passed");
  const priceSource=fs.readFileSync("app/api/kit-pricing/route.ts","utf8");
  assert.ok(priceSource.includes('["parent_player", "manager", "admin"]'));
  console.log("All management module destinations and member-pricing role: passed");
})().catch(error=>{console.error(error);process.exitCode=1;});
