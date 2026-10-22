import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { generateAnswer } from "../services/llm.service.js";
import { splitText } from "../services/chunk.service.js";
import {
    storeChunks,
    searchChunks,
    deleteDocument,
} from "../services/chroma.service.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadDir = path.join(__dirname, "../../documents");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed."));
        }
    }
});

router.post("/upload", upload.single("pdf"), async (req, res) => {
    let parser;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF file."
            });
        }

        const dataBuffer = fs.readFileSync(req.file.path);

        parser = new PDFParse({
            data: dataBuffer
        });

  const pdfData = await parser.getText();

let chunks = [];
let chunkIndex = 0;

for (const page of pdfData.pages) {
    const pageChunks = await splitText(page.text);

    for (const chunk of pageChunks) {
        chunks.push({
            text: chunk,
            page: page.num,
            chunkIndex: chunkIndex++,
        });
    }
}

console.log(`PDF split into ${chunks.length} chunks`);

        if (chunks.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No extractable text was found in the PDF."
            });
        }
        await deleteDocument(req.file.originalname);
     const storedChunks = await storeChunks(chunks, {
    source: req.file.originalname,
    filename: req.file.filename,
    totalPages: pdfData.total,
});

        return res.status(200).json({
            success: true,
            message: "PDF uploaded, processed, embedded, and stored successfully.",
            filename: req.file.originalname,
            totalPages: pdfData.total,
            totalChunks: chunks.length,
            storedChunks,
            chunks
        });

    } catch (error) {
        console.error("PDF processing error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process and store PDF.",
            error: error.message
        });

    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
});
router.post("/search", async (req, res) => {
    try {
       const { query, k = 3, filename, history = [] } = req.body;

        // Validate the question
        if (typeof query !== "string" || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a search query.",
            });
        }

        // Validate the number of chunks to retrieve
        const resultCount = Number(k);

        if (
            !Number.isInteger(resultCount) ||
            resultCount < 1 ||
            resultCount > 10
        ) {
            return res.status(400).json({
                success: false,
                message: "k must be an integer between 1 and 10.",
            });
        }

        // Step 1: Retrieve relevant chunks from ChromaDB
    const results = await searchChunks(
    query.trim(),
    resultCount,
    filename || null
);

        if (results.length === 0) {
            return res.status(200).json({
                success: true,
                query: query.trim(),
                answer: "No relevant information was found in the uploaded documents.",
                sources: [],
            });
        }

        // Step 2: Combine the retrieved chunks into context
        const context = results
            .map((doc, index) => {
                return `Source ${index + 1}:\n${doc.pageContent}`;
            })
            .join("\n\n");

        // Step 3: Generate an answer using Gemini
        const answer = await generateAnswer(
    query.trim(),
    context,
    history
);;

        // Step 4: Return the answer and its sources
        return res.status(200).json({
            success: true,
            query: query.trim(),
            answer,
         sources: results.map((doc, index) => ({
    sourceId: index + 1,
    filename: doc.metadata.filename,
    originalName: doc.metadata.source,
    page: doc.metadata.page ?? null,
    chunkIndex: doc.metadata.chunkIndex,
    content: doc.pageContent,
})),
        });
    } catch (error) {
        console.error("RAG search error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate an answer.",
            error: error.message,
        });
    }
});
export default router;
