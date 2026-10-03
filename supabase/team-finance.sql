-- Team finance is private to parents and MFA-verified management.
begin;
create function app_private.finance_reader() returns boolean language sql stable security invoker set search_path='' as $$
 select auth.uid() is not null and case when app_private.has_role('admin') or app_private.has_role('manager') then app_private.is_admin_aal2() else app_private.has_role('parent_player') end;
$$;
revoke all on function app_private.finance_reader() from public,anon;
grant execute on function app_private.finance_reader() to authenticated;

create table public.team_finance_settings (
 id text primary key check(id='winter-2026-27'), season text not null default 'Winter 2026–27', currency text not null default 'CAD' check(currency='CAD'),
 source text not null default 'U9_Girls_Soccer_Budget_Winter2026-27.xlsx',
 opening_cents bigint, opening_date date, updated_at timestamptz not null default now(),
 check((opening_cents is null)=(opening_date is null)), check(abs(opening_cents)<=100000000),
 constraint finance_opening_not_future check(opening_date<=(now() at time zone 'America/Toronto')::date)
);
create table public.team_budget_lines (
 id uuid primary key default gen_random_uuid(), category text not null check(length(btrim(category)) between 1 and 120),
 label text not null check(length(btrim(label)) between 1 and 180), quantity numeric(12,2) not null check(quantity>=0),
 unit_cents bigint not null check(unit_cents between 0 and 100000000), planned_cents bigint not null check(planned_cents between 0 and 100000000),
 sort_order integer not null default 0, updated_at timestamptz not null default now()
);
create table public.team_transactions (
 id uuid primary key default gen_random_uuid(), occurred_on date not null,
 kind text not null check(kind in ('income','expense','expense_refund','income_refund')),
 description text not null check(length(btrim(description)) between 1 and 300),
 amount_cents bigint not null check(amount_cents between 1 and 100000000), budget_line_id uuid references public.team_budget_lines(id),
 created_at timestamptz not null default now(), created_by uuid not null default auth.uid() references auth.users(id),
 voided_at timestamptz, void_reason text,
 check((voided_at is null and void_reason is null) or (voided_at is not null and length(btrim(void_reason)) between 3 and 300)),
 check(kind not in ('expense','expense_refund') or budget_line_id is not null),
 constraint finance_transaction_not_future check(occurred_on<=(now() at time zone 'America/Toronto')::date)
);
create index team_transactions_budget_idx on public.team_transactions(budget_line_id);
create index team_transactions_date_idx on public.team_transactions(occurred_on);
create index team_transactions_creator_idx on public.team_transactions(created_by);
create table public.team_finance_documents (
 id uuid primary key default gen_random_uuid(), kind text not null check(kind in ('receipt','statement')),
 title text not null check(length(btrim(title)) between 1 and 180), storage_path text not null unique,
 transaction_id uuid references public.team_transactions(id), period_start date, period_end date, closing_cents bigint,
 shared boolean not null default false, redaction_confirmed boolean not null default false,
 created_at timestamptz not null default now(), created_by uuid not null default auth.uid() references auth.users(id),
 check(not shared or redaction_confirmed),
 check((kind='receipt' and transaction_id is not null and period_start is null and period_end is null and closing_cents is null)
   or (kind='statement' and transaction_id is null and period_start is not null and period_end is not null and period_end>=period_start and closing_cents is not null)),
 check(abs(closing_cents)<=100000000),
 check(storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png)$'),
 constraint finance_statement_not_future check(period_end<=(now() at time zone 'America/Toronto')::date)
);
create index team_finance_documents_transaction_idx on public.team_finance_documents(transaction_id);
create index team_finance_documents_creator_idx on public.team_finance_documents(created_by);
create table public.team_finance_audit (
 id bigint generated always as identity primary key, table_name text not null, record_id text not null,
 operation text not null, actor uuid references auth.users(id), changed_at timestamptz not null default now(), before_record jsonb, after_record jsonb
);
create index team_finance_audit_actor_idx on public.team_finance_audit(actor);
alter table public.team_finance_settings enable row level security;
alter table public.team_budget_lines enable row level security;
alter table public.team_transactions enable row level security;
alter table public.team_finance_documents enable row level security;
alter table public.team_finance_audit enable row level security;
revoke all on public.team_finance_settings,public.team_budget_lines,public.team_transactions,public.team_finance_documents,public.team_finance_audit from anon,authenticated;
grant select on public.team_finance_settings,public.team_budget_lines,public.team_transactions,public.team_finance_documents,public.team_finance_audit to authenticated;
grant update(opening_cents,opening_date) on public.team_finance_settings to authenticated;
grant update(planned_cents) on public.team_budget_lines to authenticated;
grant insert(id,occurred_on,kind,description,amount_cents,budget_line_id) on public.team_transactions to authenticated;
grant update(voided_at,void_reason) on public.team_transactions to authenticated;
grant insert(id,kind,title,storage_path,transaction_id,period_start,period_end,closing_cents) on public.team_finance_documents to authenticated;
grant update(shared,redaction_confirmed) on public.team_finance_documents to authenticated;
create policy finance_settings_read on public.team_finance_settings for select to authenticated using((select app_private.finance_reader()));
create policy finance_settings_write on public.team_finance_settings for update to authenticated using((select app_private.is_admin_aal2())) with check((select app_private.is_admin_aal2()));
create policy finance_budget_read on public.team_budget_lines for select to authenticated using((select app_private.finance_reader()));
create policy finance_budget_write on public.team_budget_lines for update to authenticated using((select app_private.is_admin_aal2())) with check((select app_private.is_admin_aal2()));
create policy finance_transactions_read on public.team_transactions for select to authenticated using((select app_private.finance_reader()));
create policy finance_transactions_insert on public.team_transactions for insert to authenticated with check((select app_private.is_admin_aal2()) and created_by=(select auth.uid()) and voided_at is null);
create policy finance_transactions_void on public.team_transactions for update to authenticated using((select app_private.is_admin_aal2()) and voided_at is null) with check((select app_private.is_admin_aal2()) and voided_at is not null);
create policy finance_documents_read on public.team_finance_documents for select to authenticated using((select app_private.is_admin_aal2()) or ((select app_private.finance_reader()) and shared and redaction_confirmed));
create policy finance_documents_insert on public.team_finance_documents for insert to authenticated with check((select app_private.is_admin_aal2()) and created_by=(select auth.uid()) and not shared and not redaction_confirmed and split_part(storage_path,'/',1)=(select auth.uid())::text);
create policy finance_documents_write on public.team_finance_documents for update to authenticated using((select app_private.is_admin_aal2())) with check((select app_private.is_admin_aal2()));
create policy finance_audit_read on public.team_finance_audit for select to authenticated using((select app_private.is_admin_aal2()));

-- Trigger owns audit writes; no client can alter or delete history.
create function app_private.finance_audit_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.team_finance_audit(table_name,record_id,operation,actor,before_record,after_record)
 values(tg_table_name,new.id::text,tg_op,auth.uid(),case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end; $$;
revoke all on function app_private.finance_audit_change() from public,anon,authenticated;
create function app_private.finance_timestamp() returns trigger language plpgsql security invoker set search_path='' as $$ begin new.updated_at:=now();return new;end; $$;
revoke all on function app_private.finance_timestamp() from public,anon,authenticated;
create trigger finance_settings_timestamp before update on public.team_finance_settings for each row execute function app_private.finance_timestamp();
create trigger finance_budget_timestamp before update on public.team_budget_lines for each row execute function app_private.finance_timestamp();
create trigger finance_settings_audit after insert or update on public.team_finance_settings for each row execute function app_private.finance_audit_change();
create trigger finance_budget_audit after insert or update on public.team_budget_lines for each row execute function app_private.finance_audit_change();
create trigger finance_transactions_audit after insert or update on public.team_transactions for each row execute function app_private.finance_audit_change();
create trigger finance_documents_audit after insert or update on public.team_finance_documents for each row execute function app_private.finance_audit_change();

-- Opening balance is populated privately after management confirms it.
insert into public.team_finance_settings(id) values('winter-2026-27');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('team-finance-private','team-finance-private',false,10485760,array['application/pdf','image/jpeg','image/png']);
create policy finance_storage_insert on storage.objects for insert to authenticated with check(bucket_id='team-finance-private' and (select app_private.is_admin_aal2()) and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy finance_storage_read on storage.objects for select to authenticated using(bucket_id='team-finance-private' and ((select app_private.is_admin_aal2()) or exists(select 1 from public.team_finance_documents d where d.storage_path=name and d.shared and d.redaction_confirmed and (select app_private.finance_reader()))));
-- Managers may remove an upload only before it is attached to a permanent record.
create policy finance_storage_cleanup on storage.objects for delete to authenticated using(bucket_id='team-finance-private' and (select app_private.is_admin_aal2()) and (storage.foldername(name))[1]=(select auth.uid())::text and not exists(select 1 from public.team_finance_documents d where d.storage_path=name));
-- Import the source workbook privately; never place team budget values in public source files.
commit;
