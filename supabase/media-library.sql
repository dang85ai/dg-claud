begin;
alter table public.albums add column if not exists visibility text not null default 'parents';
alter table public.albums add column if not exists event_date date;
alter table public.albums add column if not exists updated_at timestamptz not null default now();
alter table public.albums add column if not exists deleted_at timestamptz;
alter table public.albums add column if not exists allow_contributions boolean not null default true;
alter table public.albums add column if not exists sort_mode text not null default 'date';
alter table public.albums add constraint albums_library_visibility check (visibility in ('private','parents','shared','public'));
alter table public.albums add constraint albums_library_sort check (sort_mode in ('date','name','manual'));
update public.albums set visibility=case when public_visible then 'public' else 'parents' end;
alter table public.media_items add column if not exists tags text[] not null default '{}';
alter table public.media_items add column if not exists filename text not null default 'Team photo';
alter table public.media_items add column if not exists position integer not null default 0;
alter table public.media_items add column if not exists deleted_at timestamptz;
alter table public.media_items add column if not exists updated_at timestamptz not null default now();
alter table public.media_items add column if not exists public_consent_reviewed boolean not null default false;
create table public.media_groups (id uuid primary key default gen_random_uuid(), name text not null check (length(name) between 1 and 100), created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table public.media_group_members (group_id uuid references public.media_groups(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, primary key(group_id,user_id));
create table public.album_recipients (album_id uuid references public.albums(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, primary key(album_id,user_id));
create table public.album_groups (album_id uuid references public.albums(id) on delete cascade, group_id uuid references public.media_groups(id) on delete cascade, primary key(album_id,group_id));
alter table public.media_groups enable row level security;
alter table public.media_group_members enable row level security;
alter table public.album_recipients enable row level security;
alter table public.album_groups enable row level security;
create index media_items_album_position_idx on public.media_items(album_id,position) where deleted_at is null;
create index media_items_owner_idx on public.media_items(uploader_id) where deleted_at is null;
create index albums_library_owner_idx on public.albums(created_by) where deleted_at is null;
create index album_recipients_user_idx on public.album_recipients(user_id,album_id);
create index media_group_members_user_idx on public.media_group_members(user_id,group_id);
create index album_groups_group_idx on public.album_groups(group_id,album_id);
create index media_groups_created_by_idx on public.media_groups(created_by);

create or replace function app_private.can_view_album(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select (select auth.uid()) is not null and app_private.is_team_member() and exists (
 select 1 from public.albums a where a.id=p_id and a.deleted_at is null and
 (app_private.is_admin_aal2() or a.created_by=(select auth.uid()) or a.visibility in ('parents','public') or
 (a.visibility='shared' and (exists(select 1 from public.album_recipients r where r.album_id=a.id and r.user_id=(select auth.uid())) or
 exists(select 1 from public.album_groups g join public.media_group_members m on m.group_id=g.group_id where g.album_id=a.id and m.user_id=(select auth.uid()))))))
$$;
create or replace function app_private.can_upload_album(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.albums a where a.id=p_id and a.deleted_at is null and app_private.is_team_member() and
 (app_private.is_admin_aal2() or a.created_by=(select auth.uid()) or (a.allow_contributions and app_private.can_view_album(a.id))))
$$;
create or replace function app_private.can_view_photo(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select app_private.is_team_member() and exists(select 1 from public.media_items m where m.id=p_id and m.deleted_at is null and
 (app_private.is_admin_aal2() or m.uploader_id=(select auth.uid()) or
 (m.status='approved' and m.consent_reviewed and m.exif_stripped and
 ((m.album_id is null and m.visibility='private_team') or app_private.can_view_album(m.album_id)))))
$$;
revoke all on function app_private.can_view_album(uuid),app_private.can_upload_album(uuid),app_private.can_view_photo(uuid) from public;
grant execute on function app_private.can_view_album(uuid),app_private.can_upload_album(uuid),app_private.can_view_photo(uuid) to authenticated;
drop policy albums_admin_all on public.albums;
drop policy albums_public_read on public.albums;
drop policy albums_team_read on public.albums;
create policy albums_library_read on public.albums for select to authenticated using (app_private.can_view_album(id));
create policy albums_library_admin on public.albums for all to authenticated using (app_private.is_admin_aal2()) with check (app_private.is_admin_aal2());
drop policy media_manager_delete on public.media_items;
drop policy media_manager_update on public.media_items;
drop policy media_public_read on public.media_items;
drop policy media_team_read on public.media_items;
drop policy media_team_insert_pending on public.media_items;
create policy media_library_read on public.media_items for select to authenticated using (app_private.can_view_photo(id));
create policy media_library_admin_update on public.media_items for update to authenticated using (app_private.is_admin_aal2() and deleted_at is null) with check (app_private.is_admin_aal2());
create policy media_library_admin_delete on public.media_items for delete to authenticated using (app_private.is_admin_aal2());
create policy media_library_upload on public.media_items for insert to authenticated with check (
 app_private.is_team_member() and uploader_id=(select auth.uid()) and status='pending' and not consent_reviewed and not public_consent_reviewed
 and processed_public_path is null and visibility='private_team' and deleted_at is null
 and processed_private_path like (select auth.uid())::text||'/%' and thumbnail_path like (select auth.uid())::text||'/%'
 and original_path=processed_private_path and (album_id is null or app_private.can_upload_album(album_id)));
drop policy team_processed_media_read on storage.objects;
create policy team_processed_media_read on storage.objects for select to authenticated using (
 bucket_id='team-media-private' and exists(select 1 from public.media_items m where (m.processed_private_path=objects.name or m.thumbnail_path=objects.name) and m.exif_stripped and app_private.can_view_photo(m.id)));
create policy media_groups_admin on public.media_groups for all to authenticated using(app_private.is_admin_aal2()) with check(app_private.is_admin_aal2());
create policy media_group_members_admin on public.media_group_members for all to authenticated using(app_private.is_admin_aal2()) with check(app_private.is_admin_aal2());
create policy album_recipients_admin on public.album_recipients for all to authenticated using(app_private.is_admin_aal2()) with check(app_private.is_admin_aal2());
create policy album_groups_admin on public.album_groups for all to authenticated using(app_private.is_admin_aal2()) with check(app_private.is_admin_aal2());
grant select on public.media_groups,public.media_group_members,public.album_recipients,public.album_groups to authenticated;
grant all on public.media_groups,public.media_group_members,public.album_recipients,public.album_groups to service_role;

-- Service-only transaction entry point. The Edge API verifies identity, role and MFA.
create or replace function public.media_library_action(p_actor uuid,p_admin boolean,p_action text,p_input jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare a public.albums; m public.media_items; v_id uuid; v_ids uuid[]; v_order uuid[]; v_count int; v_group uuid;
begin
 if not exists(select 1 from public.user_roles where user_id=p_actor and role in ('parent_player','admin','manager','photographer')) then raise exception 'Team access required'; end if;
 if p_admin and not exists(select 1 from public.user_roles where user_id=p_actor and role in ('admin','manager')) then raise exception 'Admin access required'; end if;
 if p_action in ('move','reorder','sharing','group','review') and not p_admin then raise exception 'Admin access required'; end if;
 if p_action='create' then
  if not p_admin and coalesce(p_input->>'visibility','private') not in ('private','parents') then raise exception 'Parent visibility restricted'; end if;
  if not p_admin and p_input->>'visibility'='parents' and exists(select 1 from public.site_settings where key='media_parent_shared_enabled' and value='false'::jsonb) then raise exception 'Shared parent albums disabled'; end if;
  insert into public.albums(title,description,created_by,event_date,event_id,visibility,allow_contributions)
  values(p_input->>'title',p_input->>'description',p_actor,(p_input->>'event_date')::date,(p_input->>'event_id')::uuid,coalesce(p_input->>'visibility','private'),coalesce((p_input->>'allow_contributions')::boolean,true)) returning id into v_id;
  return jsonb_build_object('id',v_id);
 end if;
 if p_action='group' then
  v_group=coalesce((p_input->>'id')::uuid,gen_random_uuid());
  insert into public.media_groups(id,name,created_by) values(v_group,p_input->>'name',p_actor) on conflict(id) do update set name=excluded.name;
  delete from public.media_group_members where group_id=v_group;
  insert into public.media_group_members(group_id,user_id) select v_group,value::uuid from jsonb_array_elements_text(p_input->'user_ids') where exists(select 1 from public.user_roles where user_id=value::uuid and role in ('parent_player','admin','manager','photographer'));
  return jsonb_build_object('id',v_group);
 end if;
 if p_action in ('photo_edit','photo_delete','review') then
  select * into m from public.media_items where id=(p_input->>'id')::uuid and deleted_at is null for update;
  if not found or (not p_admin and m.uploader_id<>p_actor) or (not p_admin and m.uploader_id is null) then raise exception 'Own uploads only'; end if;
  if p_action='photo_edit' then
   update public.media_items set caption=p_input->>'caption',tags=array(select jsonb_array_elements_text(p_input->'tags')),status='pending',consent_reviewed=false,public_consent_reviewed=false,processed_public_path=null,approved_by=null,approved_at=null,updated_at=now() where id=m.id;
  elsif p_action='photo_delete' then
   update public.media_items set deleted_at=now(),updated_at=now(),processed_public_path=null,status='rejected' where id=m.id;
   update public.albums set cover_media_id=null,updated_at=now() where cover_media_id=m.id;
  else
   if p_input->>'status'='approved' and (not coalesce((p_input->>'consent_reviewed')::boolean,false) or not m.exif_stripped or m.processed_private_path is null) then raise exception 'Processed image and consent review required'; end if;
   update public.media_items set status=(p_input->>'status')::public.media_status,consent_reviewed=coalesce((p_input->>'consent_reviewed')::boolean,false),public_consent_reviewed=coalesce((p_input->>'public_consent_reviewed')::boolean,false),visibility='private_team',processed_public_path=null,approved_by=p_actor,approved_at=now(),updated_at=now() where id=m.id;
  end if;
  update public.albums set updated_at=now() where id=m.album_id;
  return jsonb_build_object('ok',true);
 end if;
 select * into a from public.albums where id=(p_input->>'id')::uuid and deleted_at is null for update;
 if not found then raise exception 'Album unavailable'; end if;
 if p_action not in ('move','reorder','sharing') and not p_admin and (a.created_by is null or a.created_by<>p_actor) then raise exception 'Own albums only'; end if;
 if p_action='edit' then
  if not p_admin and p_input->>'visibility' not in ('private','parents') and p_input->>'visibility'<>a.visibility then raise exception 'Parent visibility restricted'; end if;
  if not p_admin and a.visibility in ('public','shared') and p_input->>'visibility'<>a.visibility then raise exception 'Only admins can change assigned sharing'; end if;
  if not p_admin and p_input->>'visibility'='parents' and exists(select 1 from public.site_settings where key='media_parent_shared_enabled' and value='false'::jsonb) then raise exception 'Shared parent albums disabled'; end if;
  if p_input->>'cover_media_id' is not null and not exists(select 1 from public.media_items where id=(p_input->>'cover_media_id')::uuid and album_id=a.id and deleted_at is null and (p_admin or uploader_id=p_actor)) then raise exception 'Choose an accessible photo in this album'; end if;
  update public.albums set title=p_input->>'title',description=p_input->>'description',event_date=(p_input->>'event_date')::date,event_id=(p_input->>'event_id')::uuid,visibility=p_input->>'visibility',public_visible=(p_input->>'visibility'='public'),allow_contributions=(p_input->>'allow_contributions')::boolean,cover_media_id=(p_input->>'cover_media_id')::uuid,updated_at=now() where id=a.id;
 elsif p_action='delete' then
  -- Preserve others' uploads: contributors can still access them through My Photos.
  update public.albums set deleted_at=now(),public_visible=false,updated_at=now() where id=a.id;
  update public.media_items set deleted_at=now(),status='rejected',processed_public_path=null where album_id=a.id and (p_admin or uploader_id=p_actor);
 elsif p_action='sharing' then
  delete from public.album_recipients where album_id=a.id;
  delete from public.album_groups where album_id=a.id;
  insert into public.album_recipients(album_id,user_id) select a.id,value::uuid from jsonb_array_elements_text(p_input->'user_ids') where exists(select 1 from public.user_roles where user_id=value::uuid and role in ('parent_player','admin','manager','photographer'));
  insert into public.album_groups(album_id,group_id) select a.id,value::uuid from jsonb_array_elements_text(p_input->'group_ids');
  update public.albums set updated_at=now() where id=a.id;
 elsif p_action='move' then
  select array_agg(value::uuid) into v_ids from jsonb_array_elements_text(p_input->'photo_ids');
  perform id from public.media_items where id=any(v_ids) and deleted_at is null order by id for update;
  select count(*) into v_count from public.media_items where id=any(v_ids) and deleted_at is null;
  if v_count<>cardinality(v_ids) then raise exception 'One or more photos unavailable'; end if;
  -- Moving audience requires a fresh review; old covers must not point across albums.
  update public.albums set cover_media_id=null,updated_at=now() where cover_media_id=any(v_ids);
  update public.media_items set album_id=a.id,position=0,status='pending',consent_reviewed=false,public_consent_reviewed=false,processed_public_path=null,approved_by=null,approved_at=null,updated_at=now() where id=any(v_ids);
  update public.albums set updated_at=now() where id=a.id;
 elsif p_action='reorder' then
  select array_agg(value::uuid) into v_order from jsonb_array_elements_text(p_input->'photo_ids');
  perform id from public.media_items where album_id=a.id and deleted_at is null order by id for update;
  select count(*) into v_count from public.media_items where album_id=a.id and deleted_at is null;
  if v_count<>cardinality(v_order) or exists(select 1 from unnest(v_order) v where not exists(select 1 from public.media_items where id=v and album_id=a.id and deleted_at is null)) then raise exception 'Photo list changed. Refresh and retry.'; end if;
  update public.media_items mi set position=o.ordinality,updated_at=now() from unnest(v_order) with ordinality o(id,ordinality) where mi.id=o.id;
  update public.albums set sort_mode='manual',updated_at=now() where id=a.id;
 else raise exception 'Unknown media action';
 end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.media_library_action(uuid,boolean,text,jsonb) from public,anon,authenticated;
grant execute on function public.media_library_action(uuid,boolean,text,jsonb) to service_role;
commit;

