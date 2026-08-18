import { GoogleGenerativeAI } from '@google/generative-ai';

// Embeddings come from Gemini (text-embedding-004, 768 dimensions).
//
// Note for anyone swapping providers: the chat model is configurable, but the
// embedding model is not. Grok/xAI has no embeddings endpoint, and re-embedding
// an existing ChromaDB collection with a different model would make every stored
// vector meaningless. If you change this, delete the collection and re-index.

const EMBEDDING_MODEL = 'text-embedding-004';

let model = null;

function getModel() {
    if (model) return model;
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is required for embeddings');
    model = new GoogleGenerativeAI(key).getGenerativeModel({ model: EMBEDDING_MODEL });
    return model;
}

/** Embed a batch of strings. Returns one vector per input, in order. */
export async function embed(texts) {
    if (!texts.length) return [];

    const { embeddings } = await getModel().batchEmbedContents({
        requests: texts.map((text) => ({
            model: `models/${EMBEDDING_MODEL}`,
            content: { parts: [{ text }] },
        })),
    });
    return embeddings.map((e) => e.values);
}

/** Embed a single string. */
export async function embedOne(text) {
    const [vector] = await embed([text]);
    return vector;
}
