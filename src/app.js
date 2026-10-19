require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pdfRoutes = require("./routes/pdf.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PDF routes
app.use("/api/pdf", pdfRoutes);

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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});