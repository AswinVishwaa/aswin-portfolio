export const config = {
  runtime: "nodejs",
};

import { pipeline } from "@xenova/transformers";
import { readFileSync } from "fs";
import { join } from "path";

// ═══════════════════════════════════════════════════════════
// 📦 Module-level cache — persists across requests (Vercel
//    reuses the same Node.js process for warm invocations)
// ═══════════════════════════════════════════════════════════
let cachedEmbedder = null;
let cachedDocEmbeddings = null; // pre-computed embeddings for all docs

const docsPath = join(process.cwd(), "api", "data", "docs.json");
const docs = JSON.parse(readFileSync(docsPath, "utf-8"));

// ═══════════════════════════════════════════════════════════
// 🔒 Simple in-memory rate limiter
//    Max 10 requests per IP per 60 seconds
// ═══════════════════════════════════════════════════════════
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const requestLog = new Map(); // ip → [timestamps]

const isRateLimited = (ip) => {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(
    (t) => now - t < WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return false;
};

// Cleanup old entries every 5 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requestLog.entries()) {
    const fresh = timestamps.filter((t) => now - t < WINDOW_MS);
    if (fresh.length === 0) requestLog.delete(ip);
    else requestLog.set(ip, fresh);
  }
}, 300_000);

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════
const embedText = async (embedder, text) => {
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return output.data;
};

const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
};

/** Lazy-load the embedder once and pre-compute all doc embeddings. */
const getEmbedder = async () => {
  if (!cachedEmbedder) {
    console.log("📦 Loading embedder for the first time (cold start)…");
    cachedEmbedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("✅ Embedder loaded. Pre-computing doc embeddings…");
    cachedDocEmbeddings = await Promise.all(
      docs.map((doc) => embedText(cachedEmbedder, doc))
    );
    console.log(`✅ Pre-computed embeddings for ${docs.length} docs.`);
  }
  return { embedder: cachedEmbedder, docEmbeddings: cachedDocEmbeddings };
};

// ═══════════════════════════════════════════════════════════
// Handler
// ═══════════════════════════════════════════════════════════
export default async function handler(req, res) {
  console.log("🔧 API /ask triggered:", req.method);

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // ── Rate limiting ─────────────────────────────────────
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    console.warn(`🚦 Rate limit hit for IP: ${ip}`);
    return res
      .status(429)
      .send("Too many requests. Please wait a moment and try again.");
  }

  // ── Parse body ────────────────────────────────────────
  let rawBody = "";
  for await (const chunk of req) {
    rawBody += chunk;
  }

  let bodyData;
  try {
    bodyData = JSON.parse(rawBody);
  } catch (e) {
    console.error("❌ Invalid JSON body:", e);
    return res.status(400).send("Bad JSON");
  }

  const { prompt } = bodyData || {};
  if (!prompt || typeof prompt !== "string") {
    console.warn("⚠️ No prompt received");
    return res.status(400).send("Prompt required");
  }

  // Guard against absurdly long prompts
  if (prompt.length > 1000) {
    return res.status(400).send("Prompt too long (max 1000 chars)");
  }

  console.log("🟡 Prompt:", prompt.slice(0, 120));

  try {
    // ── Embedder (cached after first call) ──────────────
    const { embedder, docEmbeddings } = await getEmbedder();

    // Embed only the user query (docs are already cached)
    const queryEmbedding = await embedText(embedder, prompt);

    // Retrieve top 3 most relevant docs
    const topDocs = docs
      .map((text, i) => ({
        text,
        score: cosineSimilarity(docEmbeddings[i], queryEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((d) => d.text)
      .join("\n");

    console.log("🤖 Sending to Groq…");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are Aswin Vishwaa's personal AI assistant. Answer questions based on the portfolio context, but speak like a friendly, witty, and emotionally intelligent human. Don't just inform — connect.",
          },
          {
            role: "user",
            content: `Context:\n${topDocs}\n\nQuestion: ${prompt}`,
          },
        ],
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!groqRes.ok || !groqRes.body) {
      const errorText = await groqRes.text();
      console.error("❌ Groq API error:", errorText);
      return res.status(500).send("❌ Failed to fetch from Groq");
    }

    console.log("📡 Streaming Groq response…");
    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value);
        res.write(chunk);
        if (typeof res.flush === "function") res.flush();
      }
    }

    res.end();
    console.log("✅ Stream completed.");
  } catch (err) {
    console.error("🔥 Internal server error:", err);
    res.status(500).send("❌ Internal error");
  }
}
