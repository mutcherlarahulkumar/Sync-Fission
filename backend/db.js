import pg from "pg";
import { config, isProd } from "./config.js";

// Postgres access for the whole app.
//
// Three things changed here when this went to production, all of them bugs
// that only show up under real traffic:
//
//   1. This was a single pg.Client. One connection serialises every query in
//      the process, and if it ever drops there is no reconnect — the app stays
//      up and fails every request until someone restarts it. It's a Pool now.
//
//   2. getClient() used to run the whole CREATE TABLE block on *every call*,
//      so each API request paid for twelve DDL round-trips before doing any
//      work. Migration is out of the request path entirely now — see migrate().
//
//   3. The connection was opened with a top-level await, so a database that
//      was briefly unreachable at boot took the entire process down at import
//      time — and made the module impossible to import in tests. Connecting is
//      lazy now; the pool opens connections when the first query needs one.

// Managed Postgres (Neon, Supabase, Render, RDS) requires TLS. Verify the
// certificate by default; set DATABASE_SSL_NO_VERIFY=true only if your provider
// serves a self-signed cert, and understand that it disables MITM protection.
function sslConfig() {
    const url = config.DATABASE_URL;
    const wantsSSL = isProd || /sslmode=(require|verify-full|verify-ca)/.test(url);
    if (!wantsSSL) return undefined;
    return process.env.DATABASE_SSL_NO_VERIFY === 'true' ? { rejectUnauthorized: false } : true;
}

const pool = new pg.Pool({
    connectionString: config.DATABASE_URL,
    ssl: sslConfig(),
    // Serverless platforms run many short-lived instances against one database,
    // so each instance keeps a small pool and hands connections back quickly.
    max: Number(process.env.PG_POOL_MAX || 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
});

// An error on an *idle* client is emitted on the pool, and an unhandled 'error'
// event takes the process down. This is the difference between a dropped
// connection being a blip and being an outage.
pool.on('error', (err) => {
    console.error('Postgres pool error (connection will be replaced):', err.message);
});

let migration = null;

/**
 * Applies the schema. Concurrent callers share one promise so it can never run
 * twice in a process.
 *
 * This is deliberately NOT called from getClient(). Two modules take a handle at
 * import time, so migrating inside getClient() meant DDL ran on module load —
 * and on serverless, where every cold start re-imports, that is several
 * instances racing to run CREATE TABLE at once. Schema changes are a deliberate
 * step now: `npm start` runs it before listening, and `npm run migrate` applies
 * it to a deployed database.
 */
function migrate() {
    if (!migration) {
        migration = createTables().catch((err) => {
            // Don't cache the failure forever; let the next attempt retry.
            migration = null;
            throw err;
        });
    }
    return migration;
}

/**
 * The app's handle to Postgres. Returns the pool, which exposes the same
 * .query() interface the old single client did — so no call site had to change.
 *
 * Cheap and non-blocking: a Pool opens no sockets until the first query, which
 * is what makes a module-level `await getClient()` harmless.
 */
async function getClient() {
    return pool;
}

/** Used by /health to prove the database is actually reachable. */
async function pingDatabase() {
    await pool.query('SELECT 1');
}

async function closePool() {
    await pool.end();
}

async function createTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tutor(
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS student(
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS class(
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            book_ref TEXT,
            prereqs TEXT,
            tutor_id INTEGER REFERENCES tutor(id) ON DELETE CASCADE
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS class_student(
            class_id INTEGER REFERENCES class(id) ON DELETE CASCADE,
            student_id INTEGER REFERENCES student(id) ON DELETE CASCADE,
            PRIMARY KEY (class_id, student_id)
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS assignment(
            id SERIAL PRIMARY KEY,
            link TEXT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            due_date TIMESTAMP NOT NULL,
            class_id INTEGER REFERENCES class(id) ON DELETE CASCADE
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS resource(
            id SERIAL PRIMARY KEY,
            type TEXT,
            title TEXT NOT NULL,
            link TEXT NOT NULL,
            class_id INTEGER REFERENCES class(id) ON DELETE CASCADE
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS announcement(
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            class_id INTEGER REFERENCES class(id) ON DELETE CASCADE
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS doubt(
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            student_id INTEGER REFERENCES student(id) ON DELETE CASCADE,
            class_id INTEGER REFERENCES class(id) ON DELETE CASCADE
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS doubt_reply(
            id SERIAL PRIMARY KEY,
            reply TEXT NOT NULL,
            doubt_id INTEGER REFERENCES doubt(id) ON DELETE CASCADE
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS doubt_student_discussion(
            id SERIAL PRIMARY KEY,
            reply TEXT,
            doubt_id INTEGER REFERENCES doubt(id) ON DELETE CASCADE,
            student_id INTEGER REFERENCES student(id) ON DELETE CASCADE
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS session(
            id SERIAL PRIMARY KEY,
            class_id INTEGER REFERENCES class(id) ON DELETE CASCADE,
            tutor_id INTEGER REFERENCES tutor(id) ON DELETE CASCADE,
            student_id INTEGER REFERENCES student(id) ON DELETE CASCADE,
            topic TEXT NOT NULL,
            scheduled_at TIMESTAMP NOT NULL,
            status TEXT NOT NULL DEFAULT 'requested',
            created_at TIMESTAMP NOT NULL DEFAULT now()
        );
    `);
    // Optional notes pasted alongside a link. This is what actually gets
    // embedded into ChromaDB — a bare URL retrieves nothing useful.
    await pool.query(`ALTER TABLE resource ADD COLUMN IF NOT EXISTS content TEXT;`);

    // Indexes for the lookups that run on every page load. Without these,
    // every class page is a sequential scan of the whole table.
    await pool.query(`CREATE INDEX IF NOT EXISTS class_tutor_idx        ON class(tutor_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS class_student_sid_idx  ON class_student(student_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS assignment_class_idx   ON assignment(class_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS resource_class_idx     ON resource(class_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS announcement_class_idx ON announcement(class_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS doubt_class_idx        ON doubt(class_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS doubt_reply_doubt_idx  ON doubt_reply(doubt_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS session_tutor_idx      ON session(tutor_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS session_student_idx    ON session(student_id);`);

    console.log('Database schema is up to date');
}

export { getClient, migrate, pingDatabase, closePool };
