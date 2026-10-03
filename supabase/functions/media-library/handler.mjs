import {MediaError,requireAdmin,requireAlbumOwner,requirePhotoOwner,validatePatch,ids} from './permissions.mjs';
export const cors={ 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const fields='id,album_id,uploader_id,caption,tags,filename,status,consent_reviewed,public_consent_reviewed,exif_stripped,created_at,taken_at,position,updated_at,deleted_at';
async function result(query){const r=await query;if(r.error)throw new MediaError(r.error.message,400);return r.data;}
const clean=(value,max)=>String(value??'').trim().slice(0,max);
function date(value){if(!value)return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value)))throw new MediaError('Choose a valid event date.',400);return value;}
const uuid=(value)=>{if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value??''))throw new MediaError('Invalid record ID.',400);return value;};
export async function handleMedia(req,{actor,user,admin,upload,sitePublic}){
 try{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  const url=new URL(req.url),path=url.pathname.replace(/^.*\/media-library\/?/,'/'),parts=path.split('/').filter(Boolean),method=req.method;
  const authenticated=()=>{if(!actor)throw new MediaError('Please sign in.',401);};
  const adminOnly=()=>{authenticated();requireAdmin(actor);};
  const db=actor?user:admin;
  const album=async id=>{const a=await result(db.from('albums').select('*').eq('id',uuid(id)).is('deleted_at',null).maybeSingle());if(!a||(!actor&&(!sitePublic||a.visibility!=='public')))throw new MediaError('Album unavailable.',404);return a;};
  const photo=async id=>{const m=await result(db.from('media_items').select('*').eq('id',uuid(id)).is('deleted_at',null).maybeSingle());if(!m)throw new MediaError('Photo unavailable.',404);if(!actor){const a=await album(m.album_id);if(!a||m.status!=='approved'||!m.public_consent_reviewed||!m.consent_reviewed||!m.exif_stripped)throw new MediaError('Photo unavailable.',404);}return m;};
  const action=async (name,input)=>result(admin.rpc('media_library_action',{p_actor:actor.id,p_admin:actor.admin,p_action:name,p_input:input}));
  const albumInput=(body,current={})=>{
   validatePatch(body,['title','description','event_date','event_id','visibility','allow_contributions','cover_media_id']);
   const a={...current,...body};if(!clean(a.title,120))throw new MediaError('Album title is required.',400);
   if(!['private','parents','shared','public'].includes(a.visibility??'private'))throw new MediaError('Invalid visibility.',400);
   return {title:clean(a.title,120),description:clean(a.description,2000),event_date:date(a.event_date),event_id:a.event_id?uuid(a.event_id):null,visibility:a.visibility??'private',allow_contributions:a.allow_contributions!==false,cover_media_id:a.cover_media_id?uuid(a.cover_media_id):null};
  };
  const safePhoto=m=>({...Object.fromEntries(fields.split(',').map(k=>[k,m[k]])),can_edit:!!actor&&(actor.admin||m.uploader_id===actor.id)});
  if(parts[0]==='albums'&&parts.length===1&&method==='GET'){
   if(!actor&&!sitePublic)return json({albums:[],actor:null});
   const albums=await result(db.from('albums').select('*').is('deleted_at',null).order('updated_at',{ascending:false}));
   const visible=actor?albums:albums.filter(a=>a.visibility==='public');
   const photos=visible.length?await result(db.from('media_items').select(fields).is('deleted_at',null).in('album_id',visible.map(a=>a.id))):[];
   const ownerIds=[...new Set(visible.map(a=>a.created_by).filter(Boolean))];
   const owners=actor&&ownerIds.length?await result(admin.from('profiles').select('id,display_name').in('id',ownerIds)):[];
   return json({actor,albums:visible.map(a=>{const p=photos.filter(m=>m.album_id===a.id&&(actor||(m.status==='approved'&&m.consent_reviewed&&m.public_consent_reviewed&&m.exif_stripped)));const cover=p.find(m=>m.id===a.cover_media_id)||p[0];return {...a,owner_name:owners.find(o=>o.id===a.created_by)?.display_name||(actor?.id===a.created_by?'You':'Team contributor'),photo_count:p.length,cover_id:cover?.id??null,can_edit:!!actor&&(actor.admin||a.created_by===actor.id),can_upload:!!actor&&(actor.admin||a.created_by===actor.id||a.allow_contributions)};})});
  }
  if(parts[0]==='albums'&&parts.length===1&&method==='POST'){
   authenticated();const input=albumInput(await req.json());if(!actor.admin&&!['private','parents'].includes(input.visibility))throw new MediaError('Only admins can manage public or assigned sharing.');
   return json(await action('create',input),201);
  }
  if(parts[0]==='albums'&&parts.length>=2){
   const a=await album(parts[1]);
   if(parts.length===2&&method==='GET'){
    const photos=await result(db.from('media_items').select(fields).eq('album_id',a.id).is('deleted_at',null).order('position').order('created_at',{ascending:false}));
    return json({album:a,photos:photos.filter(m=>actor||(m.status==='approved'&&m.consent_reviewed&&m.public_consent_reviewed&&m.exif_stripped)).map(safePhoto)});
   }
   if(parts.length===2&&method==='PATCH'){authenticated();requireAlbumOwner(actor,a);return json(await action('edit',{...albumInput(await req.json(),a),id:a.id}));}
   if(parts.length===2&&method==='DELETE'){authenticated();requireAlbumOwner(actor,a);return json(await action('delete',{id:a.id}));}
   if(parts[2]==='photos'&&method==='POST'){
    authenticated();if(!actor.admin&&a.created_by!==actor.id&&!a.allow_contributions)throw new MediaError('Uploads are disabled in this album.');
    const form=await req.formData();const files=form.getAll('files');if(!files.length||files.length>20)throw new MediaError('Choose 1–20 photos per batch.',400);
    const outcomes=[];for(const file of files){if(!(file instanceof File)){outcomes.push({filename:'Unknown',error:'Invalid file.'});continue;}const body=new FormData();body.append('file',file);body.append('purpose','gallery');body.append('album_id',a.id);body.append('caption',clean(form.get('caption'),600));try{const response=await upload(body);const value=await response.json();outcomes.push(response.ok?{filename:file.name,media:value.media}:{filename:file.name,error:value.error||'Upload failed.'});}catch{outcomes.push({filename:file.name,error:'Connection interrupted. Retry this file.'});}}
    return json({results:outcomes});
   }
   if(parts[2]==='reorder'&&method==='PATCH'){adminOnly();const body=await req.json();validatePatch(body,['photo_ids']);return json(await action('reorder',{id:a.id,photo_ids:ids(body.photo_ids)}));}
   if(parts[2]==='sharing'&&method==='GET'){adminOnly();return json({recipients:await result(admin.from('album_recipients').select('user_id').eq('album_id',a.id)),groups:await result(admin.from('album_groups').select('group_id').eq('album_id',a.id))});}
   if(parts[2]==='sharing'&&method==='PATCH'){adminOnly();const b=await req.json();validatePatch(b,['user_ids','group_ids']);const check=v=>Array.isArray(v)&&v.length<=200?v.map(uuid):(()=>{throw new MediaError('Invalid recipients.',400);})();return json(await action('sharing',{id:a.id,user_ids:check(b.user_ids),group_ids:check(b.group_ids)}));}
  }
  if(parts[0]==='photos'&&parts[1]==='move'&&method==='POST'){adminOnly();const b=await req.json();validatePatch(b,['photo_ids','album_id']);await album(b.album_id);return json(await action('move',{id:b.album_id,photo_ids:ids(b.photo_ids)}));}
  if(parts[0]==='photos'&&parts.length===1&&method==='GET'){
   authenticated();let q=db.from('media_items').select(fields).is('deleted_at',null).order('created_at',{ascending:false});if(url.searchParams.get('scope')==='mine'||!actor.admin)q=q.eq('uploader_id',actor.id);return json({photos:(await result(q)).map(safePhoto)});
  }
  if(parts[0]==='photos'&&parts.length>=2){
   const m=await photo(parts[1]);
   if(parts[2]==='image'&&method==='GET'){
    if(!m.exif_stripped)throw new MediaError('Processed image unavailable.',404);
    const path=url.searchParams.get('thumbnail')==='1'?m.thumbnail_path:m.processed_private_path;
    if(!path)throw new MediaError('Processed image unavailable.',404);
    const blob=await result(admin.storage.from('team-media-private').download(path));
    return new Response(blob,{headers:{...cors,'Content-Type':'image/jpeg','Cache-Control':'no-store','Content-Disposition':`${url.searchParams.get('download')==='1'?'attachment':'inline'}; filename="${clean(m.filename,100).replace(/[^a-z0-9._-]/gi,'_')}.jpg"`,'X-Content-Type-Options':'nosniff'}});
   }
   if(parts[2]==='review'&&method==='PATCH'){adminOnly();const b=await req.json();validatePatch(b,['status','consent_reviewed','public_consent_reviewed']);if(!['approved','rejected'].includes(b.status))throw new MediaError('Invalid review.',400);return json(await action('review',{...b,id:m.id}));}
   if(parts.length===2&&method==='PATCH'){authenticated();requirePhotoOwner(actor,m);const b=await req.json();validatePatch(b,['caption','tags']);if(!Array.isArray(b.tags)||b.tags.length>12||b.tags.some(t=>typeof t!=='string'||t.length>40))throw new MediaError('Use up to 12 short tags.',400);return json(await action('photo_edit',{id:m.id,caption:clean(b.caption,600),tags:b.tags.map(t=>t.trim()).filter(Boolean)}));}
   if(parts.length===2&&method==='DELETE'){authenticated();requirePhotoOwner(actor,m);return json(await action('photo_delete',{id:m.id}));}
  }
  if(parts[0]==='sharing-options'&&method==='GET'){adminOnly();const roles=await result(admin.from('user_roles').select('user_id,role').in('role',['parent_player','admin','manager','photographer']));const people=await result(admin.from('profiles').select('id,display_name,full_name').in('id',[...new Set(roles.map(r=>r.user_id))]));const groups=await result(admin.from('media_groups').select('id,name'));const members=await result(admin.from('media_group_members').select('group_id,user_id'));return json({people:people.map(p=>({id:p.id,name:p.display_name||p.full_name||'Team member'})),groups:groups.map(g=>({...g,user_ids:members.filter(m=>m.group_id===g.id).map(m=>m.user_id)}))});}
  if(parts[0]==='groups'&&method==='POST'){adminOnly();const b=await req.json();validatePatch(b,['id','name','user_ids']);if(!clean(b.name,100)||!Array.isArray(b.user_ids)||b.user_ids.length>200)throw new MediaError('Enter a group name and valid members.',400);return json(await action('group',{id:b.id?uuid(b.id):null,name:clean(b.name,100),user_ids:b.user_ids.map(uuid)}));}
  if(parts[0]==='settings'&&method==='GET'){authenticated();const settings=await result(admin.from('site_settings').select('value').eq('key','media_parent_shared_enabled').maybeSingle());return json({parent_shared_enabled:settings?.value!==false});}
  if(parts[0]==='settings'&&method==='PATCH'){adminOnly();const b=await req.json();validatePatch(b,['parent_shared_enabled']);if(typeof b.parent_shared_enabled!=='boolean')throw new MediaError('Invalid setting.',400);await result(admin.from('site_settings').upsert({key:'media_parent_shared_enabled',value:b.parent_shared_enabled},{onConflict:'key'}));return json({ok:true});}
  throw new MediaError('Media endpoint not found.',404);
 }catch(e){return json({error:e instanceof Error?e.message:'Unable to complete media request.',mfa_required:String(e.message).includes('multi-factor')},e.status||500);}
}
