import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rootrouter from './routes/index.js';
import { rateLimit } from './middleware/ratelimit.js';
import { redisReady } from './services/redis.js';
import { ragConfigured } from './services/rag.js';

const app = express();

// Vercel (and any other reverse proxy) puts the real client address in
// X-Forwarded-For. Without this, every request looks like it came from the
// proxy and the rate limiter would throttle all users as one.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ── gateway ──────────────────────────────────────────────────────────────────
// Everything below is Redis-backed and shared across instances. Order matters:
// the broad limit runs first, then the tighter one for the endpoint that is
// worth brute-forcing.

app.use(rateLimit({ name: 'global', limit: 120, windowSeconds: 60 }));
app.use('/api/v1/signin', rateLimit({ name: 'auth', limit: 10, windowSeconds: 900 }));
app.use('/api/v1/signup', rateLimit({ name: 'auth', limit: 10, windowSeconds: 900 }));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        redis: redisReady() ? 'connected' : 'disabled',
        retrieval: ragConfigured() ? 'configured' : 'disabled',
    });
});

app.use("/api/v1", rootrouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
