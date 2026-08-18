// Applies the schema to whatever DATABASE_URL points at, then exits.
//
// Run this once against a new production database (and after any schema
// change) before the first deploy:
//
//   DATABASE_URL=... npm run migrate
//
// Serverless instances never run it themselves — see the note in db.js.
import { migrate, closePool } from '../db.js';

try {
    await migrate();
    console.log('Migration complete');
} catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
} finally {
    await closePool().catch(() => {});
}
