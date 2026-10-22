import "dotenv/config";
import { generateEmbedding } from "./src/services/embedding.service.js";

async function testEmbedding() {
    try {
        const text = "AI StudyOS helps students understand their study materials.";

        console.log("Generating embedding...");

        const vector = await generateEmbedding(text);

        console.log("Embedding generated successfully!");
        console.log("Vector dimensions:", vector.length);
        console.log("First 5 values:", vector.slice(0, 5));
    } catch (error) {
        console.error("Embedding test failed:", error.message);
    }
}

testEmbedding();
