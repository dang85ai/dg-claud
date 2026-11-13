# Caledon United FC — Visual Consistency Release

Baseline checkpoint (before any changes)
- Production source: `19a6301841e77147413b7a24f3a6a516994c43da`
- GitHub backup branch: `backup-pre-visual-consistency-20261112` (immutable original commit)
- Netlify previously published deployment ID: `6af67ba60495998b5ab5f86b` (ready)
- Supabase: database schema and private team data left untouched. Supabase data backup not claimed.
- The previous version remains in GitHub and the Netlify deploy history for rollback.

Public release scope
- Keep full photographic banners on major public pages.
- Restore consistent banner treatment on FAQ, Game Day and End of Season with precise titles.
- Use a restrained accessible document header for Privacy, Accessibility, Photo Safety and Code of Conduct.
- Align banner width to the existing 1,180 px content grid.
- Keep spacing, card styles, and typography consistent; improve album empty states without revealing children's media.
- Shorten Sponsors' duplicated introduction while retaining campaigns and calls to action.

Separate portal release scope
- One compact branded header across all parent and management pages.
- Preserve sidebars, slide-out drawers, permissions, all module routes, forms and MFA.
- Compact headings and card spacing, responsive layouts, robust PDF/print handling.

Verification checklist
- Automated frontend build and existing regression checks.
- Routes: /, /about, /roster, /schedule, /development, /kit, /order, /sponsors, /media, /parents, /conduct, /faq, /game-day, /privacy, /photo-safety, /accessibility, /end-of-season.
- Portal: /portal, /portal/players, /portal/training, /portal/finances, /portal/conduct, /portal/activity/forms, /admin, /admin/manage, /admin/accounts, /admin/finances, /admin/conduct, /admin/formation, /admin/modules/schedule.
- Browser visual checks at 390, 768, 1024 and 1440 px and authenticated parent/manager MFA checks still require live browser sessions; no claim of completion without testing.
- Rollback: restore previous GitHub commit and republish its Netlify build; do not roll back database (none modified).
