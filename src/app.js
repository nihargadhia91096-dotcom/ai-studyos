import "dotenv/config";
import cors from "cors";
import express from "express";
import { fileURLToPath } from "node:url";
import { createConversationRouter } from "./routes/conversation.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PDF routes
app.use("/api/pdf", pdfRoutes);
app.use("/api/conversations", createConversationRouter());

// Homepage endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI StudyOS backend is running!"
    });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy"
    });
});

const PORT = process.env.PORT || 5000;
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

export default app;
