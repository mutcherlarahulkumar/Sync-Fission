// Vercel serverless entrypoint.
//
// Vercel's Node runtime calls the default export as (req, res) — and an Express
// app is exactly that function, so it can be handed over directly. vercel.json
// rewrites every path here, and Express does its own routing from the original
// URL.
//
// Note what is deliberately missing: no migrate() call. On serverless, this
// module is re-entered on every cold start, and running DDL there would mean
// racing migrations from several instances at once. db.js runs the schema
// lazily and memoises it per instance; the authoritative migration happens when
// you run the long-lived server (npm start) or apply it yourself.
import app from '../app.js';

export default app;
