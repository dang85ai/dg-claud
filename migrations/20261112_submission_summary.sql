BEGIN;

-- Keep notification emails free of user-supplied names, addresses and text.
CREATE OR REPLACE FUNCTION app_private.enqueue_contact_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF COALESCE(NEW.website_honeypot, '') <> '' THEN RETURN NEW; END IF;
  INSERT INTO public.notification_outbox(event_key, kind, source_id, recipient_email, subject, body_text)
  VALUES (
    'contact:' || NEW.id::text,
    CASE WHEN NEW.subject ILIKE '%sponsor%' THEN 'sponsorship' ELSE 'contact' END,
    NEW.id,
    'girlsoccer2018@gmail.com',
    'CUFC website inquiry',
    'A website inquiry was saved. Reference: ' || NEW.id::text || chr(10) ||
      'Sign in to the management portal to review it.'
  ) ON CONFLICT (event_key) DO NOTHING;
  RETURN NEW;
END
$function$;

-- Redact items that have never been attempted. Leave attempted payloads intact
-- so a retry cannot conflict with a provider idempotency key.
UPDATE public.notification_outbox
SET subject = 'CUFC website inquiry',
    body_text = 'A website inquiry was saved. Reference: ' || source_id::text || chr(10) ||
      'Sign in to the management portal to review it.'
WHERE kind IN ('contact', 'sponsorship')
  AND status IN ('queued', 'needs_setup')
  AND attempts = 0;

CREATE OR REPLACE FUNCTION public.manager_submission_summary()
RETURNS TABLE (
  source text,
  reference uuid,
  submitted_at timestamptz,
  review_status text,
  delivery_status text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT app_private.is_admin_aal2() THEN
    RAISE EXCEPTION 'Manager MFA required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT summary.*
  FROM (
    SELECT 'contact'::text AS source, c.id AS reference, c.created_at AS submitted_at,
           c.status::text AS review_status, n.status::text AS delivery_status
    FROM public.contact_submissions c
    LEFT JOIN public.notification_outbox n ON n.event_key = 'contact:' || c.id::text
    WHERE NOT EXISTS (
      SELECT 1 FROM public.sponsorship_inquiries s WHERE s.contact_submission_id = c.id
    )
    UNION ALL
    SELECT 'sponsorship', s.id, s.created_at, s.status::text, n.status::text
    FROM public.sponsorship_inquiries s
    LEFT JOIN public.notification_outbox n ON n.event_key = 'contact:' || s.contact_submission_id::text
    UNION ALL
    SELECT 'signed_form', f.id, f.created_at, 'signed', n.status::text
    FROM public.form_submissions f
    LEFT JOIN public.notification_outbox n ON n.event_key = 'signed-form:' || f.id::text
    UNION ALL
    SELECT 'portal_kit_order', k.id, k.ordered_at, k.payment_status::text, NULL::text
    FROM public.kit_orders k
  ) summary
  ORDER BY summary.submitted_at DESC NULLS LAST, summary.reference
  LIMIT 100;
END
$function$;

REVOKE ALL ON FUNCTION public.manager_submission_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.manager_submission_summary() TO authenticated;

COMMIT;

