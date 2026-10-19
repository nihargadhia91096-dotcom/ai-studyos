const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const { splitText } = require("../services/chunk.service");

const router = express.Router();

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

        // Initialize the parser using the pdf-parse v2 API
        parser = new PDFParse({
            data: dataBuffer
        });

        const pdfData = await parser.getText();
        const chunks = await splitText(pdfData.text);

console.log(`PDF split into ${chunks.length} chunks`);

       res.status(200).json({
    success: true,
    message: "PDF uploaded, processed, and chunked successfully.",
    filename: req.file.originalname,
    totalPages: pdfData.total,
    totalChunks: chunks.length,
    chunks: chunks
});
    } catch (error) {
        console.error("PDF processing error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to process PDF.",
            error: error.message
        });

    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
});

module.exports = router;