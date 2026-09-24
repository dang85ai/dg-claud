# Cloudflare Workers deployment

The Caledon U9 Girls 2026 frontend is configured to run on Cloudflare Workers using OpenNext.

## Current status

- Next.js 15 application: compatible
- OpenNext Cloudflare build: passing
- Netlify remains the production fallback until Cloudflare is verified
- Supabase remains the backend for authentication, MFA, database, storage, and Edge Functions

## One-time Cloudflare setup

1. Create or sign in to a Cloudflare account.
2. Copy the Cloudflare Account ID.
3. Create a scoped API token with Workers edit/deploy permissions for that account.
4. In GitHub, open this repository:
   - Settings
   - Secrets and variables
   - Actions
   - New repository secret
5. Add these two repository secrets:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
6. Never commit either value to the repository.

## Deploy

Run the GitHub Actions workflow:

`Deploy to Cloudflare Workers`

The workflow installs dependencies, builds the existing Next.js app with OpenNext, and deploys the Worker defined by `wrangler.jsonc`.

## Validation before leaving Netlify

Verify:

- Home, Schedule, Kit, Sponsors and Contact
- Login and password activation
- MFA QR enrollment and AAL2 admin access
- Parent Portal
- Admin Command Centre
- Supabase requests
- robots.txt and sitemap.xml
- 404 handling
- favicon and social-share assets

Do not disable Netlify until the Cloudflare production URL passes these checks.
