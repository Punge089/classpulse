// Independent local UAT observations; no alteration to developer tests or app.
import assert from 'node:assert/strict';
import { createHash, randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { once } from 'node:events';

const source = resolve('source');
const requireSource = createRequire(resolve(source, 'package.json'));
const { PrismaClient } = requireSource('@prisma/client');
const { createApp } = await import(pathToFileURL(resolve(source, 'dist/auth.js')));
const { startBrowserServer, stopBrowserServer } = await import(pathToFileURL(resolve(source, 'tests/browser-server.mjs')));
const { testDatabaseUrl, developmentDatabaseUrl } = await import(pathToFileURL(resolve(source, 'scripts/test-db.mjs')));
const url = testDatabaseUrl(process.env.TEST_DATABASE_URL, developmentDatabaseUrl());
const db = new PrismaClient({ datasources: { db: { url } } });
const result = { source: '41a8fefa7a5d93b6531dff88daae39574d72dcb7', servingRevision: 'N/A', operator: 'Codex under Student A/Punge089', model: 'GPT-6', runKind: 'Independent isolated local API/DB and actual application process restart', started: new Date().toISOString(), observations: [], fixtureRowsPreservedInStoppedIsolatedCluster: true };
const rawSecrets = [];
let appServer, processServer, origin, clock = new Date();
let step = 'preflight';
function observe(name, actual) { result.observations.push({ name, at: new Date().toISOString(), result: 'PASS', actual }); }
function cookie(response) { const c = response.headers.get('set-cookie')?.split(';')[0]; assert.ok(c?.startsWith('session=')); rawSecrets.push(c); return c; }
async function account(role, name) {
  const password = randomUUID(); rawSecrets.push(password);
  const salt = randomBytes(16); const passwordHash = `scrypt:${salt.toString('hex')}:${scryptSync(password, salt, 64).toString('hex')}`;
  const user = await db.user.create({ data: { login: `uat6.a.${name}.${randomUUID()}@classpulse.test`, role, passwordHash } });
  return { id: user.id, login: user.login, password, role };
}
async function api(base, path, method = 'GET', c, body) {
  const destination = new URL(path, base); assert.equal(destination.hostname, '127.0.0.1');
  const response = await fetch(destination, { method, redirect: 'error', signal: AbortSignal.timeout(15000), headers: { origin: base, ...(c ? { cookie: c } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = response.status === 204 ? null : await response.json();
  return { status: response.status, data, response };
}
async function login(base, user) { const r = await api(base, '/api/session', 'POST', undefined, { login: user.login, password: user.password }); assert.equal(r.status, 200); return cookie(r.response); }
async function counts() { return { requests: await db.purchaseRequest.count(), events: await db.requestEvent.count() }; }
async function read(base, id, c) { const r = await api(base, '/api/requests/' + id, 'GET', c); assert.equal(r.status, 200); return r.data.request; }
try {
  const target = await db.$queryRaw`SELECT current_database() AS database, host(inet_server_addr()) AS address, inet_server_port() AS port`;
  result.target = target[0];
  assert.equal(target[0].address, '127.0.0.1'); assert.equal(target[0].port, 61327); assert.ok(target[0].database.endsWith('_test'));
  result.target = target[0];
  step = 'controlled expiry and previous-session rejection';
  const authUser = await account('REQUESTER', 'auth');
  const authOptions = { origin: 'http://127.0.0.1', now: () => clock };
  appServer = createApp(db, authOptions).listen(0, '127.0.0.1'); await once(appServer, 'listening');
  const authOrigin = `http://127.0.0.1:${appServer.address().port}`; authOptions.origin = authOrigin;
  const authCookie = await login(authOrigin, authUser);
  assert.equal((await api(authOrigin, '/api/session', 'GET', authCookie)).status, 200);
  const out = await api(authOrigin, '/api/session', 'DELETE', authCookie); assert.equal(out.status, 204);
  assert.match(out.response.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970|Max-Age=0/);
  const old = await api(authOrigin, '/api/session', 'GET', authCookie); assert.equal(old.status, 401); assert.equal(old.data.error.code, 'AUTH_REQUIRED');
  assert.equal(await db.session.count({ where: { userId: authUser.id } }), 0);
  observe('ADD-01 previous-session rejection / AC-03', { before: 200, logout: 204, sameCookieCheckedAfterward: true, after: 401, code: 'AUTH_REQUIRED', clearingDirective: true, sessionsAfter: 0 });
  const token = randomBytes(32).toString('hex'); rawSecrets.push(token);
  const expiry = new Date(clock.getTime() + 1000);
  await db.session.create({ data: { tokenDigest: createHash('sha256').update(token).digest('hex'), userId: authUser.id, expiresAt: expiry } });
  assert.equal((await api(authOrigin, '/api/session', 'GET', 'session=' + token)).status, 200);
  clock = expiry;
  const expired = await api(authOrigin, '/api/session', 'GET', 'session=' + token); assert.equal(expired.status, 401); assert.equal(expired.data.error.code, 'AUTH_REQUIRED');
  observe('ADD-01 controlled exact expiry / AC-03', { before: 200, fixtureClockAtExpiry: clock.toISOString(), expiresAt: expiry.toISOString(), after: 401, code: 'AUTH_REQUIRED', fullEightHoursElapsed: false });
  await new Promise(r => appServer.close(r)); appServer = undefined;
  step = 'actual process setup';
  const requester = await account('REQUESTER', 'requester');
  const reviewer = await account('REVIEWER', 'reviewer');
  const unavailable = await account('REQUESTER', 'mapping');
  const wrongRole = await account('REQUESTER', 'wrongrole');
  await db.reviewerAssignment.create({ data: { requesterId: requester.id, reviewerId: reviewer.id } });
  process.chdir(source);
  ({ server: processServer, origin } = await startBrowserServer(url));
  const requesterCookie = await login(origin, requester), reviewerCookie = await login(origin, reviewer), missingCookie = await login(origin, unavailable);
  const valid = { title: 'UAT6 A isolated durable request', purpose: 'Independent isolated Sprint 1 verification', amount: '125.50' };
  step = 'mapping absent';
  const baseline = await counts();
  const absent = await api(origin, '/api/requests', 'POST', missingCookie, valid); assert.equal(absent.status, 409); assert.equal(absent.data.error.code, 'REVIEWER_UNAVAILABLE'); assert.deepEqual(await counts(), baseline);
  observe('Absent reviewer mapping / AC-06', { http: 409, code: 'REVIEWER_UNAVAILABLE', before: baseline, after: await counts(), noRequestOrEventSaved: true });
  step = 'mapping wrong role';
  await db.reviewerAssignment.create({ data: { requesterId: unavailable.id, reviewerId: wrongRole.id } });
  const wrong = await api(origin, '/api/requests', 'POST', missingCookie, valid); assert.equal(wrong.status, 409); assert.equal(wrong.data.error.code, 'REVIEWER_UNAVAILABLE'); assert.deepEqual(await counts(), baseline);
  observe('Wrong-role reviewer mapping / AC-06', { mappedRole: 'REQUESTER', http: 409, code: 'REVIEWER_UNAVAILABLE', before: baseline, after: await counts(), noRequestOrEventSaved: true });
  step = 'self assignment';
  let constraint;
  try { await db.$transaction(async tx => { await tx.$executeRaw`UPDATE reviewer_assignments SET reviewer_id = requester_id WHERE requester_id = ${requester.id}::uuid`; }); }
  catch (e) { constraint = e.meta?.code; }
  assert.equal(constraint, '23514');
  assert.equal((await db.reviewerAssignment.findUnique({ where: { requesterId: requester.id } })).reviewerId, reviewer.id);
  observe('Self-assignment refusal / AC-06', { layer: 'database', sqlState: constraint, transactionRolledBack: true, originalMappingPreserved: true, httpExpected: 'N/A' });
  step = 'forced event insertion rollback';
  const rollback = await db.purchaseRequest.create({ data: { requesterId: requester.id, reviewerId: reviewer.id, title: 'UAT6 A rollback fixture', purpose: valid.purpose, amountSatang: 12550, events: { create: { actorId: requester.id, type: 'SUBMITTED' } } } });
  await db.requestEvent.create({ data: { requestId: rollback.id, actorId: reviewer.id, type: 'APPROVED' } });
  const beforeRollback = await read(origin, rollback.id, requesterCookie);
  const failed = await api(origin, '/api/requests/' + rollback.id + '/decision', 'POST', reviewerCookie, { decision: 'REJECT', reason: 'Synthetic forced terminal-event conflict' });
  assert.equal(failed.status, 500); assert.equal(failed.data.error.code, 'INTERNAL_ERROR');
  const afterRollback = await read(origin, rollback.id, requesterCookie); assert.deepEqual(afterRollback, beforeRollback); assert.equal(afterRollback.status, 'SUBMITTED');
  assert.deepEqual(await read(origin, rollback.id, reviewerCookie), beforeRollback);
  observe('Forced event-insertion rollback / AC-13', { id: rollback.id, http: 500, code: 'INTERNAL_ERROR', injectedFixture: 'pre-existing terminal event as in TEST-13', before: beforeRollback, after: afterRollback, completeHistoryUnchanged: true, reviewerReadbackMatched: true });
  step = 'durability request';
  const created = await api(origin, '/api/requests', 'POST', requesterCookie, valid); assert.equal(created.status, 201);
  const id = created.data.request.id;
  assert.equal((await api(origin, '/api/requests/' + id + '/decision', 'POST', reviewerCookie, { decision: 'APPROVE' })).status, 200);
  const beforeRequester = await read(origin, id, requesterCookie), beforeReviewer = await read(origin, id, reviewerCookie); assert.deepEqual(beforeRequester, beforeReviewer);
  assert.equal(beforeRequester.amount, '125.50'); assert.equal(beforeRequester.status, 'APPROVED'); assert.equal(beforeRequester.history.length, 2);
  const oldPid = processServer.pid, stopRequested = new Date().toISOString();
  await stopBrowserServer(processServer); const oldExit = { exitCode: processServer.exitCode, signalCode: processServer.signalCode }; processServer = undefined;
  const stopped = new Date().toISOString();
  ({ server: processServer } = await startBrowserServer(url, origin));
  const started = new Date().toISOString(); assert.notEqual(processServer.pid, oldPid);
  const afterRequester = await read(origin, id, requesterCookie), afterReviewer = await read(origin, id, reviewerCookie);
  assert.deepEqual(afterRequester, beforeRequester); assert.deepEqual(afterReviewer, beforeReviewer);
  const sameTarget = await db.$queryRaw`SELECT current_database() AS database, host(inet_server_addr()) AS address, inet_server_port() AS port`; assert.deepEqual(sameTarget, target);
  observe('06c-R actual local app restart / AC-14 NFR-01', { id, oldPid, newPid: processServer.pid, origin, stopRequested, stopped, newProcessReady: started, oldExit, sameDatabase: true, reseedBetweenObservations: false, beforeRequester, afterRequester, beforeReviewer, afterReviewer, idAmountStatusCompleteHistoryEqual: true });
  for (const c of [requesterCookie, reviewerCookie, missingCookie]) assert.equal((await api(origin, '/api/session', 'DELETE', c)).status, 204);
  result.cleanup = { ownNormalSessionsLoggedOut: true, retainedRequestIds: [rollback.id, id], isolatedFixtureRetentionOnly: true };
  result.outcome = 'PASS'; result.caseGroups = 6; result.observationsPassed = result.observations.length;
} catch (error) {
  result.outcome = 'FAIL'; result.failure = { step, type: error.name, assertionCode: error.code || null, detail: 'Inspect sanitized retained local output; no raw secrets emitted' }; process.exitCode = 1;
} finally {
  if (appServer) await new Promise(r => appServer.close(r));
  if (processServer) await stopBrowserServer(processServer);
  await db.$disconnect(); result.finished = new Date().toISOString();
  const serialized = JSON.stringify(result, null, 2);
  assert.ok(!rawSecrets.some(secret => serialized.includes(secret)), 'Private-value projection rejected');
  writeFileSync(resolve(source, '../supplemental-results.json'), serialized + '\n');
  console.log(JSON.stringify({ outcome: result.outcome, observationsPassed: result.observations.length, source: result.source, revision: 'N/A', failure: result.failure || null }));
}
