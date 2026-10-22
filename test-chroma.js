import "dotenv/config";
import { getVectorStore, storeChunks } from "./src/services/chroma.service.js";

async function testChroma() {
    try {
        console.log("Testing ChromaDB integration...");

        const chunks = [
            {
                text: "AI StudyOS helps students understand their study materials.",
                page: 1,
                chunkIndex: 0,
            },
            {
                text: "Retrieval-Augmented Generation retrieves relevant information from documents.",
                page: 1,
                chunkIndex: 1,
            },
        ];

        const count = await storeChunks(chunks, {
            source: "test-document",
        });

        console.log(`Successfully stored ${count} chunks!`);

        const vectorStore = await getVectorStore();

        const results = await vectorStore.similaritySearch(
            "What does AI StudyOS do?",
            2
        );

        console.log("\nSearch results:");

        results.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.pageContent}`);
        });

        console.log("\nChromaDB integration test passed!");
    } catch (error) {
        console.error("ChromaDB test failed:", error.message);
    }
}

testChroma();
