-- Caledon Soccer Grassroots Player & Parent Code of Conduct.
-- Original user-supplied PDF SHA-256:
-- eee28a834b0802486c040417b9541b773dbcb72cdb66b44be8977a5272968ddd
-- The document itself contains no publication date. "version 1" is this site's
-- electronic sign-off record version, not an assertion of club publication date.
BEGIN;
INSERT INTO public.form_templates(form_key,title,version,description,schema_json,active)
VALUES (
 'code_of_conduct',
 'Caledon Soccer Grassroots Player & Parent Code of Conduct',
 1,
 'Official uploaded three-page Caledon Soccer Code of Conduct, with electronic parent and player acknowledgements.',
 jsonb_build_object(
  'document_sha256','eee28a834b0802486c040417b9541b773dbcb72cdb66b44be8977a5272968ddd',
  'original_pdf_path','/docs/caledon-soccer-grassroots-code-of-conduct-2026.pdf',
  'signature_fields',jsonb_build_array('player_name','guardian_name','player_signature_name','guardian_signature_name','date','linked_player_id'),
  'required_confirmations',jsonb_build_array('guardian_accepts','player_rules_discussed','player_signed'),
  'private_record',true,
  'independent_of_photo_consent',true
 ),
 true
)
ON CONFLICT(form_key,version) DO NOTHING;
COMMIT;
