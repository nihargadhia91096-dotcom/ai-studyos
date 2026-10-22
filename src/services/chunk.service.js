import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
});

async function splitText(text) {
    if (!text || !text.trim()) {
        return [];
    }

    const chunks = await splitter.splitText(text);

    return chunks;
}

export { splitText };
