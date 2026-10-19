const { Chroma } = require("@langchain/community/vectorstores/chroma");
const {
    GoogleGenerativeAIEmbeddings,
} = require("@langchain/google-genai");

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
});

async function getVectorStore() {
    return new Chroma(embeddings, {
        collectionName: "ai_studyos",
        url: "http://localhost:8000",
    });
}

async function storeChunks(chunks, metadata = {}) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        throw new Error("No chunks provided to store.");
    }

    const vectorStore = await getVectorStore();

    const documents = chunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
            ...metadata,
            chunkIndex: index,
        },
    }));

    await vectorStore.addDocuments(documents);

    return documents.length;
}

async function searchChunks(query, k = 3) {
    if (!query || !query.trim()) {
        throw new Error("Search query cannot be empty.");
    }

    const vectorStore = await getVectorStore();

    return await vectorStore.similaritySearch(query, k);
}

module.exports = {
    getVectorStore,
    storeChunks,
    searchChunks,
};