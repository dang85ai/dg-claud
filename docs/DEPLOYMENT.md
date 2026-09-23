# Netlify Deployment

Target project: `caledon-u9-girls-2026`

The Netlify project already exists and has these browser-safe variables configured:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Current launch posture

- Supabase `site_public = false`
- Public player/event/media data is blocked by the global publication gate
- Public pages remain unpublished
- Outbound team email is disabled
- Development review address remains `daniel.f.guerra@gmail.com`
- Public display contact remains `girlsoccer@r5play.net`
- Netlify project access is restricted by team login

## Repository connection

Connect GitHub repository:

`dang85ai/dg-claud`

to Netlify project:

`caledon-u9-girls-2026`

Build settings are supplied by `netlify.toml`.

No Supabase secret/service-role key should ever be added to Netlify frontend environment variables.

## Launch checklist

Do not set `site_public = true` until:

1. Final roster and guardian links are loaded.
2. Photo/media consent has been collected.
3. Public player profiles are reviewed.
4. Coaching staff and schedule content are approved.
5. Exact Adidas kit SKUs are finalized.
6. Medical-release wording is approved by the club.
7. Admin MFA is tested.
8. Parent access is tested with a non-admin account.
9. Media moderation and consent removal are tested.
10. Public communications routing is explicitly approved.
