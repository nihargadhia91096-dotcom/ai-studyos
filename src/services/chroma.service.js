import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { CloudClient } from "chromadb";

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
});

async function getVectorStore() {
    const host = process.env.CHROMA_HOST;
    const apiKey = process.env.CHROMA_API_KEY;
    const tenant = process.env.CHROMA_TENANT;
    const database = process.env.CHROMA_DATABASE;

    if (host && apiKey && tenant && database) {
        const cloudHost = host.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
        const client = new CloudClient({
            apiKey,
            host: cloudHost,
            tenant,
            database,
        });

        return new Chroma(embeddings, {
            collectionName: "ai_studyos",
            index: client,
        });
    }

    const chromaAddress =
        process.env.CHROMA_URL ||
        process.env.CHROMA_HOSTPORT ||
        "http://localhost:8000";

    const url = /^https?:\/\//i.test(chromaAddress)
        ? chromaAddress
        : `http://${chromaAddress}`;

    return new Chroma(embeddings, {
        collectionName: "ai_studyos",
        url,
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
