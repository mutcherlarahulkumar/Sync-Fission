# Sync Fission

A platform where tutors and students actually work together: classes,
assignments, announcements, shared resources, and a doubt-discussion thread per
question — plus **Devika**, an AI assistant that has been given real access to
the platform instead of just a nice personality.

That last part is the interesting bit, so it's the part this README spends time on.

## What makes the assistant different

A normal chatbot bolted onto a tutoring site can only tell you what a language
model already remembers. Devika can:

- **read the tutor's own material** — study notes are chunked, embedded and stored
  in ChromaDB, and every question retrieves the closest passages before the model
  writes a word. Ask "what did we cover about normalisation?" and the answer comes
  from your tutor's notes, cited by resource, not from the internet's average
  opinion of normalisation.
- **look up who teaches what** — names, contact details, the other classes a tutor runs.
- **book a session** — writing an actual row to Postgres that the tutor sees.

Three tools are declared to the model, and *it* decides which to call each turn:

| Tool | What it does |
| --- | --- |
| `search_materials` | Semantic search over uploaded study material |
| `get_tutor_profile` | The tutor for a class, their email, what else they teach |
| `schedule_session` | Books a 1-on-1 and persists it as `requested` |

The rule that keeps this safe: **every tool resolves the caller's own classes
first and filters by them.** The model is free to ask for class 7's notes; if the
student isn't enrolled in class 7, the tool returns nothing. Authorisation lives
in the tool implementation, never in the prompt — prompts can be talked out of
things, `WHERE student_id = $1` cannot.

Conversation context is kept in Redis per user (last 12 turns, 24 h TTL), so
follow-ups like "and when is he free?" resolve properly.

## Architecture

```
React (Vite, Tailwind)  ──►  Express API
                                 │
                    ┌────────────┼──────────────┐
                    │            │              │
              Redis gateway   Postgres      Gemini
              rate limits     classes,      chat + embeddings
              chat memory     sessions,          │
                              resources          ▼
                                             ChromaDB
                                        (tutor material vectors)
```

### The gateway layer

Rate limiting lives in Redis rather than in process memory, because Vercel runs
several instances of this API and an in-memory counter would give each instance
its own private allowance. Limits are:

| Scope | Limit |
| --- | --- |
| Everything | 120 requests / minute per IP |
| `/signin`, `/signup` | 10 / 15 minutes per IP |
| `/chat/send` | 20 / minute **per user** (it runs after auth, so it keys on the account) |

Responses carry `X-RateLimit-*` and, on a 429, `Retry-After`.

### Degrading instead of failing

Redis and ChromaDB are both optional. Without Redis, requests stop being rate
limited and the assistant forgets the conversation between messages. Without
Chroma, the assistant answers from general knowledge and says so. Neither takes
the tutoring platform offline — losing a cache should never mean losing the
class.

## Running it locally

```bash
docker compose up -d          # Postgres, Redis, ChromaDB

cd backend
cp .env.example .env          # fill in DATABASE_URL and JWT_SECRET
npm ci
npm run migrate               # apply the schema (once, and after schema changes)
npm run dev

cd ../frontend
cp .env.example .env
npm ci && npm run dev
```

Only `DATABASE_URL` and `JWT_SECRET` are truly required, and the process refuses
to start without them rather than failing on the first request. `GEMINI_API_KEY`
turns the assistant on; `REDIS_URL` and `CHROMA_URL` turn on rate limiting and
retrieval respectively.

`GET /health` reports which of the optional pieces came up — and actually queries
Postgres, so it returns 503 when the database is unreachable instead of a
cheerful `ok`.

## Deploying

The frontend and the backend are two separate Vercel projects pointed at the
same repository, with **Root Directory** set to `frontend` and `backend`. Each
already has its own `vercel.json`.

**Backend project** — root directory `backend`. `api/index.js` exports the
Express app as the serverless handler and `vercel.json` rewrites every path to
it, so Express keeps doing its own routing.

Environment variables to set in the Vercel dashboard:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Managed Postgres; usually needs `?sslmode=require` |
| `JWT_SECRET` | 32+ characters, or the app refuses to boot |
| `ALLOWED_ORIGINS` | The frontend's URL. Required in production — no wildcard |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | Optional; without it the assistant returns 503 |
| `REDIS_URL` | Optional; without it nothing is rate limited |
| `CHROMA_URL` | Optional; without it there is no retrieval |

**Frontend project** — root directory `frontend`, one variable:
`VITE_API_URL=https://<your-backend>.vercel.app/api/v1`. Its `vercel.json`
rewrites all paths to `index.html`, without which every route except `/` 404s on
a refresh.

**Run the migration once** against the production database before the first
deploy — serverless instances deliberately never run DDL themselves:

```bash
DATABASE_URL='postgres://...' npm run migrate
```

Redis and ChromaDB have to be reachable from Vercel's network, so a local
`docker compose` instance won't do: use a hosted Redis (Upstash and friends) and
either Chroma Cloud or Chroma on a small VM. Leaving both unset is a valid
production configuration — you lose rate limiting and retrieval, not the app.

## A note on API keys

The chat model is configurable via `GEMINI_MODEL`. **The embedding model is not.**
Retrieval is Gemini-only on purpose: xAI/Grok has no embeddings endpoint, and
re-embedding an existing collection with a different model would silently
invalidate every vector already stored. If you ever switch embedding models,
delete the Chroma collection and re-index rather than mixing the two.

## Getting material into the index

A tutor adds a resource under **Resources** in their class. The form has a
**Notes** field — that text is what gets chunked (800 characters, 100 overlapping)
and embedded. A bare link embeds to nothing useful, so a resource with no notes
is still listed for students but won't be searchable by the assistant.

Indexing happens in the background after the insert: a ChromaDB hiccup logs a
warning and never blocks a tutor from uploading.

## CI/CD

Two pipelines, deliberately:

- **Jenkins** (`Jenkinsfile`) is the build gate — installs both packages in
  parallel, runs the backend tests, builds the frontend, archives the bundle.
- **GitHub Actions** (`.github/workflows/deploy.yml`) is the deployer — re-runs
  the tests, then ships to Vercel on every push to `main`. It re-runs rather than
  trusting Jenkins, because a pipeline that takes another pipeline's word for it
  isn't a gate.

Vercel deployment needs three repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
`VERCEL_PROJECT_ID` (the last two appear in `.vercel/project.json` after one local
`vercel link`).

## Tests

```bash
cd backend  && npm test
cd frontend && npm run lint
```

The backend tests need no database, no Redis and no API key — they boot the real
app on an ephemeral port and check the things that are expensive to get wrong:

- unknown routes return JSON rather than Express's HTML stack trace
- the security headers are actually on the response
- malformed JSON is a 400, not a 500
- the assistant refuses an anonymous caller before reaching the model or the database
- `/health` reports a dead database instead of claiming to be fine

Plus the chunking logic retrieval quality depends on (size ceiling, real overlap
between neighbours, empty input) and the rate-limit key derivation — including
the subtle one: tutor #7 and student #7 are different people, since the two
tables have independent id sequences.

`npm run lint` had never actually run: the script was in `package.json` from day
one but there was no ESLint config for it to find. There is one now, the 18
errors it surfaced are fixed, and the 7 remaining `exhaustive-deps` warnings are
pinned via `--max-warnings 7` — a ratchet that blocks new ones without forcing a
risky refactor of hook dependencies today.

## Known rough edges

- **Rate limiting uses a fixed window**, so a caller can burst up to 2x the limit
  across a window boundary. A sliding window is the upgrade if that ever shows up
  in the logs.
- **Session booking is one-directional** — the row lands as `requested` and there
  is no tutor-facing confirm/decline screen yet.
- **Passwords were once stored in plain text.** They're bcrypt now, and sign-in
  transparently re-hashes any legacy row on the next successful login. That
  upgrade branch in `routes/auth/signin.js` can be deleted once the logs go quiet.
- **The schema is `CREATE TABLE IF NOT EXISTS`, not versioned migrations.** It
  can add things; it can't rename or drop one safely. A real migration tool is
  the upgrade the first time a column has to change shape.
- **Two landing-page images are ~1.1 MB each** (`both.png`, `tutor.png`), which
  dwarfs the 105 KB gzipped JS bundle. Converting them to WebP is the single
  biggest load-time win available and needs no code change.
- **Seven `react-hooks/exhaustive-deps` warnings remain.** They're all
  fetch-on-mount effects that behave correctly; fixing them properly means
  `useCallback` and a careful re-read of each page, not a blind dependency add.
- **No refresh tokens.** A JWT lasts until it expires and then you sign in again —
  the frontend now clears the session and redirects rather than leaving you on a
  dashboard where every panel silently fails.

## Layout

```
backend/
  app.js                  the Express app: CORS, security headers, rate limits,
                          /health, 404 and error handlers. No listen() call, so
                          one app serves both deploy targets.
  index.js                long-running server entrypoint (migrate, listen,
                          graceful shutdown)
  api/index.js            Vercel serverless entrypoint
  config.js               environment validation — the process won't boot misconfigured
  db.js                   the connection pool and the schema
  scripts/migrate.js      apply the schema and exit
  routes/                 auth, tutor, student, chat
  services/agent.js       tool declarations, the tool loop, conversation memory
  services/rag.js         chunking, indexing, retrieval
  services/embeddings.js  Gemini text-embedding-004
  services/redis.js       the shared, optional Redis connection
  middleware/ratelimit.js the Redis fixed-window limiter
  test/                   app smoke tests and unit tests, no services required
frontend/
  src/api.js              API base URL, auth storage, the 401 interceptor
  src/components/RequireAuth.jsx   the route guard
  vercel.json             SPA rewrite plus cache and security headers
```
