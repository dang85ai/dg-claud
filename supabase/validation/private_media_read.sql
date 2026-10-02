create policy team_processed_media_read on storage.objects
for select to authenticated
using (
 bucket_id = 'team-media-private'
 and app_private.is_team_member()
 and exists (
   select 1 from public.media_items m
   where (m.processed_private_path = storage.objects.name or m.thumbnail_path = storage.objects.name)
     and m.exif_stripped = true
     and (
       m.uploader_id = (select auth.uid())
       or app_private.is_photographer_or_admin()
       or (m.status = 'approved' and m.consent_reviewed = true and m.visibility = 'private_team')
     )
 )
);