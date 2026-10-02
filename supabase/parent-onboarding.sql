create or replace function public.prepare_parent_activation(invite_email text, invite_full_name text default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
begin
  if not app_private.is_admin_aal2() then raise exception 'Manager access with MFA is required'; end if;
  if exists (select 1 from app_private.account_invites i where lower(i.email)=lower(trim(invite_email)) and i.status='pending' and (i.expires_at is null or i.expires_at>now()) and i.role<>'parent_player'::public.app_role) then
    raise exception 'This email has a pending invitation for another role. Review or revoke it first.';
  end if;
  return public.create_account_invite(lower(trim(invite_email)), 'parent_player'::public.app_role, invite_full_name, now()+interval '30 days');
end;
$$;
revoke all on function public.prepare_parent_activation(text,text) from public, anon;
grant execute on function public.prepare_parent_activation(text,text) to authenticated;

