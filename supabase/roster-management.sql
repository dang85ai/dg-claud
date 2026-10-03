-- Additive roster upgrade. Existing player_guardians remains the approved many-to-many relationship.
alter table public.player_public_profiles add column if not exists field_slot text;
alter table public.player_public_profiles add column if not exists show_on_field boolean not null default false;
alter table public.player_public_profiles add column if not exists profile_media_id uuid references public.media_items(id) on delete set null;
create table public.roster_requests (
 id uuid primary key default gen_random_uuid(), requested_by uuid not null references auth.users(id),
 player_id uuid references public.players(id), kind text not null check(kind in ('link','name')),
 child_name text not null check(length(child_name) between 1 and 100), verification_info text not null default '' check(length(verification_info)<=1000),
 relationship text not null default 'parent' check(relationship in ('parent','guardian')),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 requested_at timestamptz not null default now(), reviewed_by uuid references auth.users(id), reviewed_at timestamptz
);
create index roster_requests_owner_idx on public.roster_requests(requested_by,status);
create index roster_requests_player_idx on public.roster_requests(player_id);
create index roster_requests_reviewer_idx on public.roster_requests(reviewed_by);
create unique index roster_requests_pending_name_idx on public.roster_requests(requested_by,player_id) where status='pending' and kind='name';
create table public.roster_formation (
 id text primary key check(id='team'), name text not null default '1-3-2-1' check(name in ('1-3-2-1','1-2-3-1','1-3-3-2','1-4-3-1')),
 show_names boolean not null default true, updated_at timestamptz not null default now()
);
insert into public.roster_formation(id) values('team');
alter table public.roster_requests enable row level security;
alter table public.roster_formation enable row level security;
revoke all on public.roster_requests,public.roster_formation from anon,authenticated;
grant select on public.roster_requests to authenticated;
grant select on public.roster_formation to anon,authenticated;
create policy roster_request_read on public.roster_requests for select to authenticated using(requested_by=(select auth.uid()) or app_private.is_admin_aal2());
create policy roster_formation_read on public.roster_formation for select to anon,authenticated using(true);
-- Fix the old policy's uncorrelated c.player_id=c.player_id expression.
create or replace function app_private.roster_consent(target uuid,photo boolean default false) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.player_guardians pg join public.consents c on c.guardian_id=pg.guardian_id and c.player_id=pg.player_id
 where pg.player_id=target and c.revoked_at is null and c.public_profile_consent and (not photo or c.public_photo_consent)
 and not exists(select 1 from public.consents newer where newer.player_id=c.player_id and newer.guardian_id=c.guardian_id and newer.effective_from>c.effective_from))
 and not exists(select 1 from public.player_guardians pg join lateral(select * from public.consents c where c.guardian_id=pg.guardian_id and c.player_id=pg.player_id order by effective_from desc,created_at desc limit 1) latest on true
 where pg.player_id=target and (latest.revoked_at is not null or not latest.public_profile_consent or (photo and not latest.public_photo_consent)));
$$;
revoke all on function app_private.roster_consent(uuid,boolean) from public;
grant execute on function app_private.roster_consent(uuid,boolean) to anon,authenticated;
drop policy public_profiles_public_read on public.player_public_profiles;
create policy public_profiles_public_read on public.player_public_profiles for select to anon,authenticated using(app_private.site_is_public() and public_visible and app_private.roster_consent(player_id,false));
create or replace function public.roster_snapshot(private_view boolean default false) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare manager boolean:=app_private.is_admin_aal2(); me uuid:=auth.uid(); result jsonb; private_ok boolean:=false;
begin
 if private_view then
  if me is null or not app_private.is_team_member() then raise exception 'Team sign-in required'; end if;
  if exists(select 1 from public.user_roles where user_id=me and role in ('admin','manager')) and not manager then raise exception 'Complete multi-factor authentication'; end if;
  private_ok:=true;
 end if;
 select jsonb_build_object('manager',manager and private_ok,'formation',(select to_jsonb(f) from public.roster_formation f where id='team'),
 'players',coalesce((select jsonb_agg(jsonb_build_object(
 'id',p.id,'name',coalesce(pp.display_first_name,p.first_name),'number',p.jersey_number,'position',p.position,'active',p.active,
 'slot',case when private_ok or pp.show_on_field then pp.field_slot else null end,'show_on_field',coalesce(pp.show_on_field,false),'public_visible',coalesce(pp.public_visible,false),
 'can_edit',private_ok and (manager or app_private.guardian_for_player(p.id)),
 'name_consent',app_private.roster_consent(p.id,false),'photo_consent',app_private.roster_consent(p.id,true),
 'photo_id',case when app_private.roster_consent(p.id,true) and m.status='approved' and m.public_consent_reviewed and m.consent_reviewed and m.exif_stripped and m.deleted_at is null then m.id else null end,
 'parents',case when manager and private_ok then coalesce((select jsonb_agg(jsonb_build_object('guardian_id',g.id,'name',g.full_name,'relationship',pg.relationship)) from public.player_guardians pg join public.guardians g on g.id=pg.guardian_id where pg.player_id=p.id),'[]'::jsonb) else '[]'::jsonb end
 ) order by p.first_name) from public.players p left join public.player_public_profiles pp on pp.player_id=p.id left join public.media_items m on m.id=pp.profile_media_id
 where (private_ok and (manager or app_private.guardian_for_player(p.id))) or (p.active and pp.public_visible and app_private.site_is_public() and app_private.roster_consent(p.id,false))), '[]'::jsonb),
 'requests',case when private_ok then coalesce((select jsonb_agg(to_jsonb(r) order by r.requested_at desc) from public.roster_requests r where manager or r.requested_by=me),'[]'::jsonb) else '[]'::jsonb end,
 'photo_requests',case when manager and private_ok then coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'player_id',r.player_id,'media_id',r.media_id,'status',r.status)) from public.profile_photo_requests r where r.status='pending'),'[]'::jsonb) else '[]'::jsonb end
 ) into result; return result;
end; $$;
revoke all on function public.roster_snapshot(boolean) from public;
grant execute on function public.roster_snapshot(boolean) to anon,authenticated;
create or replace function public.roster_action(action text,input jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); manager boolean:=app_private.is_admin_aal2(); target uuid; r public.roster_requests; gid uuid; name text; num integer; formation text; assignment jsonb; slot text; mid uuid;
begin
 if me is null or not app_private.is_team_member() then raise exception 'Team sign-in required'; end if;
 if exists(select 1 from public.user_roles where user_id=me and role in ('admin','manager')) and not manager then raise exception 'Complete multi-factor authentication'; end if;
 if action in ('player.create','player.archive','link.review','link.remove','name.review','formation.save','photo.review') and not manager then raise exception 'Manager access required'; end if;
 if action in ('player.update','player.archive','photo.remove') then
  target:=(input->>'player_id')::uuid;
  perform 1 from public.players where id=target and (active or manager) for update;
  if not found then raise exception 'Player unavailable'; end if;
  if not manager and not app_private.guardian_for_player(target) then raise exception 'Only approved guardians can edit this player'; end if;
 end if;
 if action='link.request' then
  if not exists(select 1 from public.user_roles where user_id=me and role='parent_player') then raise exception 'Parent account required'; end if;
  name:=btrim(input->>'child_name'); if name is null or length(name) not between 1 and 100 then raise exception 'Child name required'; end if;
  if length(coalesce(input->>'verification_info',''))>1000 then raise exception 'Verification information too long'; end if;
  if (select count(*) from public.roster_requests where requested_by=me and status='pending' and kind='link')>=5 then raise exception 'You already have pending requests'; end if;
  insert into public.roster_requests(requested_by,kind,child_name,verification_info,relationship) values(me,'link',name,coalesce(input->>'verification_info',''),coalesce(input->>'relationship','parent'));
 elsif action in ('link.review','name.review') then
  select * into r from public.roster_requests where id=(input->>'request_id')::uuid for update;
  if not found or r.status<>'pending' then raise exception 'Pending request not found'; end if;
  if (action='link.review')<>(r.kind='link') then raise exception 'Wrong request type'; end if;
  if r.requested_by=me then raise exception 'Another manager must review your own request'; end if;
  if input->>'status' not in ('approved','rejected') then raise exception 'Invalid review decision'; end if;
  target:=coalesce((input->>'player_id')::uuid,r.player_id);
  if input->>'status'='approved' then
   if not exists(select 1 from public.players where id=target and active) then raise exception 'Choose an active player'; end if;
   if r.kind='link' then
    if not exists(select 1 from public.user_roles where user_id=r.requested_by and role='parent_player') then raise exception 'Active parent account required'; end if;
    select id into gid from public.guardians where user_id=r.requested_by;
    if gid is null then raise exception 'Parent must complete their account profile first'; end if;
    insert into public.player_guardians(player_id,guardian_id,relationship) values(target,gid,r.relationship) on conflict(player_id,guardian_id) do update set relationship=excluded.relationship;
   else
    if not exists(select 1 from public.guardians g join public.player_guardians pg on pg.guardian_id=g.id where g.user_id=r.requested_by and pg.player_id=target) then raise exception 'Guardian link no longer approved'; end if;
    update public.player_public_profiles set display_first_name=r.child_name,updated_at=now() where player_id=target;
   end if;
  end if;
  update public.roster_requests set status=input->>'status',player_id=target,reviewed_by=me,reviewed_at=now() where id=r.id;
 elsif action='link.remove' then
  target:=(input->>'player_id')::uuid;gid:=(input->>'guardian_id')::uuid;
  delete from public.player_guardians where player_id=target and guardian_id=gid;
 elsif action='player.create' then
  name:=btrim(input->>'name');if name is null or length(name) not between 1 and 100 then raise exception 'First name required'; end if;
  insert into public.players(first_name,last_name) values(name,'') returning id into target;
  insert into public.player_public_profiles(player_id,display_first_name,public_visible) values(target,name,false);
 elsif action='player.archive' then
  update public.players set active=false,updated_at=now() where id=target;
  update public.player_public_profiles set public_visible=false,show_on_field=false,field_slot=null,updated_at=now() where player_id=target;
 elsif action='player.update' then
  if exists(select 1 from jsonb_object_keys(input) k where k not in ('player_id','number','position','name','public_visible','show_on_field')) then raise exception 'Unsupported player field'; end if;
  if not manager and (input?'public_visible' or input?'show_on_field') then raise exception 'Only managers control public visibility'; end if;
  if input?'number' then num:=(input->>'number')::integer;if num is not null and num not between 0 and 99 then raise exception 'Number must be 0–99 or pending'; end if;update public.players set jersey_number=num,updated_at=now() where id=target; end if;
  if input?'position' then
   if coalesce(input->>'position','') not in ('','GK','DEF','MID','FWD','LB','CB','RB','LM','CM','RM','ST','LS','RS','LCB','RCB') then raise exception 'Invalid position'; end if;
   update public.players set position=nullif(input->>'position',''),updated_at=now() where id=target;
  end if;
  insert into public.player_public_profiles(player_id,display_first_name,public_visible) select id,first_name,false from public.players where id=target on conflict(player_id) do nothing;
  update public.player_public_profiles pp set jersey_number=p.jersey_number,position=p.position,updated_at=now() from public.players p where p.id=target and pp.player_id=p.id;
  if input?'name' then
   name:=btrim(input->>'name');if name is null or length(name) not between 1 and 100 or name~'[<>\n\r]' then raise exception 'Enter a display first name'; end if;
   if manager then update public.player_public_profiles set display_first_name=name,updated_at=now() where player_id=target;
   elsif name<>(select display_first_name from public.player_public_profiles where player_id=target) then
    insert into public.roster_requests(requested_by,player_id,kind,child_name) values(me,target,'name',name) on conflict(requested_by,player_id) where status='pending' and kind='name' do update set child_name=excluded.child_name,requested_at=now();
   end if;
  end if;
  if manager then
   if input->>'public_visible'='true' and not app_private.roster_consent(target,false) then raise exception 'Public profile consent required before publishing'; end if;
   update public.player_public_profiles set public_visible=case when input?'public_visible' then (input->>'public_visible')::boolean else public_visible end,show_on_field=case when input?'show_on_field' then (input->>'show_on_field')::boolean else show_on_field end where player_id=target;
  end if;
 elsif action='formation.save' then
  formation:=input->>'name';if formation not in ('1-3-2-1','1-2-3-1','1-3-3-2','1-4-3-1') then raise exception 'Choose a valid 7v7 or 9v9 formation'; end if;
  perform 1 from public.roster_formation where id='team' for update;
  assignment:=coalesce(input->'assignments','{}'::jsonb);if jsonb_typeof(assignment)<>'object' then raise exception 'Invalid assignments'; end if;
  if (select count(*) from jsonb_each_text(assignment))<>(select count(distinct value) from jsonb_each_text(assignment)) then raise exception 'Player cannot occupy multiple slots'; end if;
  for slot,target in select key,value::uuid from jsonb_each_text(assignment) loop
   if not (slot=any(case formation when '1-3-2-1' then array['GK','LB','CB','RB','LM','RM','ST'] when '1-2-3-1' then array['GK','LB','RB','LM','CM','RM','ST'] when '1-3-3-2' then array['GK','LB','CB','RB','LM','CM','RM','LS','RS'] else array['GK','LB','LCB','RCB','RB','LM','CM','RM','ST'] end)) then raise exception 'Invalid formation slot'; end if;
   if not exists(select 1 from public.players where id=target and active) then raise exception 'Assigned player unavailable'; end if;
  end loop;
  update public.player_public_profiles set field_slot=null,updated_at=now() where field_slot is not null;
  for slot,target in select key,value::uuid from jsonb_each_text(assignment) loop update public.player_public_profiles set field_slot=slot,updated_at=now() where player_id=target; end loop;
  update public.roster_formation set name=formation,show_names=coalesce((input->>'show_names')::boolean,true),updated_at=now() where id='team';
 elsif action='photo.remove' then
  update public.player_public_profiles set profile_media_id=null,public_photo_path=null,updated_at=now() where player_id=target;
 elsif action='photo.review' then
  select player_id,media_id into target,mid from public.profile_photo_requests where id=(input->>'request_id')::uuid and status='pending' for update;
  if not found then raise exception 'Pending photo not found'; end if;
  if input->>'status' not in ('approved','rejected') then raise exception 'Invalid review decision'; end if;
  if input->>'status'='approved' then
   if not app_private.roster_consent(target,true) or input->>'consent_reviewed'<>'true' then raise exception 'Review public profile and photo consent first'; end if;
   if not exists(select 1 from public.media_items where id=mid and exif_stripped and processed_private_path is not null and deleted_at is null) then raise exception 'Processed photo required'; end if;
   update public.media_items set status='approved',consent_reviewed=true,public_consent_reviewed=true,approved_by=me,approved_at=now() where id=mid;
   update public.player_public_profiles set profile_media_id=mid,public_photo_path=null,updated_at=now() where player_id=target;
  else update public.media_items set status='rejected' where id=mid; end if;
  update public.profile_photo_requests set status=(input->>'status')::public.moderation_status,reviewed_by=me,reviewed_at=now() where id=(input->>'request_id')::uuid;
 else raise exception 'Unsupported roster action'; end if;
 insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) values(me,'roster.'||action,'player',target::text,jsonb_build_object('request_id',input->>'request_id','status',input->>'status'));
 return jsonb_build_object('ok',true);
end; $$;
revoke all on function public.roster_action(text,jsonb) from public,anon;
grant execute on function public.roster_action(text,jsonb) to authenticated;
create or replace function public.roster_photo_allowed(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (app_private.is_admin_aal2() or app_private.guardian_for_player(target)) and exists(select 1 from public.players where id=target and active) and app_private.roster_consent(target,true);
$$;
revoke all on function public.roster_photo_allowed(uuid) from public,anon;
grant execute on function public.roster_photo_allowed(uuid) to authenticated;
create policy profile_photo_requests_manager_insert on public.profile_photo_requests for insert to authenticated with check(submitted_by=(select auth.uid()) and app_private.is_admin_aal2());
-- Materialize only missing squad records. Existing Julia record, links and consent remain unchanged.
do $$ declare item record; pid uuid; begin
 for item in select * from (values
 ('0f283cc2-912e-4d87-b2fb-000000000001'::uuid,'Seva',6),('0f283cc2-912e-4d87-b2fb-000000000002'::uuid,'Savi',12),
 ('0f283cc2-912e-4d87-b2fb-000000000003'::uuid,'Gianna-Rose',null::integer),('0f283cc2-912e-4d87-b2fb-000000000004'::uuid,'Natalia',null::integer),
 ('0f283cc2-912e-4d87-b2fb-000000000005'::uuid,'Milena',null::integer),('0f283cc2-912e-4d87-b2fb-000000000006'::uuid,'Valentina',null::integer),
 ('0f283cc2-912e-4d87-b2fb-000000000007'::uuid,'Julia',null::integer),('0f283cc2-912e-4d87-b2fb-000000000008'::uuid,'Georgia',null::integer),
 ('0f283cc2-912e-4d87-b2fb-000000000009'::uuid,'Milania',null::integer)) squad(id,name,number)
 loop
  if (select count(*) from public.players where lower(first_name)=lower(item.name))>1 then raise exception 'Resolve duplicate squad names before importing'; end if;
  select id into pid from public.players where lower(first_name)=lower(item.name);
  if pid is null then insert into public.players(id,first_name,last_name,jersey_number) values(item.id,item.name,'',item.number) returning id into pid; end if;
  insert into public.player_public_profiles(player_id,display_first_name,jersey_number,public_visible) select id,first_name,jersey_number,false from public.players where id=pid on conflict(player_id) do nothing;
 end loop;
end $$;
-- Privileged implementation lives outside the exposed API schema; public wrappers use invoker rights.
alter function public.roster_snapshot(boolean) set schema app_private;
alter function public.roster_action(text,jsonb) set schema app_private;
alter function public.roster_photo_allowed(uuid) set schema app_private;
create function public.roster_snapshot(private_view boolean default false) returns jsonb language sql stable security invoker set search_path='' as $$ select app_private.roster_snapshot(private_view); $$;
create function public.roster_action(action text,input jsonb) returns jsonb language sql security invoker set search_path='' as $$ select app_private.roster_action(action,input); $$;
create function public.roster_photo_allowed(target uuid) returns boolean language sql stable security invoker set search_path='' as $$ select app_private.roster_photo_allowed(target); $$;
revoke all on function public.roster_snapshot(boolean),public.roster_action(text,jsonb),public.roster_photo_allowed(uuid) from public,anon,authenticated;
grant execute on function public.roster_snapshot(boolean) to anon,authenticated;
grant execute on function public.roster_action(text,jsonb),public.roster_photo_allowed(uuid) to authenticated;
create index player_public_profiles_media_idx on public.player_public_profiles(profile_media_id);
drop policy profile_photo_requests_guardian_insert on public.profile_photo_requests;
drop policy profile_photo_requests_manager_insert on public.profile_photo_requests;
create policy profile_photo_requests_verified_insert on public.profile_photo_requests for insert to authenticated with check(submitted_by=(select auth.uid()) and (app_private.is_admin_aal2() or app_private.guardian_for_player(player_id)));
