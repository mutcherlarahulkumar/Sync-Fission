import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

// Config is read at import time, so the environment has to be in place before
// app.js is pulled in. DATABASE_URL points nowhere on purpose: everything
// exercised here happens before a query, and /health is supposed to report a
// dead database rather than pretend.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://nobody:nothing@127.0.0.1:1/none';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256';

const { default: app } = await import('../app.js');

let server;
let base;

before(async () => {
    await new Promise((resolve) => {
        server = app.listen(0, resolve); // port 0 = let the OS pick a free one
    });
    base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server?.close());

test('unknown routes return JSON, not an HTML stack trace', async () => {
    const res = await fetch(`${base}/definitely-not-a-route`);
    assert.equal(res.status, 404);
    assert.match(res.headers.get('content-type'), /application\/json/);

    const body = await res.json();
    assert.match(body.error, /Cannot GET/);
});

test('security headers are set on every response', async () => {
    const res = await fetch(`${base}/definitely-not-a-route`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
});

test('the framework is not advertised', async () => {
    const res = await fetch(`${base}/definitely-not-a-route`);
    assert.equal(res.headers.get('x-powered-by'), null);
});

test('malformed JSON is a 400, not a 500', async () => {
    const res = await fetch(`${base}/api/v1/signin/student`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{not json',
    });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /valid JSON/);
});

test('the assistant refuses anonymous callers', async () => {
    const res = await fetch(`${base}/api/v1/chat/send`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userInput: 'who teaches my class?' }),
    });
    // It must never reach the model or the database without a token.
    assert.ok(res.status === 401 || res.status === 403, `got ${res.status}`);
});

test('health reports a dead database instead of a cheerful ok', async () => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 503);

    const body = await res.json();
    assert.equal(body.status, 'degraded');
    assert.equal(body.database, 'unreachable');
});
