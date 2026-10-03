# Media library

Public gallery: `/media`. Parent library: `/portal/media` and `/portal/activity/media`. Admin library: `/admin/media` and `/admin/modules/media`.

## Permissions and sharing

The API derives identity from a verified Supabase session and roles from `user_roles`, never editable user metadata. Existing `parent_player` and photographer accounts receive the parent permission set. Admin and manager accounts require MFA (`aal2`).

Parents create private or team-parent albums, edit their own album metadata and captions/tags, and remove their own uploads. Selected-family/group sharing, public visibility, moving, manual ordering and moderation require an admin. Disabling contributions prevents new uploads by other families. Admins can disable creation of parent-shared albums.

Private albums are visible to their owner and admins. Shared albums use explicit recipients or groups. Team-parent albums are visible to signed-in team members. Public albums expose only approved, processed images with both private-team and public consent reviewed, while the site is public.

Uploading uses the existing private bucket and JPEG re-encoding pipeline. Photos are pending until reviewed. Caption edits and moves reset review. Private paths never become public bucket URLs. Image requests first check the caller's row access, then return the processed file with no-store headers.

Removing a parent's album removes their photos from the library while preserving other contributors' uploads in My Photos. Removal revokes library and storage access; it is a soft deletion, not physical file erasure. Admin removal affects all album photos. Moves and reorders execute in a single database transaction with row locks. Manual ordering requires the complete current photo list and fails safely if it changed concurrently.

## API

Base: `/functions/v1/media-library`.

| Method | Route | Permission |
| --- | --- | --- |
| GET | /albums | Accessible albums; reviewed public albums for visitors |
| POST | /albums | Team member; parent visibility restrictions |
| GET | /albums/:id | Album access |
| PATCH, DELETE | /albums/:id | Owner or MFA admin |
| POST | /albums/:id/photos | Owner/admin or accessible album accepting contributions |
| PATCH | /albums/:id/reorder | MFA admin |
| GET, PATCH | /albums/:id/sharing | MFA admin |
| GET | /photos?scope=mine | Own uploads; admins may request all |
| PATCH, DELETE | /photos/:id | Uploader or MFA admin |
| GET | /photos/:id/image | Photo access; optional thumbnail/download flags |
| POST | /photos/move | MFA admin |
| PATCH | /photos/:id/review | MFA admin; processed image and consent checks |
| GET | /sharing-options | MFA admin |
| POST | /groups | MFA admin |
| GET, PATCH | /settings | Read: team member; write: MFA admin |

Uploads accept 1–20 JPEG, PNG or WebP files per batch, up to 8 MB each. Bulk moves accept up to 200 distinct IDs. Per-file results allow failed uploads to be retried without repeating successful files.

## Validation

Run `node scripts/test-media-library.mjs` for API role/MFA, ownership, forged fields and admin-only operation tests. The preview workflow runs this alongside existing management, parent portal, Spond and media-processing tests, the Next.js build and public-content checks.

Run `scripts/test-media-library.sql` only inside a transaction, followed by ROLLBACK. It creates temporary test identities and checks real RLS, group access, denied privileged execution, forged upload ownership, preservation of other contributors' photos, moves, manual ordering and MFA boundaries. No test identity or photo should be committed.

The schema has been applied as `media_album_library`, followed by `media_group_owner_index`. Edge functions `media-library` and `media-upload` use custom verified authentication; the media-library function also intentionally supports anonymous public reads. Do not enable raw public access to the private bucket.

Browser acceptance checks still require signed-in parent/admin sessions. Use private, clearly named test albums and images containing no people or personal data, then remove those fixtures through the interface.
