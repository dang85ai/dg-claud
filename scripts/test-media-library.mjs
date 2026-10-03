import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {actorFromRoles,canEditAlbum,canEditPhoto,canContribute,requireAdmin,ids} from '../supabase/functions/media-library/permissions.mjs';
import {handleMedia} from '../supabase/functions/media-library/handler.mjs';
const parent=actorFromRoles('11111111-1111-4111-8111-111111111111',['parent_player'],'aal1');
const admin=actorFromRoles('22222222-2222-4222-8222-222222222222',['admin'],'aal2');
const other='33333333-3333-4333-8333-333333333333',albumId='44444444-4444-4444-8444-444444444444',photoId='55555555-5555-4555-8555-555555555555';
assert.throws(()=>actorFromRoles(null,[],'aal1'));
assert.throws(()=>actorFromRoles(parent.id,['sponsor'],'aal1'));
assert.throws(()=>actorFromRoles(admin.id,['admin'],'aal1'));
assert.equal(actorFromRoles(admin.id,['manager'],'aal2').role,'admin');
assert.equal(actorFromRoles(other,['photographer'],'aal1').role,'parent');
assert.equal(canEditAlbum(parent,{created_by:parent.id}),true);
assert.equal(canEditAlbum(parent,{created_by:other}),false);
assert.equal(canEditAlbum(parent,{created_by:admin.id}),false);
assert.equal(canEditAlbum(admin,{created_by:other}),true);
assert.equal(canEditAlbum(admin,{created_by:other,deleted_at:'now'}),false);
assert.equal(canEditPhoto(parent,{uploader_id:parent.id}),true);
assert.equal(canEditPhoto(parent,{uploader_id:other}),false);
assert.equal(canEditPhoto(admin,{uploader_id:other}),true);
assert.equal(canContribute(parent,{created_by:other,allow_contributions:true},true),true);
assert.equal(canContribute(parent,{created_by:other,allow_contributions:false},true),false);
assert.equal(canContribute(parent,{created_by:other,allow_contributions:true},false),false);
assert.throws(()=>requireAdmin(parent));
assert.throws(()=>ids([photoId,photoId]));assert.throws(()=>ids(['not-an-id']));

// Exercise actual request routing, with a repository that exposes the other user's
// records. Ownership must be checked before any privileged RPC/storage operation.
let mutations=0;
function fake(row){const chain={select(){return chain},eq(){return chain},is(){return chain},maybeSingle(){return Promise.resolve({data:row,error:null})}};return {from(){return chain},rpc(){mutations++;return Promise.resolve({data:{ok:true},error:null})},storage:{from(){throw new Error('Unexpected storage access')}}};}
const base='https://example.test/functions/v1/media-library';
async function request(path,method,body,actor=parent,row={id:albumId,created_by:other,visibility:'parents',allow_contributions:true,uploader_id:other}){
 const database=fake(row);return handleMedia(new Request(base+path,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}),{actor,user:database,admin:database,sitePublic:true,upload:()=>{throw new Error('Unexpected upload')}});
}
for(const [path,method,body] of [
 ['/photos/move','POST',{photo_ids:[photoId],album_id:albumId}],
 ['/albums/'+albumId+'/reorder','PATCH',{photo_ids:[photoId]}],
 ['/albums/'+albumId+'/sharing','PATCH',{user_ids:[],group_ids:[]}],
 ['/groups','POST',{name:'Group',user_ids:[]}],
 ['/settings','PATCH',{parent_shared_enabled:false}],
 ['/photos/'+photoId+'/review','PATCH',{status:'approved',consent_reviewed:true}],
 ['/albums/'+albumId,'DELETE'],
 ['/albums/'+albumId,'PATCH',{title:'Hijack'}],
 ['/photos/'+photoId,'DELETE'],
 ['/photos/'+photoId,'PATCH',{caption:'Hijack',tags:[]}]
])assert.equal((await request(path,method,body)).status,403,path);
assert.equal(mutations,0,'Forbidden requests must not reach privileged writes');
assert.equal((await request('/photos/'+photoId,'PATCH',{caption:'Own caption',tags:['team']},parent,{id:photoId,uploader_id:parent.id})).status,200);
assert.equal((await request('/photos/'+photoId,'PATCH',{caption:'Own',tags:[],uploader_id:other},parent,{id:photoId,uploader_id:parent.id})).status,400,'Cannot reassign ownership');
assert.equal((await request('/photos/move','POST',{photo_ids:[photoId],album_id:albumId},admin)).status,200);
assert.equal((await request('/albums','POST',{title:'Own album',visibility:'private'},parent)).status,201);
assert.equal((await request('/albums','POST',{title:'Public exploit',visibility:'public'},parent)).status,403);
assert.ok((await request('/photos/'+photoId,'DELETE',undefined,null)).status>=400);
const ui=await readFile(new URL('../components/MediaLibrary.tsx',import.meta.url),'utf8');
assert.match(ui,/\{admin\?<><select[^]*Move to Album/,'Move controls must be inside admin role guard');
const sql=await readFile(new URL('../supabase/media-library.sql',import.meta.url),'utf8');
assert.match(sql,/revoke all on function public\.media_library_action[^]*from public,anon,authenticated/);
assert.match(sql,/drop policy albums_team_read/,'Broad team album policy must be replaced');
assert.match(sql,/app_private\.can_view_photo\(m\.id\)/,'Storage downloads must check photo and album access');
console.log('Media permission tests passed: role/MFA, ownership, forged IDs, field allowlists, admin-only organization, public visibility and storage boundaries.');
