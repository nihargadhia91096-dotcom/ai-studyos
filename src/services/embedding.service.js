import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
});

async function generateEmbedding(text) {
    if (!text || !text.trim()) {
        throw new Error("Text cannot be empty.");
    }

    return await embeddings.embedQuery(text);
}

async function generateEmbeddings(chunks) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        return [];
    }

    return await embeddings.embedDocuments(chunks);
}

export {
    generateEmbedding,
    generateEmbeddings,
};
