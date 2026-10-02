-- Credentials remain in Edge Function secrets; the cron credential never leaves Vault.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table public.spond_sync_config (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false,
  group_id text check (group_id ~ '^[A-Fa-f0-9]{32}$'),
  group_name text,
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  last_summary jsonb,
  lease_id uuid,
  lease_until timestamptz
);
insert into public.spond_sync_config(singleton) values(true);
alter table public.spond_sync_config enable row level security;
revoke all on public.spond_sync_config from public,anon,authenticated;
grant select on public.spond_sync_config to authenticated;
grant update(enabled) on public.spond_sync_config to authenticated;
grant all on public.spond_sync_config to service_role;
create policy spond_sync_manager_read on public.spond_sync_config for select to authenticated
  using ((select app_private.is_admin_aal2()));
create policy spond_sync_manager_pause on public.spond_sync_config for update to authenticated
  using ((select app_private.is_admin_aal2())) with check ((select app_private.is_admin_aal2()));

create table public.spond_event_links (
  group_id text not null,
  external_event_id text not null,
  event_id uuid not null unique references public.events(id) on delete cascade,
  baseline jsonb not null,
  conflict boolean not null default false,
  primary key(group_id, external_event_id)
);
alter table public.spond_event_links enable row level security;
revoke all on public.spond_event_links from public,anon,authenticated;
grant select on public.spond_event_links to authenticated;
grant all on public.spond_event_links to service_role;
create policy spond_link_manager_read on public.spond_event_links for select to authenticated
  using ((select app_private.is_admin_aal2()));

do $setup$ begin
  if not exists(select 1 from vault.secrets where name='spond_sync_worker') then
    perform vault.create_secret(gen_random_uuid()::text || gen_random_uuid()::text, 'spond_sync_worker', 'Dedicated Spond schedule worker');
  end if;
end $setup$;

create function public.spond_sync_worker_authorized(p_token text) returns boolean
language sql security invoker set search_path='' as $$
  select length(p_token)=72 and exists(
    select 1 from vault.decrypted_secrets where name='spond_sync_worker' and decrypted_secret=p_token
  );
$$;
revoke all on function public.spond_sync_worker_authorized(text) from public, anon, authenticated;
grant execute on function public.spond_sync_worker_authorized(text) to service_role;

create function public.spond_sync_claim() returns jsonb
language plpgsql security invoker set search_path='' as $$
declare c public.spond_sync_config; claim uuid:=gen_random_uuid();
begin
  select * into c from public.spond_sync_config where singleton for update;
  if not c.enabled or c.group_id is null then return jsonb_build_object('skipped','disabled'); end if;
  if c.lease_until>clock_timestamp() then return jsonb_build_object('skipped','running'); end if;
  update public.spond_sync_config set lease_id=claim, lease_until=clock_timestamp()+interval '5 minutes',last_attempt_at=clock_timestamp() where singleton;
  return jsonb_build_object('lease_id',claim,'group_id',c.group_id);
end $$;
revoke all on function public.spond_sync_claim() from public,anon,authenticated;
grant execute on function public.spond_sync_claim() to service_role;

create function public.spond_sync_finish(p_lease uuid,p_error text) returns void
language sql security invoker set search_path='' as $$
  update public.spond_sync_config set lease_id=null,lease_until=null,last_error=left(p_error,500)
    where singleton and lease_id=p_lease;
$$;
revoke all on function public.spond_sync_finish(uuid,text) from public,anon,authenticated;
grant execute on function public.spond_sync_finish(uuid,text) to service_role;

create function public.spond_sync_apply(p_lease uuid,p_group text,p_events jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare c public.spond_sync_config; item jsonb; link public.spond_event_links; ev public.events;
  target uuid; matches int; managed jsonb; incoming jsonb;
  added int:=0; adopted int:=0; changed int:=0; unchanged int:=0; conflicts int:=0; skipped int:=0; summary jsonb;
begin
  select * into c from public.spond_sync_config where singleton for update;
  if c.lease_id is distinct from p_lease or c.lease_until<clock_timestamp() then raise exception 'Invalid sync lease'; end if;
  if not c.enabled or c.group_id is distinct from p_group then raise exception 'Sync disabled or group changed'; end if;
  if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>=100 then raise exception 'Incomplete or invalid Spond data'; end if;
  if exists(select 1 from jsonb_array_elements(p_events) e group by e->>'id' having count(*)>1) then raise exception 'Duplicate Spond IDs'; end if;
  for item in select value from jsonb_array_elements(p_events) loop
    if nullif(item->>'id','') is null or nullif(item->>'title','') is null or nullif(item->>'starts_at','') is null or jsonb_typeof(item->'cancelled') is distinct from 'boolean' then raise exception 'Invalid Spond event'; end if;
    incoming:=jsonb_build_object('title',left(item->>'title',180),'starts_at',(item->>'starts_at')::timestamptz,'status',case when (item->>'cancelled')::boolean then 'cancelled' else 'scheduled' end);
    select * into link from public.spond_event_links where group_id=p_group and external_event_id=item->>'id';
    if not found then
      select count(*),(array_agg(e.id))[1] into matches,target from public.events e
        where e.title=item->>'title' and e.starts_at=(item->>'starts_at')::timestamptz and e.external_source='spond_manual'
          and not exists(select 1 from public.spond_event_links l where l.event_id=e.id);
      if matches>1 then conflicts:=conflicts+1; continue; end if;
      if matches=0 then
        if (item->>'starts_at')::timestamptz<clock_timestamp()-interval '1 day' then skipped:=skipped+1; continue; end if;
        insert into public.events(event_type,title,starts_at,status,public_visible,external_source,external_event_id)
          values('practice',incoming->>'title',(item->>'starts_at')::timestamptz,(incoming->>'status')::public.event_status,false,'spond_api',item->>'id') returning id into target;
        added:=added+1;
      else adopted:=adopted+1;
      end if;
      select * into ev from public.events where id=target for update;
      insert into public.spond_event_links(group_id,external_event_id,event_id,baseline)
        values(p_group,item->>'id',target,jsonb_build_object('title',ev.title,'starts_at',ev.starts_at,'status',ev.status));
      select * into link from public.spond_event_links where group_id=p_group and external_event_id=item->>'id';
    end if;
    select * into ev from public.events where id=link.event_id for update;
    managed:=jsonb_build_object('title',ev.title,'starts_at',ev.starts_at,'status',ev.status);
    if managed is distinct from link.baseline and managed is distinct from incoming then
      update public.spond_event_links set conflict=true where event_id=ev.id;
      conflicts:=conflicts+1; continue;
    end if;
    if managed is distinct from incoming then
      update public.events set title=incoming->>'title',starts_at=(incoming->>'starts_at')::timestamptz,
        status=(incoming->>'status')::public.event_status,external_source='spond_api',external_event_id=item->>'id' where id=ev.id;
      changed:=changed+1;
    else unchanged:=unchanged+1;
      update public.events set external_source='spond_api',external_event_id=item->>'id' where id=ev.id and external_source='spond_manual';
    end if;
    update public.spond_event_links set baseline=incoming,conflict=false where event_id=ev.id;
  end loop;
  summary:=jsonb_build_object('added',added,'adopted',adopted,'updated',changed,'unchanged',unchanged,'conflicts',conflicts,'skipped_past',skipped,'received',jsonb_array_length(p_events));
  update public.spond_sync_config set last_success_at=clock_timestamp(),last_error=null,last_summary=summary,lease_id=null,lease_until=null where singleton;
  return summary;
end $$;
revoke all on function public.spond_sync_apply(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.spond_sync_apply(uuid,text,jsonb) to service_role;

create function app_private.spond_sync_enqueue() returns bigint
language plpgsql security invoker set search_path='' as $$
declare request_id bigint;
begin
  if not exists(select 1 from public.spond_sync_config where singleton and enabled) then return null; end if;
  select net.http_post(
    url:='https://sgoxywyhaketjmdmkzhm.supabase.co/functions/v1/spond-sync',
    headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='spond_sync_worker')),
    body:='{}'::jsonb,timeout_milliseconds:=90000
  ) into request_id;
  return request_id;
end $$;
revoke all on function app_private.spond_sync_enqueue() from public,anon,authenticated;
select cron.schedule('spond-schedule-sync','0 10 * * *','select app_private.spond_sync_enqueue();');
select cron.alter_job(job_id:=(select jobid from cron.job where jobname='spond-schedule-sync'),active:=false);

