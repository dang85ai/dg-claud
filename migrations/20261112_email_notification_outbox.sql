-- CUFC transactional email outbox. This migration does not send emails or replay old records.
-- Private manager view requires a signed-in AAL2 manager. Only server-key functions may write.
BEGIN;
CREATE TABLE IF NOT EXISTS public.notification_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 event_key text NOT NULL UNIQUE,
 kind text NOT NULL CHECK (kind IN ('contact','sponsorship','signed_form')),
 source_id uuid NOT NULL,
 recipient_email text NOT NULL,
 subject text NOT NULL,
 body_text text NOT NULL,
 status text NOT NULL DEFAULT 'queued'
   CHECK (status IN ('queued','sending','needs_setup','accepted','delivered','failed','bounced')),
 provider_message_id text UNIQUE,
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 10),
 last_error text,
 last_attempt_at timestamptz,
 accepted_at timestamptz,
 delivered_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notification_outbox_status_created_idx
 ON public.notification_outbox(status,created_at);
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notification_outbox FROM anon, authenticated;
GRANT SELECT ON public.notification_outbox TO authenticated;
GRANT ALL ON public.notification_outbox TO service_role;
DROP POLICY IF EXISTS notification_manager_read ON public.notification_outbox;
CREATE POLICY notification_manager_read ON public.notification_outbox FOR SELECT TO authenticated
 USING (app_private.is_admin_aal2());

CREATE OR REPLACE FUNCTION app_private.enqueue_contact_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
 IF COALESCE(NEW.website_honeypot,'') <> '' THEN RETURN NEW; END IF;
 INSERT INTO public.notification_outbox(event_key,kind,source_id,recipient_email,subject,body_text)
 VALUES (
  'contact:'||NEW.id::text,
  CASE WHEN NEW.subject ILIKE '%sponsor%' THEN 'sponsorship' ELSE 'contact' END,
  NEW.id,
  'girlsoccer2018@gmail.com',
  'CUFC website inquiry: '||left(COALESCE(NULLIF(NEW.subject,''),'General contact'),100),
  'A new website inquiry was saved.'||chr(10)||
  'Name: '||left(NEW.name,120)||chr(10)||
  'Reply email: '||left(NEW.email,320)||chr(10)||
  'Reference: '||NEW.id::text||chr(10)||
  'Sign in to management to review the full submission. Never reply with child medical details.'
 ) ON CONFLICT(event_key) DO NOTHING;
 RETURN NEW;
END $function$;
DROP TRIGGER IF EXISTS contact_notification_outbox ON public.contact_submissions;
CREATE TRIGGER contact_notification_outbox AFTER INSERT ON public.contact_submissions
 FOR EACH ROW EXECUTE FUNCTION app_private.enqueue_contact_notification();

CREATE OR REPLACE FUNCTION app_private.enqueue_signed_form_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE template_title text;
BEGIN
 SELECT title INTO template_title FROM public.form_templates WHERE id=NEW.form_template_id;
 INSERT INTO public.notification_outbox(event_key,kind,source_id,recipient_email,subject,body_text)
 VALUES (
  'signed-form:'||NEW.id::text,'signed_form',NEW.id,'girlsoccer2018@gmail.com',
  'CUFC parent form signed: '||left(COALESCE(template_title,'Team form'),100),
  'A guardian submitted a signed team form.'||chr(10)||
  'Form: '||left(COALESCE(template_title,'Team form'),100)||chr(10)||
  'Receipt reference: '||NEW.id::text||chr(10)||
  'Signed: '||COALESCE(NEW.signed_at,now())::text||chr(10)||
  'Review securely in the MFA-protected management portal. No medical details or child identifiers are sent by email.'
 ) ON CONFLICT(event_key) DO NOTHING;
 RETURN NEW;
END $function$;
DROP TRIGGER IF EXISTS signed_form_notification_outbox ON public.form_submissions;
CREATE TRIGGER signed_form_notification_outbox AFTER INSERT ON public.form_submissions
 FOR EACH ROW EXECUTE FUNCTION app_private.enqueue_signed_form_notification();
COMMIT;