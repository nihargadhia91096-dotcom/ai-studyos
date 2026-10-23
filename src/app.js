import "dotenv/config";
import cors from "cors";
import express from "express";
import { fileURLToPath } from "node:url";
import { clerkAuthMiddleware } from "./middleware/clerk-auth.middleware.js";
import { createConversationRouter } from "./routes/conversation.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_ORIGIN,
    "https://ai-studyos.vercel.app",
    "http://localhost:5173",
    "http://localhost:8080",
].filter(Boolean);

app.use(
    cors({
        credentials: true,
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked origin: ${origin}`));
        },
    }),
);
app.use(clerkAuthMiddleware());
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
