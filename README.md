# Caledon Soccer Club U9 Girls 2026

Mobile-first Next.js/Tailwind team website and management portal.

## Safety posture

- Public roster is first-name-only and controlled by guardian consent.
- Private family/admin data is protected by Supabase Row Level Security.
- Admin/manager backend endpoints require an AAL2 MFA session.
- Uploaded images are processed server-side; the backend removes EXIF/GPS metadata and does not retain raw originals.
- The live Supabase project remains in development mode with `site_public = false`.
- No server secret belongs in this repository.

## Local setup

```bash
npm install
npm run dev
```

Optional environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://sgoxywyhaketjmdmkzhm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

The publishable key may be used in browser code because database access remains constrained by RLS. Never add a Supabase secret/service-role key to this repository.
