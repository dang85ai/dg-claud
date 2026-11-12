-- Caledon United FC: migrate 5v5 roster display from GK-LB-RB-CM-ST
-- to GK-CB-LM-RM-ST. This changes field assignments only, not roster
-- membership, preferred player positions, guardian consent or publication.
-- The strict current-state checks abort if another manager changed the board.
BEGIN;

DO $guard$
BEGIN
  IF (SELECT name FROM public.roster_formation WHERE id='team' FOR UPDATE) IS DISTINCT FROM '1-2-1-1' THEN
    RAISE EXCEPTION 'Formation changed since review; manual reconciliation required';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.player_public_profiles
    WHERE field_slot IS NOT NULL AND field_slot NOT IN ('GK','LB','RB','CM','ST')
  ) THEN
    RAISE EXCEPTION 'Unexpected saved slots; manual assignment review required';
  END IF;
END
$guard$;

-- PostgreSQL enforces this check in addition to the RPC validator.
ALTER TABLE public.roster_formation
  DROP CONSTRAINT roster_formation_name_check;
ALTER TABLE public.roster_formation
  ADD CONSTRAINT roster_formation_name_check
  CHECK (name IN ('1-1-2-1','1-2-1-1','1-2-2','1-3-2-1','1-2-3-1','1-3-3-2','1-4-3-1'));

-- Preserve all action permission checks by modifying only the two
-- formation-validation literals in the already deployed function body.
DO $rpc$
DECLARE
  definition text;
  old_slots text := 'when ''1-2-1-1'' then array[''GK'',''LB'',''RB'',''CM'',''ST'']';
  new_slots text := 'when ''1-1-2-1'' then array[''GK'',''CB'',''LM'',''RM'',''ST''] when ''1-2-1-1'' then array[''GK'',''LB'',''RB'',''CM'',''ST'']';
BEGIN
  SELECT pg_get_functiondef('app_private.roster_action(text,jsonb)'::regprocedure)
  INTO definition;
  IF position('if formation not in (' IN definition)=0 OR position(old_slots IN definition)=0 THEN
    RAISE EXCEPTION 'Roster RPC validation differs from inspected source';
  END IF;
  definition := replace(definition,'if formation not in (','if formation not in (''1-1-2-1'',');
  definition := replace(definition,old_slots,new_slots);
  EXECUTE definition;
END
$rpc$;

-- Preserve the five existing assigned players:
-- GK->GK, ST->ST, CM->CB, LB->LM, RB->RM.
-- These are provisional tactical field slots, NOT player preferred positions.
UPDATE public.player_public_profiles
SET field_slot=CASE field_slot
  WHEN 'CM' THEN 'CB'
  WHEN 'LB' THEN 'LM'
  WHEN 'RB' THEN 'RM'
  ELSE field_slot END,
  updated_at=now()
WHERE field_slot IN ('CM','LB','RB');

UPDATE public.roster_formation
SET name='1-1-2-1',updated_at=now()
WHERE id='team';

COMMIT;
