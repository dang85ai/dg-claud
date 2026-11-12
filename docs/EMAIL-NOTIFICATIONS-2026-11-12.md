# CUFC Email Notifications — Release & Activation Checklist
Date: 2026-11-12
Site: https://caledonunited2018girls.ca
Recipient for contact, sponsorship and form alerts: girlsoccer2018@gmail.com

## Included in this release
- Supabase database outbox with private AAL2 manager access; only new contact and signed-form records are queued. Existing submissions are not replayed or resent.
- Contact/sponsorship submissions are saved first; the server then attempts delivery independently. A mail failure never erases an inquiry.
- Medical/photo/code-of-conduct signatures are saved with existing guardian protections; email contains a private receipt reference only, not child medical information.
- Resend worker uses a stable idempotency key, a maximum of five attempts and distinct queued, needs_setup, failed, accepted, delivered and bounced statuses.
- Verified Svix/Resend webhooks update delivered or bounced status; provider acceptance is not delivery proof.
- Admin > Email Notifications shows the latest 100 records and allows an MFA manager to retry failed/blocked items after configuration.
- Parent Onboarding (Family Links) uses verified Resend to deliver the private single-use activation link when configured, otherwise explicitly presents a manual share link. The raw token is not logged.
- Accounts & Invites continues using Supabase Auth email with existing MFA and account auditing. "Accepted" is not proof of delivery.
- Team Kit Request continues using native Netlify Forms with its original receipt flow and email-copy fallback. Kit notification setup requires a confirmed recipient in Netlify; this is separate from Resend.
- No existing contact submission, invite, form signature or user record was changed by these new notification triggers.

## Required owner/provider actions BEFORE email delivery can be declared operational
1. Create or connect a Resend account. Add and verify domain **caledonunited2018girls.ca**. Follow Resend's SPF/DKIM records; do not overwrite existing MX records or unrelated DNS records. Resend recommends verified domains for production.
2. Create a restricted Resend API key; store it only as a server secret in Supabase Edge Functions:
   RESEND_API_KEY = [secret from Resend]
   NOTIFICATION_FROM = "Caledon United FC <notifications@caledonunited2018girls.ca>"
   Do not commit the key or place it in NEXT_PUBLIC_* environment variables.
3. In Resend, create an endpoint at:
   https://sgoxywyhaketjmdmkzhm.supabase.co/functions/v1/resend-delivery-webhook
   Subscribe to email.delivered, email.bounced, email.failed and email.complained.
   Save the corresponding RESEND_WEBHOOK_SECRET as a Supabase Edge Function secret. Do not expose it to visitors or commit it.
4. For **Netlify Team Kit Request**, open Netlify site -> Forms -> Submission notifications -> Add notification -> Email -> "team-kit-order" (or all verified submissions), to girlsoccer2018@gmail.com. The recipient must CONFIRM the Netlify email invitation (unless already a team member). Netlify's Nov 9, 2026 update allows external recipients with confirmation. No email is sent until confirmation.
5. For **Supabase Auth account invitations** configure a verified custom SMTP provider in Supabase Auth (Resend's SMTP service or the club's mail service) if not already configured. This is separate from Edge secrets; Auth's built-in default mail is subject to limits and may be unable to send to arbitrary recipients.
6. Open https://caledonunited2018girls.ca/admin/notifications with a verified MFA manager account. Confirm provider_configured=true; if false, notifications are safely saved as needs_setup and not delivered.
7. Test with controlled email addresses only:
   - Contact inquiry -> manager inbox receives alert, correct outbox status and webhooks.
   - Sponsorship inquiry -> records persist and one notification, not duplicate.
   - Medical release, photo consent, code-of-conduct signoff -> only a receipt reference, no sensitive form body in outgoing mail.
   - Netlify kit request -> confirmed recipient receives team kit email and request appears under Netlify Forms.
   - Family Links parent invite -> parent receives a single-use link; no other child is automatically linked.
   - Accounts & Invites -> Supabase Auth message received (or manual link fallback).
   - Force a known provider rejection and verify it surfaces as failed; retry only once corrected.
8. Never use actual parent addresses for tests without approval, and do not resend historical pending invitations en masse.
9. Record a successful inbox-delivery test for each workflow before production operational sign-off.

## Failure and recovery
- A form save and its outbound notification are distinct events. The user gets confirmation when the submission is saved, not when inbox delivery occurs.
- accepted: Resend API accepted. delivered: signed Resend webhook confirmed handoff to recipient mail server. Neither proves message was opened.
- needs_setup: sender API key/domain missing. failed: provider rejected or unavailable. bounced: recipient mail provider rejected.
- The queue is not auto-drained on a timer without additional authorized scheduling. Managers may retry one item at a time; new submissions trigger immediate attempts.
- If the sender cannot be configured yet, restore periodic manual review of website inquiries and signed forms. The administration UI shows unsent records.
- Treat legacy form submissions and pending invites as separate records; do not auto-send historical data.

## Code/ownership
- Supabase migrations/20261112_email_notification_outbox.sql (RLS, trigger-only queue)
- supabase/functions/notification-dispatch/index.ts (private worker / manager audit)
- supabase/functions/resend-delivery-webhook/index.ts (verified delivery status)
- supabase/functions/contact-submit/index.ts, parent-actions/index.ts and parent-onboarding/index.ts
- app/admin/notifications/page.tsx (MFA management UI)
- public/__forms.html (Netlify native kit form remains intact)
