-- Real database RLS tests. All fixtures and changes roll back.
begin;
do $$ declare p uuid:=gen_random_uuid();m uuid:=gen_random_uuid();s uuid:=gen_random_uuid();photo uuid:=gen_random_uuid(); tx uuid:=gen_random_uuid();doc uuid:=gen_random_uuid();begin
 perform set_config('test.parent',p::text,true);perform set_config('test.manager',m::text,true);perform set_config('test.sponsor',s::text,true);perform set_config('test.photographer',photo::text,true);perform set_config('test.tx',tx::text,true);perform set_config('test.doc',doc::text,true);
 insert into auth.users(id,aud,role,email,created_at,updated_at) values(p,'authenticated','authenticated',p||'@example.invalid',now(),now()),(m,'authenticated','authenticated',m||'@example.invalid',now(),now()),(s,'authenticated','authenticated',s||'@example.invalid',now(),now()),(photo,'authenticated','authenticated',photo||'@example.invalid',now(),now());
 insert into public.user_roles(user_id,role) values(p,'parent_player'),(m,'manager'),(m,'parent_player'),(s,'sponsor'),(photo,'photographer');
 if not exists(select 1 from public.team_budget_lines) then raise exception 'Budget import missing';end if;
 
end $$;
set local role anon;
do $$ begin
 begin perform * from public.team_budget_lines;raise exception 'Anonymous finance access' using errcode='XX000';exception when insufficient_privilege then null;end;
 if exists(select 1 from storage.objects where bucket_id='team-finance-private') then raise exception 'Anonymous storage access';end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.manager'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.team_budget_lines) then raise exception 'Manager with parent role bypassed MFA';end if;
 begin insert into public.team_transactions(occurred_on,kind,description,amount_cents,budget_line_id) values('2026-10-03','income','Fixture',100,null);raise exception 'MFA write bypass' using errcode='XX000';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.manager'),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
do $$ declare path text:=current_setting('test.manager')||'/'||current_setting('test.doc')||'.pdf';begin
 insert into public.team_transactions(id,occurred_on,kind,description,amount_cents,budget_line_id) values(current_setting('test.tx')::uuid,'2026-10-03','expense','Fixture spending',1234,(select id from public.team_budget_lines order by sort_order limit 1));
 insert into storage.objects(bucket_id,name) values('team-finance-private',path);
 insert into public.team_finance_documents(id,kind,title,storage_path,transaction_id) values(current_setting('test.doc')::uuid,'receipt','Fixture receipt',path,current_setting('test.tx')::uuid);
 begin update public.team_transactions set amount_cents=1 where id=current_setting('test.tx')::uuid;raise exception 'Ledger amount overwritten' using errcode='XX000';exception when insufficient_privilege then null;end;
 begin delete from public.team_transactions where id=current_setting('test.tx')::uuid;raise exception 'Ledger deleted' using errcode='XX000';exception when insufficient_privilege then null;end;
 begin update public.team_finance_documents set shared=true where id=current_setting('test.doc')::uuid;raise exception 'Unreviewed document shared' using errcode='XX000';exception when check_violation then null;end;
 if not exists(select 1 from public.team_finance_audit where record_id=current_setting('test.tx') and actor=auth.uid()) then raise exception 'Audit entry missing';end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.parent'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.team_budget_lines) then raise exception 'Parent cannot read budget';end if;
 if not exists(select 1 from public.team_transactions where id=current_setting('test.tx')::uuid) then raise exception 'Parent cannot read transaction';end if;
 if exists(select 1 from public.team_finance_documents where id=current_setting('test.doc')::uuid) then raise exception 'Parent read draft';end if;
 if exists(select 1 from storage.objects where name=current_setting('test.manager')||'/'||current_setting('test.doc')||'.pdf') then raise exception 'Parent read draft file';end if;
 if exists(select 1 from public.team_finance_audit) then raise exception 'Parent read management audit';end if;
 begin insert into public.team_transactions(occurred_on,kind,description,amount_cents) values('2026-10-03','income','Fixture',100);raise exception 'Parent wrote transaction' using errcode='XX000';exception when insufficient_privilege then null;end;
 update public.team_budget_lines set planned_cents=1;
 if exists(select 1 from public.team_budget_lines where planned_cents=1) then raise exception 'Parent edited budget';end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.manager'),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
update public.team_finance_documents set shared=true,redaction_confirmed=true where id=current_setting('test.doc')::uuid;
update public.team_transactions set voided_at=now(),void_reason='Fixture correction' where id=current_setting('test.tx')::uuid;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.parent'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.team_finance_documents where id=current_setting('test.doc')::uuid) then raise exception 'Parent cannot read shared receipt';end if;
 if not exists(select 1 from storage.objects where name=current_setting('test.manager')||'/'||current_setting('test.doc')||'.pdf') then raise exception 'Parent cannot download shared receipt';end if;
 if not exists(select 1 from public.team_transactions where id=current_setting('test.tx')::uuid and voided_at is not null and void_reason='Fixture correction') then raise exception 'Voided record lost';end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.sponsor'),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
do $$ begin if exists(select 1 from public.team_budget_lines) then raise exception 'Sponsor finance access';end if;end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.photographer'),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
do $$ begin if exists(select 1 from public.team_transactions) then raise exception 'Photographer finance access';end if;end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.manager'),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
update public.team_finance_documents set shared=false,redaction_confirmed=false where id=current_setting('test.doc')::uuid;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.parent'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ begin if exists(select 1 from public.team_finance_documents where id=current_setting('test.doc')::uuid) or exists(select 1 from storage.objects where name=current_setting('test.manager')||'/'||current_setting('test.doc')||'.pdf') then raise exception 'Withdrawn document still accessible';end if;end $$;
reset role;
delete from public.user_roles where user_id=current_setting('test.parent')::uuid;
set local role authenticated;
do $$ begin if exists(select 1 from public.team_budget_lines) then raise exception 'Revoked parent retained access';end if;end $$;
reset role;
rollback;
select 'Finance RLS tests passed: anonymous, parent, sponsor, photographer, manager MFA, immutable ledger, private draft/shared/unshared storage, audit and revoked access; fixtures rolled back.' as result;
