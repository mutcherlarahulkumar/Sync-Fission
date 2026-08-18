import test from 'node:test';
import assert from 'node:assert/strict';
import { chunk } from '../services/rag.js';
import { byUserOrIp } from '../middleware/ratelimit.js';

test('short text stays as a single chunk', () => {
    assert.deepEqual(chunk('a short note'), ['a short note']);
});

test('empty or whitespace-only text produces nothing to embed', () => {
    assert.deepEqual(chunk('   \n  '), []);
    assert.deepEqual(chunk(null), []);
});

test('long text is split with overlap, and every character survives', () => {
    const text = 'x'.repeat(2000);
    const chunks = chunk(text, 800, 100);

    assert.ok(chunks.length > 1, 'expected more than one chunk');
    for (const c of chunks) {
        assert.ok(c.length <= 800, `chunk of ${c.length} exceeds the 800 limit`);
    }
    // Overlapping windows must still cover the whole document.
    assert.equal(chunks.at(-1).length + 700 * (chunks.length - 1) >= 2000, true);
});

test('consecutive chunks overlap, so a definition on a boundary is not lost', () => {
    const text = Array.from({ length: 200 }, (_, i) => `word${i}`).join(' ');
    const [first, second] = chunk(text, 400, 100);
    const tail = first.slice(-100);
    assert.ok(second.startsWith(tail), 'second chunk should begin inside the first');
});

test('rate limit key separates users from anonymous callers', () => {
    assert.equal(byUserOrIp({ id: 7, role: 'student' }), 'ustudent:7');
    assert.equal(byUserOrIp({ ip: '10.0.0.1' }), 'ip:10.0.0.1');
    // A tutor and a student can share an id — the tables are independent.
    assert.notEqual(byUserOrIp({ id: 7, role: 'tutor' }), byUserOrIp({ id: 7, role: 'student' }));
});
