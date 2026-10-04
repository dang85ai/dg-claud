begin;
revoke insert,update,delete on public.user_roles from authenticated;
alter policy account_invites_admin_insert on app_private.account_invites with check (app_private.is_admin_aal2() and created_by=auth.uid() and (role not in ('admin','manager') or app_private.has_role('admin')));
alter policy account_invites_admin_update on app_private.account_invites using (app_private.is_admin_aal2() and (role not in ('admin','manager') or app_private.has_role('admin'))) with check (app_private.is_admin_aal2() and (role not in ('admin','manager') or app_private.has_role('admin')));
create or replace function public.manage_team_accounts(action text, input jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare target uuid; desired public.app_role; invite_id uuid; old_roles jsonb; result jsonb; mail text;
begin
 if auth.uid() is null or coalesce(auth.jwt()->>'aal','') <> 'aal2' or not exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin') then raise exception 'Administrator MFA session required'; end if;
 perform pg_advisory_xact_lock(746292103);
 if action='list' then
  return jsonb_build_object('users',coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'email',u.email,'name',p.full_name,'created_at',u.created_at,'confirmed_at',u.email_confirmed_at,'last_sign_in_at',u.last_sign_in_at,'roles',(select coalesce(jsonb_agg(r.role),'[]'::jsonb) from public.user_roles r where r.user_id=u.id),'mfa_enabled',exists(select 1 from auth.mfa_factors f where f.user_id=u.id and f.status='verified')) order by u.created_at desc) from auth.users u left join public.profiles p on p.id=u.id),'[]'::jsonb),'invites',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'email',i.email,'role',i.role,'name',i.full_name,'status',case when i.status='pending' and i.expires_at<now() then 'expired' else i.status end,'expires_at',i.expires_at,'created_at',i.created_at) order by i.created_at desc) from app_private.account_invites i),'[]'::jsonb));
 elsif action='role' then
  target=(input->>'user_id')::uuid; desired=(input->>'role')::public.app_role;
  if desired is null or not exists(select 1 from auth.users where id=target) then raise exception 'Valid user and role required'; end if;
  if target=auth.uid() then raise exception 'Ask another administrator to change your own role'; end if;
  if exists(select 1 from public.user_roles where user_id=target and role='admin') and desired<>'admin' and (select count(distinct user_id) from public.user_roles where role='admin')<=1 then raise exception 'The last administrator must retain access'; end if;
  select jsonb_agg(role) into old_roles from public.user_roles where user_id=target;
  delete from public.user_roles where user_id=target;
  insert into public.user_roles(user_id,role) values(target,desired);
  result=jsonb_build_object('user_id',target,'role',desired,'previous_roles',old_roles);
 elsif action='invite' then
  mail=lower(trim(input->>'email')); desired=(input->>'role')::public.app_role;
  if mail is null or length(mail)>254 or mail !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or desired is null then raise exception 'Valid email and role required'; end if;
  if exists(select 1 from auth.users where lower(email)=mail) then
   raise exception 'Account already exists. Resend its activation or change its role in Registered users';
  end if;
  update app_private.account_invites set status='revoked' where lower(email)=mail and status='pending';
  insert into app_private.account_invites(email,role,full_name,status,expires_at,created_by) values(mail,desired,nullif(trim(input->>'full_name'),''),'pending',now()+interval '30 days',auth.uid()) returning id into invite_id;
  result=jsonb_build_object('id',invite_id,'email',mail,'role',desired);
 elsif action='cancel' then
  update app_private.account_invites set status='revoked' where id=(input->>'id')::uuid and status='pending' returning id into invite_id;
  if invite_id is null then raise exception 'Only pending invitations can be cancelled'; end if;
  result=jsonb_build_object('id',invite_id);
 elsif action='delivery' then
  result=jsonb_build_object('email',input->>'email','outcome',input->>'outcome');
 else raise exception 'Unsupported account action'; end if;
 insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) values(auth.uid(),'account.'||action,'account',coalesce(target::text,invite_id::text),result);
 return result;
end;
$$;
revoke all on function public.manage_team_accounts(text,jsonb) from public,anon;
grant execute on function public.manage_team_accounts(text,jsonb) to authenticated;
-- The legacy review-only action must not let managers assign administrator privileges.
create or replace function public.create_account_invite(invite_email text,invite_role public.app_role,invite_full_name text default null,invite_expires_at timestamptz default null)
returns uuid language plpgsql set search_path='' as $$
declare new_id uuid;
begin
 if not app_private.is_admin_aal2() then raise exception 'Admin/manager MFA session required'; end if;
 if invite_role in ('admin','manager') and not app_private.has_role('admin') then raise exception 'Only an administrator can invite management accounts'; end if;
 if invite_email is null or position('@' in invite_email)<=1 then raise exception 'Valid email required'; end if;
 select id into new_id from app_private.account_invites where lower(email)=lower(trim(invite_email)) and role=invite_role and status='pending' and (expires_at is null or expires_at>now()) order by created_at desc limit 1;
 if new_id is null then
 insert into app_private.account_invites(email,role,full_name,status,expires_at,created_by) values(lower(trim(invite_email)),invite_role,nullif(trim(invite_full_name),''),'pending',coalesce(invite_expires_at,now()+interval '30 days'),auth.uid()) returning id into new_id;
 insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata) values(auth.uid(),'invite.create','account_invite',new_id::text,jsonb_build_object('role',invite_role));
 end if;
 return new_id;
end; $$;
commit;

