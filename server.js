/**
 * Local development server for the Vercel serverless API function.
 *
 * Usage (two terminals):
 *   Terminal 1:  node server.js          ← starts API on :3001
 *   Terminal 2:  npm run dev             ← starts Vite on :5173 (proxies /api → :3001)
 *
 * Or:  npm run dev:all  (runs both, may need two terminals on Windows PowerShell)
 */

import "dotenv/config";
import express from "express";
import handler from "./api/ask.js";

const app = express();
const PORT = 3001;

// Mount the Vercel handler — express passes (req, res) directly
app.all("/api/ask", (req, res) => {
    handler(req, res);
});

app.listen(PORT, () => {
    console.log(`✅ Local API server → http://localhost:${PORT}`);
    console.log(`   POST  http://localhost:${PORT}/api/ask`);
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
        console.warn("⚠️  GROQ_API_KEY is not set in .env — AI responses will fail.");
    } else {
        console.log("🔑 GROQ_API_KEY loaded.");
    }
});
