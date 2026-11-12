# Caledon United FC — Controlled Portal Restoration

Date: 2026-11-11
Historical GitHub reference: 958cfa3f7dec5ce02ccd3b19c7987ec5158a584b
Historical Netlify reference: 6ac1c85c6ca02c1b0ed7f961 (exact source parity not established)
Production: https://caledonunited2018girls.ca

## GitHub releases

1. PR #12 — Photography: restored the original square/circular crop and consent-controlled upload and review flow using the existing media-upload, roster-api and media-library services. Linked guardians can submit; MFA managers must inspect a protected processed preview before approval.
2. PR #13 — Navigation: grouped desktop sidebars and mobile slide-out drawers for both parent and management, retaining all existing portal and kit paths.
3. PR #14 — Missing modules: restored finance, media, attendance, signed forms, carpool, recognition, duties, payments, equipment, referee and settings pages. Kept the historical hard-coded minor player bootstrap out of the project. All 23 relevant tables are present in the current schema.
4. PR #15 — Player cards and formation: added local downloadable PNG home/away player cards for authorized parents or managers and an interactive formation with protected portrait markers.
5. Validation guard: scripts/verify-portal-restoration.mjs runs before every build, checking required routes, media/consent guards, red/white uniform assets, and sponsor preservation.

## Security

- No public player names/photos are automatically enabled.
- Image uploads and media reads require authorization and current consent; pending photos require private inspection.
- No static public URLs to private roster images; manager functions require AAL2 and role-verified RLS.
- The old fixed squad records were intentionally excluded.
- Locally exported player cards are never saved to the public website.

## Validation performed

- Pull-request and production GitHub/Netlify build workflows.
- Netlify published readiness.
- Read-only schema audit of 23 module tables.
- Static restoration source tests.

## Manual acceptance still outstanding (unverified)

Authenticated parent and MFA manager browser tests were not possible from this environment. The live domain is not reachable for browser-level HTTP testing from this runtime. No fake guardian or manager accounts were created.

1. Parent: sign in and verify mobile drawer links for finances, forms, attendance, media, duties and account.
2. Linked guardian: submit a cropped test portrait with current consent; ensure it remains pending and private.
3. MFA manager: inspect private photo before approval, reject invalid items, approve a properly consented image.
4. Check revoked consent and unrelated parent access do not reveal a player image.
5. Manager: save a 5v5 formation; test touchscreen and keyboard player markers.
6. Parent and manager: download red Home and white Away cards only for authorized players.
7. Verify finance, media, schedule, Spond and admin modules on real accounts; confirm no 404 or authorization errors.
8. Smoke-test public Sponsors, Kit, Order and Roster pages; verify mobile Safari and desktop Chrome.
9. Record results and screenshots before operational acceptance.

## Data limitations

At last read-only audit: 9 active player records, 3 previously approved photo requests, no public profiles and 0 portraits linked to player profiles. Old approvals must not be auto-published; current guardian consent and image records need manager review.

## Rollback

Retain earlier Netlify immutable deploys and GitHub PR commits. Do not replace current website with October code wholesale, which would overwrite improved kit, sponsor and staff features.
