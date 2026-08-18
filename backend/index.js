import app from './app.js';
import { config } from './config.js';
import { migrate, closePool } from './db.js';

// Long-running server entrypoint (local dev, Docker, Render, Railway, Fly).
// For Vercel's serverless runtime the handler is api/index.js instead.

// Run the schema before accepting traffic, so the first user request doesn't
// pay for it — and so a broken database is a failed startup rather than a
// stream of 500s.
try {
    await migrate();
} catch (err) {
    console.error('Could not prepare the database:', err.message);
    process.exit(1);
}

const server = app.listen(config.PORT, () => {
    console.log(`Sync Fission API listening on port ${config.PORT} (${config.NODE_ENV})`);
});

// Finish in-flight requests before dying, instead of dropping them on the
// floor mid-deploy.
for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
        console.log(`${signal} received, shutting down`);
        server.close(async () => {
            await closePool().catch(() => {});
            process.exit(0);
        });
        // Don't hang forever on a stuck connection.
        setTimeout(() => process.exit(1), 10_000).unref();
    });
}
