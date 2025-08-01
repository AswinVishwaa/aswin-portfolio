export const config = {
  runtime: "nodejs",
};

import { pipeline } from "@xenova/transformers";
import { readFileSync } from "fs";
import { join } from "path";


const docsPath = join(process.cwd(), "api", "data", "docs.json");
const docs = JSON.parse(readFileSync(docsPath, "utf-8"));

// Embed helper
const embedText = async (embedder, text) => {
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return output.data;
};

// Cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
};

export default async function handler(req, res) {
  console.log("🔧 API /ask triggered:", req.method);

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Manually parse JSON body
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
  if (!prompt) {
    console.warn("⚠️ No prompt received");
    return res.status(400).send("Prompt required");
  }

  console.log("🟡 Prompt:", prompt);

  try {
    console.log(`📄 Loaded ${docs.length} documents`);

    // Load embedding model
    console.log("📦 Loading embedder...");
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    // Embed documents and prompt
    console.log("🔍 Embedding documents and query...");
    const docEmbeddings = await Promise.all(docs.map((doc) => embedText(embedder, doc)));
    const queryEmbedding = await embedText(embedder, prompt);

    // Similarity & context
    const topDocs = docs
      .map((text, i) => ({
        text,
        score: cosineSimilarity(docEmbeddings[i], queryEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((d) => d.text)
      .join("\n");

    console.log("🤖 Sending to Groq...");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You are Aswin Vishwaa’s personal AI assistant. Answer questions based on the portfolio context, but speak like a friendly, witty, and emotionally intelligent human. Don’t just inform — connect.",
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

    console.log("📡 Streaming Groq response...");
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
        res.flush?.();
      }
    }

    res.end();
    console.log("✅ Stream completed.");
  } catch (err) {
    console.error("🔥 Internal server error:", err);
    res.status(500).send("❌ Internal error");
  }
}
