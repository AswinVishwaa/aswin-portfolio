export const config = {
  runtime: "nodejs",
};

import { pipeline } from "@xenova/transformers";

// Helper: embed text
const embedText = async (embedder, text) => {
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return output.data;
};

// Helper: cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
};

export default async function handler(req, res) {
  console.log("🔧 Handler triggered:", req.method);

  if (req.method !== "POST") {
    console.warn("🚫 Method not allowed:", req.method);
    return res.status(405).send("Method Not Allowed");
  }

  // ✅ Manually parse request body (required in Vercel)
  let rawBody = "";
  for await (const chunk of req) {
    rawBody += chunk;
  }

  let bodyData;
  try {
    bodyData = JSON.parse(rawBody);
  } catch (e) {
    console.error("❌ Invalid JSON:", e);
    return res.status(400).send("Bad Request: Invalid JSON");
  }

  const { prompt } = bodyData || {};
  if (!prompt) {
    console.error("⚠️ No prompt received.");
    return res.status(400).send("Prompt is required.");
  }

  console.log("🟡 Prompt received:", prompt);

  try {
    const baseUrl =
      process.env.VERCEL_ENV === "production"
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    // 🔁 Load docs.json
    const docsRes = await fetch(`${baseUrl}/data/docs.json`);
    if (!docsRes.ok) {
      console.error("❌ Failed to fetch docs.json");
      return res.status(500).send("❌ Failed to load docs.json");
    }

    const docs = await docsRes.json();
    console.log(`📄 Loaded ${docs.length} documents`);

    // 📦 Load embedder
    console.log("📦 Loading embedding model...");
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    // 🔍 Embed texts
    console.log("🔍 Embedding documents and prompt...");
    const docEmbeddings = await Promise.all(docs.map((doc) => embedText(embedder, doc)));
    const queryEmbedding = await embedText(embedder, prompt);

    // 🔎 Match top 3 relevant docs
    const topDocs = docs
      .map((text, i) => ({
        text,
        score: cosineSimilarity(docEmbeddings[i], queryEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((d) => d.text)
      .join("\n");

    console.log("🤖 Sending request to Groq...");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant who answers questions based on portfolio context provided.",
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
      const errText = await groqRes.text();
      console.error("❌ Groq API error:", errText);
      return res.status(500).send("❌ Failed to fetch from Groq");
    }

    // ✅ Stream response
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
    console.log("✅ Stream completed successfully.");

  } catch (err) {
    console.error("🔥 Server crashed:", err);
    res.status(500).send("❌ Internal Server Error");
  }
}
