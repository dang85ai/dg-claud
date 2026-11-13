import { connectionAction, ConnectionError } from './core.mjs';

export async function runSync(client, credentials, fetcher = fetch) {
  const claim = await client.rpc('spond_sync_claim');
  if (claim.error) throw new ConnectionError('sync_unavailable', 'Unable to start the schedule sync.', 503);
  if (claim.data.skipped) return { ok: true, skipped: claim.data.skipped };
  const lease = claim.data.lease_id;
  try {
    const preview = await connectionAction({ action: 'preview', group_id: claim.data.group_id }, credentials, fetcher);
    if (preview.possibly_truncated) throw new ConnectionError('incomplete_schedule', 'Spond reached the 100-event limit. Sync stopped without changing the schedule.', 409);
    const applied = await client.rpc('spond_sync_apply', { p_lease: lease, p_group: claim.data.group_id, p_events: preview.events });
    if (applied.error) throw new ConnectionError('sync_conflict', 'Unable to apply the schedule. No partial changes were saved.', 409);
    return { ok: true, summary: applied.data };
  } catch (error) {
    const safe = error instanceof ConnectionError ? error.message : 'Spond sync failed. Try again later.';
    await client.rpc('spond_sync_finish', { p_lease: lease, p_error: safe });
    throw error instanceof ConnectionError ? error : new ConnectionError('sync_failed', safe);
  }
}
