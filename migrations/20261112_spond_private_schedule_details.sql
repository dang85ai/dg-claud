ALTER POLICY events_public_read ON public.events
USING (app_private.site_is_public() AND public_visible
       AND external_source IS DISTINCT FROM 'spond_api');

CREATE OR REPLACE FUNCTION public.spond_sync_apply(p_lease uuid, p_group text, p_events jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  c public.spond_sync_config;
  item jsonb;
  link public.spond_event_links;
  ev public.events;
  target uuid;
  matches int;
  managed jsonb;
  incoming jsonb;
  event_kind public.event_type;
  added int := 0;
  adopted int := 0;
  changed int := 0;
  unchanged int := 0;
  conflicts int := 0;
  skipped int := 0;
  summary jsonb;
begin
  select * into c from public.spond_sync_config where singleton for update;

  if c.lease_id is distinct from p_lease or c.lease_until < clock_timestamp() then
    raise exception 'Invalid sync lease';
  end if;

  if not c.enabled or c.group_id is distinct from p_group then
    raise exception 'Sync disabled or group changed';
  end if;

  if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events) >= 100 then
    raise exception 'Incomplete or invalid Spond data';
  end if;

  if exists(
    select 1
    from jsonb_array_elements(p_events) e
    group by e->>'id'
    having count(*) > 1
  ) then
    raise exception 'Duplicate Spond IDs';
  end if;

  for item in select value from jsonb_array_elements(p_events)
  loop
    if nullif(item->>'id','') is null
       or nullif(item->>'title','') is null
       or nullif(item->>'starts_at','') is null
       or jsonb_typeof(item->'cancelled') is distinct from 'boolean'
    then
      raise exception 'Invalid Spond event';
    end if;

    incoming := jsonb_build_object(
      'title', left(item->>'title', 180),
      'starts_at', (item->>'starts_at')::timestamptz,
      'status', case when (item->>'cancelled')::boolean then 'cancelled' else 'scheduled' end,
      'venue_name', nullif(left(item->>'venue', 180), ''),
      'venue_address', nullif(left(item->>'venue_address', 350), ''),
      'arrival_at', (item->>'arrival_at')::timestamptz
    );

    -- Do not default Spond fixtures to practices. Unrecognized names require review.
    event_kind := case
      when coalesce(item->>'title', '') ~* '(practice|training|development|goalkeeper|skills|warmup)' then 'practice'::public.event_type
      when coalesce(item->>'title', '') ~* '(^|[[:space:]])(match|game|fixture|friendly|vs[.]?|versus)([[:space:][:punct:]]|$)'
        or (coalesce(item->>'title', '') ~ '[[:space:]]+[-–—][[:space:]]+'
          and coalesce(item->>'title', '') ~* '(u[0-9]{1,2}|gu[0-9]{1,2}|[[:space:]]fc[[:space:]]|[[:space:]]sc[[:space:]])')
        then 'game'::public.event_type
      else 'team_event'::public.event_type
    end;

    select * into link
    from public.spond_event_links
    where group_id = p_group
      and external_event_id = item->>'id';

    if not found then
      select count(*), (array_agg(e.id))[1]
      into matches, target
      from public.events e
      where e.title = item->>'title'
        and e.starts_at = (item->>'starts_at')::timestamptz
        and e.external_source = 'spond_manual'
        and not exists(
          select 1
          from public.spond_event_links l
          where l.event_id = e.id
        );

      if matches > 1 then
        conflicts := conflicts + 1;
        continue;
      end if;

      if matches = 0 then
        if (item->>'starts_at')::timestamptz < clock_timestamp() - interval '1 day' then
          skipped := skipped + 1;
          continue;
        end if;

        insert into public.events(
          event_type,
          title,
          starts_at,
          venue_name,
          venue_address,
          arrival_at,
          status,
          public_visible,
          external_source,
          external_event_id
        )
        values(
          event_kind,
          incoming->>'title',
          (item->>'starts_at')::timestamptz,
          incoming->>'venue_name',
          incoming->>'venue_address',
          (incoming->>'arrival_at')::timestamptz,
          (incoming->>'status')::public.event_status,
          true,
          'spond_api',
          item->>'id'
        )
        returning id into target;

        added := added + 1;
      else
        adopted := adopted + 1;
      end if;

      select * into ev from public.events where id = target for update;

      insert into public.spond_event_links(group_id, external_event_id, event_id, baseline)
      values(
        p_group,
        item->>'id',
        target,
        jsonb_build_object(
          'title', ev.title,
          'starts_at', ev.starts_at,
          'status', ev.status,
          'venue_name', ev.venue_name
        )
      );

      select * into link
      from public.spond_event_links
      where group_id = p_group
        and external_event_id = item->>'id';
    end if;

    select * into ev from public.events where id = link.event_id for update;

    -- Preserve locally edited logistics when the upstream value differs,
    -- and keep known details when Spond omits them.
    if incoming->>'venue_name' is null or
       (ev.venue_name is not null and to_jsonb(ev.venue_name) is distinct from link.baseline->'venue_name') then
      incoming := incoming || jsonb_build_object('venue_name', ev.venue_name);
    end if;
    if incoming->>'venue_address' is null or
       (ev.venue_address is not null and to_jsonb(ev.venue_address) is distinct from link.baseline->'venue_address') then
      incoming := incoming || jsonb_build_object('venue_address', ev.venue_address);
    end if;
    if incoming->>'arrival_at' is null or
       (ev.arrival_at is not null and to_jsonb(ev.arrival_at) is distinct from link.baseline->'arrival_at') then
      incoming := incoming || jsonb_build_object('arrival_at', ev.arrival_at);
    end if;

    managed := jsonb_build_object(
      'title', ev.title,
      'starts_at', ev.starts_at,
      'status', ev.status,
      'venue_name', ev.venue_name,
      'venue_address', ev.venue_address,
      'arrival_at', ev.arrival_at
    );

    if (managed - array['venue_name','venue_address','arrival_at']) is distinct from
       (link.baseline - array['venue_name','venue_address','arrival_at']) and
       (managed - array['venue_name','venue_address','arrival_at']) is distinct from
       (incoming - array['venue_name','venue_address','arrival_at']) then
      update public.spond_event_links set conflict = true where event_id = ev.id;
      conflicts := conflicts + 1;
      continue;
    end if;

    if managed is distinct from incoming then
      update public.events
      set
        title = incoming->>'title',
        event_type = event_kind,
        starts_at = (incoming->>'starts_at')::timestamptz,
        venue_name = incoming->>'venue_name',
        venue_address = incoming->>'venue_address',
        arrival_at = (incoming->>'arrival_at')::timestamptz,
        status = (incoming->>'status')::public.event_status,
        public_visible = true,
        external_source = 'spond_api',
        external_event_id = item->>'id'
      where id = ev.id;

      changed := changed + 1;
    else
      unchanged := unchanged + 1;

      update public.events
      set
        event_type = event_kind,
        public_visible = true,
        external_source = 'spond_api',
        external_event_id = item->>'id'
      where id = ev.id;
    end if;

    update public.spond_event_links
    set baseline = (incoming - array['venue_name','venue_address','arrival_at']) ||
      jsonb_build_object(
        'venue_name', coalesce(nullif(to_jsonb(nullif(left(item->>'venue',180),'')), 'null'::jsonb), link.baseline->'venue_name'),
        'venue_address', coalesce(nullif(to_jsonb(nullif(left(item->>'venue_address',350),'')), 'null'::jsonb), link.baseline->'venue_address'),
        'arrival_at', coalesce(nullif(to_jsonb((item->>'arrival_at')::timestamptz), 'null'::jsonb), link.baseline->'arrival_at')
      ), conflict = false
    where event_id = ev.id;
  end loop;

  summary := jsonb_build_object(
    'added', added,
    'adopted', adopted,
    'updated', changed,
    'unchanged', unchanged,
    'conflicts', conflicts,
    'skipped_past', skipped,
    'received', jsonb_array_length(p_events)
  );

  update public.spond_sync_config
  set
    last_success_at = clock_timestamp(),
    last_error = null,
    last_summary = summary,
    lease_id = null,
    lease_until = null
  where singleton;

  return summary;
end
$function$
;
