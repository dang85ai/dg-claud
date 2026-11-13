create table public.parent_invite_requests (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null check (char_length(parent_name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  player_name text not null check (char_length(player_name) between 1 and 100),
  status text not null default 'pending' check (status in ('pending','sending','accepted','failed','existing','declined')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);
create unique index parent_invite_requests_open_email
  on public.parent_invite_requests(email) where status in ('pending','sending','failed');
alter table public.parent_invite_requests enable row level security;
revoke all on public.parent_invite_requests from public, anon, authenticated;
grant select on public.parent_invite_requests to authenticated;
grant all on public.parent_invite_requests to service_role;
create policy manager_reads_parent_invite_requests on public.parent_invite_requests
  for select to authenticated using (app_private.is_admin_aal2());

