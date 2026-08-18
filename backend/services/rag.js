import { ChromaClient } from 'chromadb';
import { embed, embedOne } from './embeddings.js';

// Retrieval layer over the study material tutors upload.
//
// Flow: a tutor adds a resource → its text is split into overlapping chunks →
// each chunk is embedded and upserted into ChromaDB with the class id in its
// metadata. When a student asks something, we embed the question, pull the
// nearest chunks *from their classes only*, and hand those to the model as
// context. The model answers from the tutor's own material instead of from
// whatever it happens to remember about the topic.
//
// Like Redis, Chroma is optional: if it isn't running, retrieval is skipped and
// the assistant answers from general knowledge. Study material never blocks a
// login.

const COLLECTION = 'tutor_materials';

// ~800 characters is roughly a paragraph or two — big enough to carry an idea,
// small enough that a match is actually about the thing you asked. The overlap
// stops a definition that straddles a boundary from being lost by both chunks.
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

let collectionPromise = null;

export function ragConfigured() {
    return Boolean(process.env.CHROMA_URL && process.env.GEMINI_API_KEY);
}

async function getCollection() {
    if (!ragConfigured()) return null;
    if (collectionPromise) return collectionPromise;

    collectionPromise = (async () => {
        const url = new URL(process.env.CHROMA_URL);
        const client = new ChromaClient({
            host: url.hostname,
            port: Number(url.port) || (url.protocol === 'https:' ? 443 : 8000),
            ssl: url.protocol === 'https:',
        });
        // embeddingFunction: null — we always pass vectors we computed ourselves,
        // so Chroma never needs to call an embedding provider on our behalf.
        return client.getOrCreateCollection({ name: COLLECTION, embeddingFunction: null });
    })().catch((err) => {
        console.warn('ChromaDB unavailable, retrieval disabled:', err.message);
        collectionPromise = null; // let the next call retry
        return null;
    });

    return collectionPromise;
}

export function chunk(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    if (clean.length <= size) return [clean];

    const chunks = [];
    for (let start = 0; start < clean.length; start += size - overlap) {
        chunks.push(clean.slice(start, start + size));
        if (start + size >= clean.length) break;
    }
    return chunks;
}

/**
 * Index one resource. Safe to call repeatedly for the same resource —
 * chunk ids are deterministic, so a re-index overwrites rather than duplicates.
 */
export async function indexResource({ resourceId, classId, title, type, content }) {
    const collection = await getCollection();
    if (!collection) return { indexed: 0 };

    const chunks = chunk([title, type, content].filter(Boolean).join('\n'));
    if (!chunks.length) return { indexed: 0 };

    const vectors = await embed(chunks);

    await collection.upsert({
        ids: chunks.map((_, i) => `resource-${resourceId}-${i}`),
        embeddings: vectors,
        documents: chunks,
        metadatas: chunks.map(() => ({
            resource_id: String(resourceId),
            class_id: String(classId),
            title: title || '',
        })),
    });

    return { indexed: chunks.length };
}

export async function removeResource(resourceId) {
    const collection = await getCollection();
    if (!collection) return;
    await collection.delete({ where: { resource_id: String(resourceId) } });
}

/**
 * Nearest chunks to `query`, restricted to the given class ids.
 * Returns [] whenever retrieval isn't possible, never throws at the caller.
 */
export async function search(query, { classIds = [], k = 4 } = {}) {
    const collection = await getCollection();
    if (!collection || !query?.trim()) return [];

    try {
        const where = classIds.length
            ? { class_id: { $in: classIds.map(String) } }
            : undefined;

        const result = await collection.query({
            queryEmbeddings: [await embedOne(query)],
            nResults: k,
            where,
        });

        const documents = result.documents?.[0] || [];
        const metadatas = result.metadatas?.[0] || [];
        const distances = result.distances?.[0] || [];

        return documents.map((text, i) => ({
            text,
            title: metadatas[i]?.title || 'Untitled',
            resourceId: metadatas[i]?.resource_id,
            classId: metadatas[i]?.class_id,
            // Chroma returns distance; smaller is closer. Flip it so the model
            // sees something that reads like a relevance score.
            score: distances[i] == null ? null : Number((1 / (1 + distances[i])).toFixed(3)),
        }));
    } catch (err) {
        console.warn('Retrieval failed, answering without context:', err.message);
        return [];
    }
}
