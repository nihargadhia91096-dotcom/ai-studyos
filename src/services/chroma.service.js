import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

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

    const documents = chunks.map((chunk) => ({
        pageContent: chunk.text,
        metadata: {
            ...metadata,
            page: chunk.page,
            chunkIndex: chunk.chunkIndex,
        },
    }));

    await vectorStore.addDocuments(documents);

    return documents.length;
}
async function deleteDocument(originalName) {
    if (!originalName) {
        throw new Error("Original filename is required.");
    }

    const vectorStore = await getVectorStore();

    await vectorStore.delete({
        filter: {
            source: originalName,
        },
    });
}
async function searchChunks(query, k = 3, filename = null) {
    if (!query || !query.trim()) {
        throw new Error("Search query cannot be empty.");
    }

    const vectorStore = await getVectorStore();

    const filter = filename
        ? { filename: filename }
        : undefined;

    return await vectorStore.similaritySearch(
        query,
        k,
        filter
    );
}

export {
    getVectorStore,
    storeChunks,
    searchChunks,
    deleteDocument,
};
