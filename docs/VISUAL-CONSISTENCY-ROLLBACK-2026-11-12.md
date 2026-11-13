# Caledon United FC — Visual Consistency Rollback

Recorded before implementation, November 12, 2026.

- Backup GitHub branch: `backup-before-visual-consistency-2026-11-12`
- Original source commit: `19a6301841e77147413b7a24f3a6a516994c43da`
- Original Netlify production deployment ID: `6af67ba60495998b5ab5f86b`
- Netlify site ID: `2b01d84c-f2eb-4e6d-a486-0546ffcac16e`
- Supabase project ID: `sgoxywyhaketjmdmkzhm`

Scope: aesthetic changes in React components, page layouts and CSS. Database writes, migrations, private assets and consent settings are **out of scope**.

## Rollback
1. Check Netlify deploy history for the original deploy above. Restore/publish that immutable deployment using authorized Netlify UI controls if a release fails acceptance.
2. Revert the visual-consistency GitHub PR commits, or branch from the preserved original commit and selectively reapply subsequent non-design changes.
3. Inspect public, parent and MFA-enabled management routes after rollback.
4. No Supabase schema or content rollback should be needed because this project does not change Supabase.

This is a source/deployment checkpoint, **not** a database backup. Supabase schema/table and migration inventories were recorded read-only; the connected tooling did not offer a full managed database backup export.
