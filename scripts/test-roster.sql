-- Execute in a transaction. All accounts, links, photos and edits are rolled back.
do $$ declare pa uuid:=gen_random_uuid();pb uuid:=gen_random_uuid();ad uuid:=gen_random_uuid();ga uuid:=gen_random_uuid();gb uuid:=gen_random_uuid();a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();begin
 perform set_config('test.pa',pa::text,true);perform set_config('test.pb',pb::text,true);perform set_config('test.ad',ad::text,true);perform set_config('test.ga',ga::text,true);perform set_config('test.gb',gb::text,true);perform set_config('test.a',a::text,true);perform set_config('test.b',b::text,true);
 insert into auth.users(id,aud,role,email,created_at,updated_at) values(pa,'authenticated','authenticated',pa||'@example.invalid',now(),now()),(pb,'authenticated','authenticated',pb||'@example.invalid',now(),now()),(ad,'authenticated','authenticated',ad||'@example.invalid',now(),now());
 insert into public.user_roles(user_id,role) values(pa,'parent_player'),(pb,'parent_player'),(ad,'admin') on conflict do nothing;
 insert into public.guardians(id,user_id,full_name) values(ga,pa,'Fixture Parent A'),(gb,pb,'Fixture Parent B');
 insert into public.players(id,first_name,last_name) values(a,'Fixture A','Private surname'),(b,'Fixture B','Private surname');
 insert into public.player_public_profiles(player_id,display_first_name,public_visible) values(a,'Fixture A',false),(b,'Fixture B',false);
 insert into public.player_guardians(player_id,guardian_id) values(b,gb);
 insert into public.consents(player_id,guardian_id,public_profile_consent,public_photo_consent) values(b,gb,true,true);
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.pa'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ declare a uuid:=current_setting('test.a')::uuid;b uuid:=current_setting('test.b')::uuid;begin
 perform public.roster_action('link.request',jsonb_build_object('child_name','Fixture A','verification_info','Fixture registration context'));
 begin perform public.roster_action('player.update',jsonb_build_object('player_id',a,'number',22));raise exception 'Pending request granted editing' using errcode='XX000';exception when raise_exception then null;end;
 begin perform public.roster_action('link.review',jsonb_build_object('request_id',(select id from public.roster_requests where requested_by=auth.uid() and kind='link'),'player_id',a,'status','approved'));raise exception 'Parent approved own link' using errcode='XX000';exception when raise_exception then null;end;
 begin insert into public.player_guardians(player_id,guardian_id) values(a,current_setting('test.ga')::uuid);raise exception 'Parent directly inserted guardian link' using errcode='XX000';exception when insufficient_privilege then null;end;
 if app_private.roster_consent(a,false) then raise exception 'Another player consent leaked';end if;
 if public.roster_photo_allowed(b) then raise exception 'Parent may upload another player portrait';end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.ad'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ begin
 begin perform public.roster_snapshot(true);raise exception 'Manager bypassed MFA' using errcode='XX000';exception when raise_exception then null;end;
 begin perform public.roster_action('formation.save','{"name":"1-3-2-1","assignments":{}}');raise exception 'Manager changed lineup without MFA' using errcode='XX000';exception when raise_exception then null;end;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.ad'),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
do $$ begin
 perform public.roster_action('link.review',jsonb_build_object('request_id',(select id from public.roster_requests where requested_by=current_setting('test.pa')::uuid and kind='link'),'player_id',current_setting('test.a'),'status','approved'));
 if not exists(select 1 from public.player_guardians where player_id=current_setting('test.a')::uuid and guardian_id=current_setting('test.ga')::uuid) then raise exception 'Approved link not created';end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.pa'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ declare a uuid:=current_setting('test.a')::uuid;b uuid:=current_setting('test.b')::uuid; snapshot jsonb;begin
 perform public.roster_action('player.update',jsonb_build_object('player_id',a,'number',22,'position','MID','name','New Fixture Name'));
 if (select jersey_number from public.players where id=a)<>22 then raise exception 'Own-player number not saved';end if;
 if (select display_first_name from public.player_public_profiles where player_id=a)<>'Fixture A' then raise exception 'Pending name published before approval';end if;
 perform public.roster_action('player.update',jsonb_build_object('player_id',a,'number',null));
 if (select jersey_number from public.players where id=a) is not null then raise exception 'Number pending failed';end if;
 begin perform public.roster_action('player.update',jsonb_build_object('player_id',b,'number',77));raise exception 'Parent changed another player' using errcode='XX000';exception when raise_exception then null;end;
 begin perform public.roster_action('player.update',jsonb_build_object('player_id',a,'public_visible',true));raise exception 'Parent published profile' using errcode='XX000';exception when raise_exception then null;end;
 begin perform public.roster_action('formation.save','{"name":"1-3-2-1","assignments":{}}');raise exception 'Parent moved lineup' using errcode='XX000';exception when raise_exception then null;end;
 snapshot:=public.roster_snapshot(true);
 if jsonb_array_length(snapshot->'players')<>1 or snapshot->'players'->0->>'id'<>a::text then raise exception 'Private snapshot leaked unrelated player';end if;
 if snapshot::text like '%Private surname%' or snapshot::text like '%Fixture Parent B%' then raise exception 'Private identity leaked';end if;
end $$;
reset role;
insert into public.consents(player_id,guardian_id,public_profile_consent,public_photo_consent) values(current_setting('test.a')::uuid,current_setting('test.ga')::uuid,true,true);
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.ad'),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
do $$ declare a uuid:=current_setting('test.a')::uuid;b uuid:=current_setting('test.b')::uuid;begin
 perform public.roster_action('name.review',jsonb_build_object('request_id',(select id from public.roster_requests where kind='name' and player_id=a),'status','approved'));
 if (select display_first_name from public.player_public_profiles where player_id=a)<>'New Fixture Name' then raise exception 'Name review failed';end if;
 perform public.roster_action('player.update',jsonb_build_object('player_id',a,'public_visible',true,'show_on_field',true));
 perform public.roster_action('formation.save',jsonb_build_object('name','1-3-2-1','show_names',true,'assignments',jsonb_build_object('GK',a,'ST',b)));
 if (select field_slot from public.player_public_profiles where player_id=a)<>'GK' then raise exception 'Formation assignment failed';end if;
 begin perform public.roster_action('formation.save',jsonb_build_object('name','1-3-2-1','assignments',jsonb_build_object('GK',a,'ST',a)));raise exception 'Duplicate player assignment accepted' using errcode='XX000';exception when raise_exception then null;end;
 begin perform public.roster_action('formation.save','{"name":"1-4-3-2","assignments":{}}');raise exception 'Invalid 10-player formation accepted' using errcode='XX000';exception when raise_exception then null;end;
 perform public.roster_action('link.remove',jsonb_build_object('player_id',a,'guardian_id',current_setting('test.ga')));
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.pa'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ begin
 begin perform public.roster_action('player.update',jsonb_build_object('player_id',current_setting('test.a'),'number',11));raise exception 'Unlinked parent retained access' using errcode='XX000';exception when raise_exception then null;end;
end $$;
reset role;
select 'Roster permission tests passed: pending/approved/revoked links, own-child edits, display-name moderation, consent isolation, private projections, formation validation and manager MFA.' as result;
