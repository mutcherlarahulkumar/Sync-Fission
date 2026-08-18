import { GoogleGenerativeAI, FunctionDeclarationSchemaType as T } from '@google/generative-ai';
import { getClient } from '../db.js';
import { redis, redisReady } from './redis.js';
import { search as searchMaterials, ragConfigured } from './rag.js';

// Devika, the assistant behind the chat bubble.
//
// She is not a plain chat completion. Three tools are declared to the model and
// it decides, per message, which (if any) to call:
//
//   search_materials    → RAG over the tutor's uploaded study material
//   get_tutor_profile   → who teaches this class, and how to reach them
//   schedule_session    → books a 1-on-1 slot, writing a real row to Postgres
//
// The rule that matters: every tool resolves the caller's own classes first and
// filters by them. The model can ask for class 7's notes all it likes — if the
// student isn't enrolled in class 7, the tool returns nothing. Authorisation
// lives in the tool, never in the prompt.

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const MAX_TOOL_ROUNDS = 4; // a runaway tool loop is a runaway bill
const HISTORY_TURNS = 12;
const HISTORY_TTL_SECONDS = 60 * 60 * 24;

const systemInstruction = `You are Devika, the teaching assistant on Sync Fission,
a platform that connects tutors and students.

Use your tools before answering anything about a specific class, its material, or
its tutor. Never guess a tutor's name, contact details, or what a course covers —
look it up.

When search_materials returns passages, answer from them and say which resource
you used. If it returns nothing, say you couldn't find it in the uploaded material
and answer from general knowledge, clearly flagged as such.

Before calling schedule_session, confirm the class, topic and time with the
student in plain language. Be warm and brief — you are talking to someone who is
probably stuck on a problem right now.`;

// ── tool declarations ────────────────────────────────────────────────────────

const functionDeclarations = [
    {
        name: 'search_materials',
        description:
            "Search the study material tutors have uploaded to the caller's classes. " +
            'Use for any question about course content, notes, or topics covered.',
        parameters: {
            type: T.OBJECT,
            properties: {
                query: { type: T.STRING, description: 'What to look for, in natural language.' },
                class_id: {
                    type: T.INTEGER,
                    description: 'Optional: restrict the search to one class the caller belongs to.',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_tutor_profile',
        description:
            'Look up the tutor who teaches one of the caller\'s classes, including their ' +
            'name, email and the other classes they run.',
        parameters: {
            type: T.OBJECT,
            properties: {
                class_id: { type: T.INTEGER, description: 'The class whose tutor to look up.' },
            },
            required: ['class_id'],
        },
    },
    {
        name: 'schedule_session',
        description:
            'Book a 1-on-1 session between the student and the tutor of one of their ' +
            'classes. Only call once the student has confirmed class, topic and time.',
        parameters: {
            type: T.OBJECT,
            properties: {
                class_id: { type: T.INTEGER, description: 'The class the session is for.' },
                topic: { type: T.STRING, description: 'What the student wants to cover.' },
                when: {
                    type: T.STRING,
                    description: 'Requested start time as an ISO 8601 timestamp, e.g. 2025-03-04T15:00:00Z.',
                },
            },
            required: ['class_id', 'topic', 'when'],
        },
    },
];

// ── tool implementations ─────────────────────────────────────────────────────

/** The classes this caller is allowed to see. Everything else is filtered by it. */
async function callerClasses(caller) {
    const client = await getClient();
    const { rows } =
        caller.role === 'tutor'
            ? await client.query(
                  'SELECT id, name FROM class WHERE tutor_id = $1',
                  [caller.id],
              )
            : await client.query(
                  `SELECT c.id, c.name FROM class c
                   JOIN class_student cs ON cs.class_id = c.id
                   WHERE cs.student_id = $1`,
                  [caller.id],
              );
    return rows;
}

const tools = {
    async search_materials({ query, class_id }, caller) {
        if (!ragConfigured()) {
            return { error: 'Material search is not configured on this deployment.' };
        }

        const allowed = await callerClasses(caller);
        if (!allowed.length) {
            return { passages: [], note: 'The caller is not enrolled in any class yet.' };
        }

        const classIds = class_id
            ? allowed.filter((c) => c.id === Number(class_id)).map((c) => c.id)
            : allowed.map((c) => c.id);

        if (!classIds.length) {
            return { error: 'The caller does not have access to that class.' };
        }

        const passages = await searchMaterials(query, { classIds, k: 4 });
        return {
            passages,
            note: passages.length ? undefined : 'No uploaded material matched this query.',
        };
    },

    async get_tutor_profile({ class_id }, caller) {
        const allowed = await callerClasses(caller);
        if (!allowed.some((c) => c.id === Number(class_id))) {
            return { error: 'The caller does not have access to that class.' };
        }

        const client = await getClient();
        const { rows } = await client.query(
            `SELECT t.id, t.first_name, t.last_name, t.email
             FROM tutor t JOIN class c ON c.tutor_id = t.id
             WHERE c.id = $1`,
            [class_id],
        );
        if (!rows.length) return { error: 'That class has no tutor assigned.' };

        const tutor = rows[0];
        const { rows: classes } = await client.query(
            'SELECT id, name, description FROM class WHERE tutor_id = $1',
            [tutor.id],
        );

        return {
            tutor: {
                name: `${tutor.first_name} ${tutor.last_name}`,
                email: tutor.email,
                teaches: classes.map((c) => ({ id: c.id, name: c.name, about: c.description })),
            },
        };
    },

    async schedule_session({ class_id, topic, when }, caller) {
        if (caller.role !== 'student') {
            return { error: 'Only students can request a session through the assistant.' };
        }

        const scheduledAt = new Date(when);
        if (Number.isNaN(scheduledAt.getTime())) {
            return { error: `Could not read "${when}" as a date and time.` };
        }
        if (scheduledAt.getTime() < Date.now()) {
            return { error: 'That time is in the past — ask the student for a future slot.' };
        }

        const allowed = await callerClasses(caller);
        if (!allowed.some((c) => c.id === Number(class_id))) {
            return { error: 'The caller is not enrolled in that class.' };
        }

        const client = await getClient();
        const { rows: tutorRows } = await client.query(
            'SELECT tutor_id FROM class WHERE id = $1',
            [class_id],
        );
        if (!tutorRows.length || !tutorRows[0].tutor_id) {
            return { error: 'That class has no tutor to book with.' };
        }

        const { rows } = await client.query(
            `INSERT INTO session (class_id, tutor_id, student_id, topic, scheduled_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, topic, scheduled_at, status`,
            [class_id, tutorRows[0].tutor_id, caller.id, String(topic).slice(0, 300), scheduledAt],
        );

        return {
            booked: rows[0],
            note: 'The session is saved as "requested" until the tutor confirms it.',
        };
    },
};

// ── conversation memory ──────────────────────────────────────────────────────

const historyKey = (caller) => `chat:history:${caller.role}:${caller.id}`;

async function loadHistory(caller) {
    if (!redisReady()) return [];
    try {
        const raw = await redis.get(historyKey(caller));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

async function saveHistory(caller, history) {
    if (!redisReady()) return;
    try {
        // Only plain text turns are persisted. Tool calls and their results are
        // meaningless without each other, and half a pair breaks the next request.
        const trimmed = history
            .filter((turn) => turn.parts?.every((p) => typeof p.text === 'string' && p.text))
            .slice(-HISTORY_TURNS);
        await redis.set(historyKey(caller), JSON.stringify(trimmed), 'EX', HISTORY_TTL_SECONDS);
    } catch (err) {
        console.warn('Could not persist chat history:', err.message);
    }
}

export async function clearHistory(caller) {
    if (redisReady()) await redis.del(historyKey(caller));
}

// ── the loop ─────────────────────────────────────────────────────────────────

export async function ask(userInput, caller) {
    if (!process.env.GEMINI_API_KEY) {
        throw Object.assign(new Error('GEMINI_API_KEY is not configured'), { code: 'NO_API_KEY' });
    }

    const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
        model: MODEL,
        systemInstruction,
        tools: [{ functionDeclarations }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 1200 },
    });

    const history = await loadHistory(caller);
    const chat = model.startChat({ history });

    let result = await chat.sendMessage(userInput);
    const toolsUsed = [];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const calls = result.response.functionCalls();
        if (!calls?.length) break;

        const responses = await Promise.all(
            calls.map(async (call) => {
                const impl = tools[call.name];
                toolsUsed.push(call.name);

                let response;
                if (!impl) {
                    response = { error: `Unknown tool ${call.name}` };
                } else {
                    try {
                        response = await impl(call.args || {}, caller);
                    } catch (err) {
                        // Hand the failure back to the model rather than to the
                        // student — it can apologise or try another route.
                        console.error(`Tool ${call.name} failed:`, err);
                        response = { error: 'That lookup failed. Try a different approach.' };
                    }
                }
                return { functionResponse: { name: call.name, response } };
            }),
        );

        result = await chat.sendMessage(responses);
    }

    const text = result.response.text();
    await saveHistory(caller, await chat.getHistory());

    return { text, toolsUsed };
}
