import dotenv from 'dotenv';
import zod from 'zod';

dotenv.config();

// Config is validated once, at boot, and the process refuses to start if
// something required is missing or obviously wrong.
//
// The alternative — discovering a missing JWT_SECRET when the first user tries
// to log in — turns a deploy-time typo into a production incident. Failing
// loudly on startup means a bad deploy never becomes a serving deploy.

const isProduction = process.env.NODE_ENV === 'production';

const schema = zod.object({
    NODE_ENV: zod.enum(['development', 'test', 'production']).default('development'),
    PORT: zod.coerce.number().int().positive().default(3000),

    DATABASE_URL: zod.string().min(1, 'DATABASE_URL is required'),

    // 32 characters is the floor for an HS256 signing key. Anything shorter is
    // brute-forceable offline once you have a single token.
    JWT_SECRET: zod
        .string()
        .min(isProduction ? 32 : 8, 'JWT_SECRET must be at least 32 characters in production'),

    // Optional. Each one that is missing turns off a feature rather than
    // breaking the app — see services/redis.js and services/rag.js.
    GEMINI_API_KEY: zod.string().optional(),
    GEMINI_MODEL: zod.string().default('gemini-1.5-flash'),
    REDIS_URL: zod.string().optional(),
    CHROMA_URL: zod.string().optional(),

    // Comma-separated list of browser origins allowed to call this API.
    // Required in production: an API that answers "*" lets any page on the
    // internet spend a stolen token from the victim's own browser.
    ALLOWED_ORIGINS: zod.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
}

export const config = parsed.data;

export const allowedOrigins = (config.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

if (config.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    console.error('ALLOWED_ORIGINS must list your frontend origin(s) in production.');
    process.exit(1);
}

export const isProd = config.NODE_ENV === 'production';
