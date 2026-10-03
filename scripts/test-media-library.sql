-- Run inside a transaction and ROLLBACK. Fixtures never become real accounts.
do $$ declare pa uuid:=gen_random_uuid(); pb uuid:=gen_random_uuid(); ad uuid:=gen_random_uuid(); aa uuid:=gen_random_uuid(); ab uuid:=gen_random_uuid(); shared uuid:=gen_random_uuid(); gr uuid:=gen_random_uuid(); own uuid:=gen_random_uuid(); other uuid:=gen_random_uuid(); hidden uuid:=gen_random_uuid(); begin
 perform set_config('test.parent_a',pa::text,true);perform set_config('test.parent_b',pb::text,true);perform set_config('test.admin',ad::text,true);
 perform set_config('test.album_a',aa::text,true);perform set_config('test.album_b',ab::text,true);perform set_config('test.shared',shared::text,true);
 perform set_config('test.photo_own',own::text,true);perform set_config('test.photo_other',other::text,true);perform set_config('test.photo_hidden',hidden::text,true);
 insert into auth.users(id,aud,role,email,created_at,updated_at) values(pa,'authenticated','authenticated',pa||'@example.invalid',now(),now()),(pb,'authenticated','authenticated',pb||'@example.invalid',now(),now()),(ad,'authenticated','authenticated',ad||'@example.invalid',now(),now());
 insert into public.user_roles(user_id,role) values(pa,'parent_player'),(pb,'parent_player'),(ad,'admin') on conflict do nothing;
 insert into public.albums(id,title,created_by,visibility) values(aa,'Fixture own album',pa,'private'),(ab,'Fixture other album',pb,'private'),(shared,'Fixture shared album',pb,'shared');
 insert into public.media_groups(id,name,created_by) values(gr,'Fixture group',ad);
 insert into public.media_group_members(group_id,user_id) values(gr,pa);
 insert into public.album_groups(album_id,group_id) values(shared,gr);
 insert into public.media_items(id,album_id,uploader_id,media_type,original_path,processed_private_path,thumbnail_path,status,visibility,exif_stripped,consent_reviewed) values
 (own,aa,pa,'photo',pa||'/test.jpg',pa||'/test.jpg',pa||'/thumb.jpg','pending','private_team',true,false),
 (other,aa,pb,'photo',pb||'/test.jpg',pb||'/test.jpg',pb||'/thumb.jpg','approved','private_team',true,true),
 (hidden,ab,pb,'photo',pb||'/hidden.jpg',pb||'/hidden.jpg',pb||'/hidden-thumb.jpg','approved','private_team',true,true);
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.parent_a'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ declare changed int; begin
 if not app_private.can_view_album(current_setting('test.album_a')::uuid) then raise exception 'Owner cannot view own album'; end if;
 if app_private.can_view_album(current_setting('test.album_b')::uuid) then raise exception 'Private album leaked to another parent'; end if;
 if not app_private.can_view_album(current_setting('test.shared')::uuid) then raise exception 'Assigned group cannot view shared album'; end if;
 if not app_private.can_view_photo(current_setting('test.photo_own')::uuid) then raise exception 'Uploader cannot view pending upload'; end if;
 if app_private.can_view_photo(current_setting('test.photo_hidden')::uuid) then raise exception 'Photo leaked across private albums'; end if;
 update public.media_items set caption='Forbidden direct update' where id=current_setting('test.photo_own')::uuid;
 get diagnostics changed=row_count;if changed<>0 then raise exception 'Parent bypassed API caption/review boundary'; end if;
 begin
  perform public.media_library_action(current_setting('test.parent_a')::uuid,false,'move',jsonb_build_object('id',current_setting('test.album_b'),'photo_ids',jsonb_build_array(current_setting('test.photo_own'))));
  raise exception 'Authenticated caller reached service-only mutation RPC';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.media_items(uploader_id,media_type,original_path,processed_private_path,thumbnail_path,status,visibility) values(current_setting('test.parent_b')::uuid,'photo','forged','forged','forged','pending','private_team');
  raise exception 'Parent forged uploader identity';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$ begin
 begin
  perform public.media_library_action(current_setting('test.parent_a')::uuid,true,'move',jsonb_build_object('id',current_setting('test.album_b'),'photo_ids',jsonb_build_array(current_setting('test.photo_own'))));
  raise exception 'Parent impersonated admin' using errcode='XX000';
 exception when raise_exception then null;end;
 begin
  perform public.media_library_action(current_setting('test.parent_a')::uuid,false,'photo_delete',jsonb_build_object('id',current_setting('test.photo_other')));
  raise exception 'Parent removed another uploader photo' using errcode='XX000';
 exception when raise_exception then null;end;
 perform public.media_library_action(current_setting('test.parent_a')::uuid,false,'photo_edit',jsonb_build_object('id',current_setting('test.photo_own'),'caption','Own caption','tags',jsonb_build_array('team')));
 perform public.media_library_action(current_setting('test.parent_a')::uuid,false,'delete',jsonb_build_object('id',current_setting('test.album_a')));
 if exists(select 1 from public.media_items where id=current_setting('test.photo_other')::uuid and deleted_at is not null) then raise exception 'Album removal deleted another parent upload'; end if;
 if not exists(select 1 from public.media_items where id=current_setting('test.photo_own')::uuid and deleted_at is not null) then raise exception 'Album removal did not remove owner upload'; end if;
 perform public.media_library_action(current_setting('test.admin')::uuid,true,'move',jsonb_build_object('id',current_setting('test.shared'),'photo_ids',jsonb_build_array(current_setting('test.photo_hidden'))));
 if not exists(select 1 from public.media_items where id=current_setting('test.photo_hidden')::uuid and album_id=current_setting('test.shared')::uuid and status='pending' and not consent_reviewed and not public_consent_reviewed) then raise exception 'Move failed to reset consent'; end if;
 perform public.media_library_action(current_setting('test.admin')::uuid,true,'reorder',jsonb_build_object('id',current_setting('test.shared'),'photo_ids',jsonb_build_array(current_setting('test.photo_hidden'))));
 if not exists(select 1 from public.media_items where id=current_setting('test.photo_hidden')::uuid and position=1) then raise exception 'Manual order was not saved'; end if;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.parent_b'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ begin
 if not app_private.can_view_photo(current_setting('test.photo_other')::uuid) then raise exception 'Contributor lost own upload after album removal'; end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.admin'),'role','authenticated','aal','aal1')::text,true);
set local role authenticated;
do $$ begin
 if app_private.is_admin_aal2() then raise exception 'Admin bypassed MFA'; end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.admin'),'role','authenticated','aal','aal2')::text,true);
set local role authenticated;
do $$ begin
 if not app_private.can_view_album(current_setting('test.album_b')::uuid) then raise exception 'MFA admin cannot manage another parent album'; end if;
end $$;
reset role;

