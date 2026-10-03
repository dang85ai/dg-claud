# Media acceptance validation — 3 October 2026

## Automated checks

- Next.js production build and all existing preview regression tests passed before signed-in acceptance testing.
- API tests reject parent attempts to move/reorder, manage sharing/groups/settings, moderate, change ownership, or edit/remove another person's albums/photos.
- Actual PostgreSQL tests verify private/group visibility, successful owned-album uploads, rejected inaccessible-album uploads, direct-write boundaries, preservation of another contributor's uploads, atomic moves/reorder and admin MFA.
- Browser testing caught a missing INSERT RETURNING case. The SELECT policy now evaluates new-row ownership directly; the SQL regression includes RETURNING. The corrected test passes in a rollback-only transaction.

## Signed-in admin browser checks

Passed on preview `6ac134211b2c69de812d9fc0` using two private validation albums and generated JPEG files containing no people or personal data:

- Manager role navigation and MFA-protected media controls.
- Create and edit albums, title/description/event-date persistence.
- Multiple file selection and upload processing; failed-file retry after the ownership fix.
- Thumbnail and full-size private image loading.
- Lightbox next/previous navigation.
- Own caption/tag editing and reset to pending review.
- Cover selection.
- Approval requiring a decoded image and private consent confirmation.
- Manual ordering with touch-friendly Earlier/Later controls.
- Bulk move of two photos; source/destination counts update and consent resets.
- Drag-and-drop from the photo grip to a destination album.
- Search, bulk selection and mobile controls at 360px with no horizontal overflow.
- Mobile lightbox at 360px; destructive confirmation and photo/album removal.
- Both private validation albums were removed; active validation-album count is zero.

The automated browser did not capture a download event for a blob download. The image retrieval succeeded, but actual file saving remains a manual acceptance check. Downloads now append the anchor to the document, use one `.jpg` extension and allow more time before revoking the blob URL.

Parent-specific browser acceptance awaits an existing parent session. Automated API and database parent permission tests have passed.

## Installed backend

Migrations: `media_album_library`, `media_group_owner_index`, `media_upload_returning_owner_access`. Custom-auth Edge functions: `media-library` and `media-upload`.

The frontend remains a preview pending the remaining role acceptance checks. Do not describe the system as fully browser-validated until parent checks and a manual download check are complete.
