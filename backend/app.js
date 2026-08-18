import express from 'express';
import cors from 'cors';

import { config, allowedOrigins, isProd } from './config.js';
import rootrouter from './routes/index.js';
import { rateLimit } from './middleware/ratelimit.js';
import { redisReady } from './services/redis.js';
import { ragConfigured } from './services/rag.js';
import { pingDatabase } from './db.js';

// The Express app, with no server attached. index.js listens on a port for a
// normal deploy; api/index.js exports it as a handler for Vercel. Keeping the
// app free of a listen() call is what lets the same code do both.

const app = express();

// Vercel (and any other reverse proxy) puts the real client address in
// X-Forwarded-For. Without this, every request looks like it came from the
// proxy and the rate limiter would throttle all users as one.
app.set('trust proxy', 1);

// Don't advertise the framework to anyone scanning for known Express CVEs.
app.disable('x-powered-by');

// ── security headers ─────────────────────────────────────────────────────────
// This is a JSON API, so the set that matters is small: no MIME sniffing, no
// framing, no referrer leakage, and HSTS once we know we're on HTTPS. A CSP
// belongs on the frontend's host, not here — this origin serves no HTML.
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    if (isProd) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// ── CORS ─────────────────────────────────────────────────────────────────────
// In development anything goes. In production only the origins listed in
// ALLOWED_ORIGINS may call the API — a wildcard would let any page on the
// internet spend a token it found in a victim's browser.
app.use(
    cors({
        origin(origin, callback) {
            if (!isProd) return callback(null, true);
            // No Origin header at all: curl, health checks, server-to-server.
            // Those aren't browser requests, so CORS has nothing to protect.
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`Origin ${origin} is not allowed`));
        },
        credentials: true,
    }),
);

app.use(express.json({ limit: '1mb' }));

// ── gateway ──────────────────────────────────────────────────────────────────
// Redis-backed, so the limits hold across every instance the platform runs.
// Order matters: the broad limit first, then the tighter one on the endpoints
// worth brute-forcing.
app.use(rateLimit({ name: 'global', limit: 120, windowSeconds: 60 }));
app.use('/api/v1/signin', rateLimit({ name: 'auth', limit: 10, windowSeconds: 900 }));
app.use('/api/v1/signup', rateLimit({ name: 'auth', limit: 10, windowSeconds: 900 }));

// ── health ───────────────────────────────────────────────────────────────────
// Actually touches Postgres. A health check that only proves the process is
// running will happily report "ok" while every request 500s.
app.get('/health', async (req, res) => {
    const health = {
        status: 'ok',
        version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
        database: 'ok',
        redis: redisReady() ? 'connected' : 'disabled',
        retrieval: ragConfigured() ? 'configured' : 'disabled',
    };

    try {
        await pingDatabase();
    } catch (err) {
        health.status = 'degraded';
        health.database = 'unreachable';
        console.error('Health check: database unreachable:', err.message);
        return res.status(503).json(health);
    }

    res.json(health);
});

app.use('/api/v1', rootrouter);

// ── fallbacks ────────────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Four arguments — that is how Express recognises an error handler. Without
// one, a thrown error returns Express's HTML page with a stack trace in it.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err?.message?.includes('is not allowed')) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Request body is too large' });
    }
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Request body is not valid JSON' });
    }

    // Log the whole thing for us, tell the client nothing about our internals.
    console.error(`Unhandled error on ${req.method} ${req.path}:`, err);
    res.status(500).json({ error: 'Internal server error' });
});

export { app, config };
export default app;
