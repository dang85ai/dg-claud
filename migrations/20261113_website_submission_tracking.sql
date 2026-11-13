BEGIN;

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
    SELECT CASE WHEN c.subject = 'Caledon United 2018 Girls — Team Kit Order Request' THEN 'kit_request' ELSE 'contact' END AS source, c.id AS reference, c.created_at AS submitted_at,
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
    UNION ALL
    SELECT 'parent_invite', r.id, r.created_at, r.status::text, latest.status::text
    FROM public.parent_invite_requests r
    LEFT JOIN LATERAL (
      SELECT n.status FROM public.notification_outbox n
      WHERE n.kind = 'account_invite' AND n.source_id = r.id
      ORDER BY n.created_at DESC, n.id DESC
      LIMIT 1
    ) latest ON true
  ) summary
  ORDER BY summary.submitted_at DESC NULLS LAST, summary.reference
  LIMIT 100;
END
$function$;

REVOKE ALL ON FUNCTION public.manager_submission_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.manager_submission_summary() TO authenticated;

COMMIT;

