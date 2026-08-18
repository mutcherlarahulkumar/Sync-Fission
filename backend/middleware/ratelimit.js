import { redis, redisReady } from '../services/redis.js';

// Fixed-window rate limiter backed by Redis.
//
// The window key is `rl:<name>:<identity>:<window index>`, so a new key appears
// every window and expires on its own — there is nothing to sweep up. Counting
// lives in Redis rather than in process memory because Vercel runs several
// instances of this API, and an in-memory counter would give each instance its
// own private allowance.
//
// ponytail: fixed window, not a sliding one. A caller can burst 2x the limit
// across a window boundary. Swap in a sorted-set sliding window if that ever
// shows up in the logs.

export function rateLimit({ name, limit, windowSeconds, identify }) {
    const keyOf = identify || ((req) => req.ip);

    return async function rateLimitMiddleware(req, res, next) {
        if (!redisReady()) return next(); // fail open: see services/redis.js

        const windowIndex = Math.floor(Date.now() / 1000 / windowSeconds);
        const key = `rl:${name}:${keyOf(req)}:${windowIndex}`;

        try {
            // INCR then EXPIRE in one round trip. EXPIRE on an existing key is
            // harmless — it just re-stamps the same TTL.
            const [count] = await redis
                .multi()
                .incr(key)
                .expire(key, windowSeconds)
                .exec()
                .then((results) => results.map(([, value]) => value));

            const remaining = Math.max(0, limit - count);
            res.setHeader('X-RateLimit-Limit', limit);
            res.setHeader('X-RateLimit-Remaining', remaining);
            res.setHeader('X-RateLimit-Reset', (windowIndex + 1) * windowSeconds);

            if (count > limit) {
                const retryAfter = (windowIndex + 1) * windowSeconds - Math.floor(Date.now() / 1000);
                res.setHeader('Retry-After', Math.max(1, retryAfter));
                return res.status(429).json({
                    error: 'Too many requests',
                    retry_after_seconds: Math.max(1, retryAfter),
                });
            }

            return next();
        } catch (err) {
            console.warn(`Rate limiter ${name} failed, allowing request:`, err.message);
            return next();
        }
    };
}

// Identify an authenticated caller by user, everyone else by IP, so one
// student on a shared campus NAT doesn't spend the whole building's budget.
export const byUserOrIp = (req) => (req.id ? `u${req.role || '?'}:${req.id}` : `ip:${req.ip}`);
