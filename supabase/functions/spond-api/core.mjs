// Server-only adapter for the unofficial consumer API. Never return upstream bodies.
const API = 'https://api.spond.com/core/v1/';
export class ConnectionError extends Error {
  constructor(code, message, status = 502) { super(message); this.code = code; this.status = status; }
}
const fail = (code, message, status) => { throw new ConnectionError(code, message, status); };
const text = (value, length = 180) => typeof value === 'string' ? value.slice(0, length) : '';
export function allowedOrigin(origin) {
  return origin === 'https://caledon-u9-girls-2026.netlify.app' ||
    /^https:\/\/[a-f0-9]{24}--caledon-u9-girls-2026\.netlify\.app$/.test(origin);
}

async function upstream(fetcher, path, init) {
  let response;
  try {
    response = await fetcher(API + path, { ...init, redirect: 'error', signal: AbortSignal.timeout(12000) });
  } catch { fail('upstream_unavailable', 'Spond could not be reached. Try again later.'); }
  if (response.status === 429) fail('rate_limited', 'Spond is limiting requests. Wait before trying again.', 429);
  if (response.status === 401 || response.status === 403) fail('authentication_failed', 'Spond login failed or requires verification. Check the private connection settings.', 502);
  if (!response.ok) fail('upstream_unavailable', 'Spond rejected the request. The unofficial API may have changed.');
  // Limit upstream input, including chunked responses, before JSON decoding.
  const reader = response.body?.getReader();
  if (!reader) fail('invalid_response', 'Spond returned an invalid response.');
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 2 * 1024 * 1024) { await reader.cancel(); fail('response_too_large', 'Spond returned too much data.'); }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof ConnectionError) throw error;
    fail('upstream_unavailable', 'Spond could not be reached. Try again later.');
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { fail('invalid_response', 'Spond returned an invalid response.'); }
}

export async function connectionAction(input, credentials, fetcher = fetch) {
  const action = input?.action;
  if (!['status', 'connect', 'preview'].includes(action)) fail('invalid_action', 'Choose a connection test or event preview.', 400);
  const configured = Boolean(credentials.email && credentials.password);
  if (action === 'status') return { ok: true, configured, provider: 'spond', unofficial: true, read_only: true };
  if (!configured) fail('not_configured', 'Add SPOND_EMAIL and SPOND_PASSWORD in the private server secrets first.', 409);
  if (action === 'preview' && !/^[A-Fa-f0-9]{32}$/.test(input.group_id || '')) fail('invalid_group', 'Choose a Spond group returned by the connection test.', 400);
  const login = await upstream(fetcher, 'auth2/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.email, password: credentials.password })
  });
  const token = login?.accessToken?.token;
  if (typeof token !== 'string' || !token) fail('authentication_failed', 'Spond login failed or requires verification. Check the private connection settings.');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const groups = await upstream(fetcher, 'groups/', { headers });
  if (!Array.isArray(groups) || groups.some(g => !g || !/^[A-Fa-f0-9]{32}$/.test(g.id || '') || typeof g.name !== 'string')) fail('invalid_response', 'Spond returned an unexpected group list.');
  if (action === 'connect') return {
    ok: true, connected: true, read_only: true, checked_at: new Date().toISOString(),
    groups: groups.map(g => ({ id: g.id, name: text(g.name) }))
  };
  const selected = groups.find(g => g.id === input.group_id);
  if (!selected) fail('group_forbidden', 'This Spond account cannot access the selected group.', 403);
  const params = new URLSearchParams({ groupId: selected.id, max: '100', scheduled: 'true', includeHidden: 'false' });
  const events = await upstream(fetcher, 'sponds/?' + params, { headers });
  if (!Array.isArray(events) || events.length > 100) fail('invalid_response', 'Spond returned an unexpected event list.');
  const seen = new Set();
  const preview = events.map(e => {
    if (!e || typeof e.id !== 'string' || !e.id || seen.has(e.id) ||
      typeof e.heading !== 'string' || typeof e.startTimestamp !== 'string' || !Number.isFinite(Date.parse(e.startTimestamp)) ||
      (e.groupId && e.groupId !== selected.id)) fail('invalid_response', 'Spond returned invalid or duplicate events.');
    seen.add(e.id);
    return { id: text(e.id, 100), title: text(e.heading), starts_at: new Date(e.startTimestamp).toISOString(),
      venue: text(e.location?.name), cancelled: e.cancelled === true };
  });
  return { ok: true, read_only: true, group: { id: selected.id, name: text(selected.name) },
    checked_at: new Date().toISOString(), events: preview, possibly_truncated: events.length === 100,
    warning: events.length === 100 ? 'Spond returned the 100-event limit. This preview may be incomplete.' : null };
}

export async function handleRequest(req, deps) {
  const origin = req.headers.get('Origin') || '';
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin',
    ...(allowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } : {}) };
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (origin && !allowedOrigin(origin)) return json({ error: 'Origin not allowed.' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    await deps.authorize(req);
    const body = await req.text();
    if (body.length > 2048) fail('invalid_input', 'Request is too large.', 400);
    let input; try { input = JSON.parse(body); } catch { fail('invalid_input', 'Invalid request.', 400); }
    const data = await connectionAction(input, deps.credentials(), deps.fetcher);
    return json(data);
  } catch (error) {
    if (error instanceof ConnectionError) return json({ ok: false, code: error.code, error: error.message }, error.status);
    return json({ ok: false, error: 'Unable to complete the connection request.' }, 500);
  }
}
