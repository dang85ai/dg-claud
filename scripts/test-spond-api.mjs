import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { connectionAction, handleRequest, ConnectionError, allowedOrigin } from '../supabase/functions/spond-api/core.mjs';

const groupId = 'A'.repeat(32);
const credentials = { email: 'test@example.invalid', password: 'secret-not-for-output' };
const login = { accessToken: { token: 'private-test-token' } };
const groups = [{ id: groupId, name: 'U9 Girls', members: [{ firstName: 'Private child', email: 'private@example.invalid' }] }];
const event = { id: 'event-1', heading: 'Practice', startTimestamp: '2026-10-06T22:00:00Z', groupId,
  location: { name: 'Field' }, cancelled: false, responses: { acceptedIds: ['private-member'] }, description: 'private details' };
let count = 0;
async function test(name, action) { await action(); count++; console.log('PASS', name); }
function mock(responses) {
  const calls = [];
  const fetcher = async (url, init) => { calls.push({ url, init }); assert.ok(responses.length, 'Unexpected upstream call');
    const next = responses.shift(); if (next instanceof Error) throw next;
    return next instanceof Response ? next : Response.json(next); };
  return { fetcher, calls };
}
await test('status makes no upstream request and exposes no credentials', async () => {
  const m = mock([]); const r = await connectionAction({ action: 'status' }, credentials, m.fetcher);
  assert.equal(r.configured, true); assert.equal(m.calls.length, 0); assert.equal(JSON.stringify(r).includes(credentials.password), false);
});
await test('unconfigured fails before login', async () => {
  const m = mock([]); await assert.rejects(connectionAction({ action: 'connect' }, {}, m.fetcher), e => e.code === 'not_configured');
});
await test('connection strips members and tokens', async () => {
  const m = mock([login, groups]); const r = await connectionAction({ action: 'connect' }, credentials, m.fetcher);
  assert.deepEqual(r.groups, [{ id: groupId, name: 'U9 Girls' }]);
  assert.equal(m.calls[0].url, 'https://api.spond.com/core/v1/auth2/login');
  assert.equal(m.calls[0].init.redirect, 'error'); assert.equal(m.calls[1].init.headers.Authorization, 'Bearer private-test-token');
  assert.ok(!JSON.stringify(r).includes('private'));
});
await test('two-step challenge is redacted and stops before groups', async () => {
  const m = mock([{ challengeToken: 'never-return', phoneNumber: 'never-return' }]);
  await assert.rejects(connectionAction({ action: 'connect' }, credentials, m.fetcher), e => e.code === 'authentication_failed' && !e.message.includes('never-return'));
  assert.equal(m.calls.length, 1);
});
await test('preview checks actual membership, filters to one group, sanitizes events', async () => {
  const m = mock([login, groups, [event]]); const r = await connectionAction({ action: 'preview', group_id: groupId }, credentials, m.fetcher);
  assert.equal(new URL(m.calls[2].url).searchParams.get('groupId'), groupId);
  assert.equal(new URL(m.calls[2].url).searchParams.get('includeHidden'), 'false');
  assert.equal(r.events[0].starts_at, '2026-10-06T22:00:00.000Z'); assert.equal(r.events[0].title, 'Practice');
  assert.ok(!JSON.stringify(r).includes('private')); assert.equal(r.possibly_truncated, false);
});
await test('foreign group never fetches events', async () => {
  const m = mock([login, groups]); await assert.rejects(connectionAction({ action: 'preview', group_id: 'B'.repeat(32) }, credentials, m.fetcher), e => e.code === 'group_forbidden');
  assert.equal(m.calls.length, 2);
});
for (const [name, bad] of [['invalid date', { ...event, startTimestamp: 'not a date' }], ['foreign event', { ...event, groupId: 'B'.repeat(32) }], ['missing title', { ...event, heading: null }]]) {
  await test(name + ' fails closed', async () => { const m = mock([login, groups, [bad]]);
    await assert.rejects(connectionAction({ action: 'preview', group_id: groupId }, credentials, m.fetcher), e => e.code === 'invalid_response'); });
}
await test('duplicate event IDs fail closed', async () => {
  const m = mock([login, groups, [event, event]]); await assert.rejects(connectionAction({ action: 'preview', group_id: groupId }, credentials, m.fetcher), e => e.code === 'invalid_response');
});
await test('100-event cap is explicitly labeled incomplete', async () => {
  const m = mock([login, groups, Array.from({ length: 100 }, (_, i) => ({ ...event, id: String(i) }))]);
  const r = await connectionAction({ action: 'preview', group_id: groupId }, credentials, m.fetcher); assert.equal(r.possibly_truncated, true); assert.ok(r.warning);
});
await test('cancellation preserved', async () => {
  const m = mock([login, groups, [{ ...event, cancelled: true }]]); const r = await connectionAction({ action: 'preview', group_id: groupId }, credentials, m.fetcher); assert.equal(r.events[0].cancelled, true);
});
for (const [name, reply, code] of [
  ['rate limit', new Response('private details', { status: 429 }), 'rate_limited'],
  ['failed login', new Response('private details', { status: 401 }), 'authentication_failed'],
  ['server failure', new Response('private details', { status: 500 }), 'upstream_unavailable'],
  ['network failure', new Error('private details'), 'upstream_unavailable'],
  ['invalid JSON', new Response('private details'), 'invalid_response'],
  ['oversize response', new Response('x'.repeat(2 * 1024 * 1024 + 1)), 'response_too_large']]) {
  await test(name + ' uses safe error', async () => { const m = mock([reply]);
    await assert.rejects(connectionAction({ action: 'connect' }, credentials, m.fetcher), e => e.code === code && !e.message.includes('private details')); });
}
const origin = 'https://caledon-u9-girls-2026.netlify.app';
function request(body = { action: 'status' }, headers = {}, method = 'POST') {
  return new Request('https://test.invalid', { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
}
await test('untrusted origin rejected before auth or secrets', async () => {
  const r = await handleRequest(request({}, { Origin: 'https://attacker.example' }), { authorize: () => assert.fail(), credentials: () => assert.fail() }); assert.equal(r.status, 403);
});
for (const [code, status] of [['unauthorized', 401], ['forbidden', 403], ['mfa_required', 403]]) {
  await test(code + ' rejected before secrets and upstream', async () => {
    const r = await handleRequest(request(), { authorize: () => { throw new ConnectionError(code, 'Access denied', status); }, credentials: () => assert.fail() }); assert.equal(r.status, status);
  });
}
await test('successful response is not cached', async () => {
  const r = await handleRequest(request(), { authorize: async () => {}, credentials: () => credentials });
  assert.equal(r.status, 200); assert.equal(r.headers.get('Cache-Control'), 'no-store'); assert.equal(r.headers.get('Access-Control-Allow-Origin'), origin);
});
await test('method/origin allowlist', async () => {
  const deps = { authorize: () => assert.fail(), credentials: () => assert.fail() };
  assert.equal((await handleRequest(request({}, {}, 'GET'), deps)).status, 405);
  assert.equal((await handleRequest(request({}, {}, 'OPTIONS'), deps)).status, 204);
  assert.equal(allowedOrigin('https://6abfb11fb6ec6365889f8153--caledon-u9-girls-2026.netlify.app'), true);
  assert.equal(allowedOrigin(origin + '.evil.example'), false);
});
const serverSource = stripTypeScriptTypes(fs.readFileSync(new URL('../supabase/functions/spond-api/index.ts', import.meta.url), 'utf8')).replace(/^import .*;\n/gm, '');
function server({ roles = ['manager'], roleError = false, authenticated = true, aal = 'aal2' } = {}) {
  let callback; let secretReads = 0;
  const token = 'header.' + Buffer.from(JSON.stringify({ aal })).toString('base64url') + '.signature';
  const env = { SUPABASE_URL: 'https://test.invalid', SUPABASE_ANON_KEY: 'public' };
  const createClient = () => ({ auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'verified-user' } : null }, error: null }) },
    from: table => { assert.equal(table, 'user_roles'); return { select: () => ({ eq: async (column, id) => {
      assert.equal(column, 'user_id'); assert.equal(id, 'verified-user');
      return { data: roles.map(role => ({ role })), error: roleError ? new Error('private database failure') : null };
    } }) }; } });
  vm.runInNewContext(serverSource, { createClient, ConnectionError, handleRequest, atob,
    Deno: { serve: fn => { callback = fn; }, env: { get: name => { if (name.startsWith('SPOND_')) secretReads++; return env[name]; } } } });
  return { callback, token, secretReads: () => secretReads };
}
for (const [name, scenario, status] of [
  ['expired login', { authenticated: false }, 401],
  ['parent', { roles: ['parent_player'] }, 403],
  ['no assigned role', { roles: [] }, 403],
  ['role lookup failure', { roleError: true }, 403],
  ['manager before MFA', { aal: 'aal1' }, 403],
  ['manager with MFA', {}, 200],
  ['admin with MFA', { roles: ['admin'] }, 200]]) {
  await test('real server authorization: ' + name, async () => {
    const s = server(scenario); const r = await s.callback(request({ action: 'status' }, { Authorization: 'Bearer ' + s.token }));
    assert.equal(r.status, status); assert.equal(s.secretReads(), status === 200 ? 2 : 0);
  });
}
await test('real server rejects missing bearer', async () => {
  const s = server(); const r = await s.callback(request()); assert.equal(r.status, 401); assert.equal(s.secretReads(), 0);
});
console.log(`${count} Spond API tests passed. No real credentials, database writes or Spond requests used.`);
