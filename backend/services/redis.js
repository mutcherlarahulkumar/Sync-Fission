import Redis from 'ioredis';

// One Redis connection for the whole process. Two things use it:
//   1. the rate limiter in front of every route
//   2. multi-turn chat history for the AI assistant
//
// Redis is optional. With REDIS_URL unset (or the server down) the app still
// runs — requests just stop being rate limited and the assistant forgets the
// conversation between messages. That is a deliberate trade: an unreachable
// cache should not take the tutoring platform offline with it.

let client = null;

if (process.env.REDIS_URL) {
    client = new Redis(process.env.REDIS_URL, {
        // Don't queue commands while disconnected — fail fast so callers can
        // fall back instead of hanging the request.
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => Math.min(times * 500, 5000),
        lazyConnect: false,
    });

    client.on('connect', () => console.log('Connected to Redis'));
    // Without a handler, a connection error is an unhandled 'error' event and
    // takes the whole process down.
    client.on('error', (err) => console.warn('Redis unavailable:', err.message));
} else {
    console.warn('REDIS_URL not set — rate limiting and chat memory are disabled');
}

export const redis = client;

export function redisReady() {
    return Boolean(client && client.status === 'ready');
}
