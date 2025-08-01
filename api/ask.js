export const config = {
  runtime: "nodejs",
};

import { pipeline } from "@xenova/transformers";

// Embedding helper
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
  try {
    const { prompt } = req.body;
    console.log("🟡 Prompt:", prompt);

    const baseUrl =
      process.env.VERCEL_ENV === "production"
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    // 🔁 Load docs.json
    const docsRes = await fetch(`${baseUrl}/data/docs.json`);
    if (!docsRes.ok) {
      return res.status(500).send("❌ Failed to load docs.json");
    }
    const docs = await docsRes.json();
    console.log(`📄 Loaded ${docs.length} documents`);

    // Load embedding model
    console.log("📦 Loading embedding model...");
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    console.log("🔍 Embedding documents...");
    const docEmbeddings = await Promise.all(docs.map((doc) => embedText(embedder, doc)));
    const queryEmbedding = await embedText(embedder, prompt);

    // Match top documents
    const topDocs = docs
      .map((text, i) => ({
        text,
        score: cosineSimilarity(docEmbeddings[i], queryEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((d) => d.text)
      .join("\n");

    console.log("🤖 Sending context to Groq...");

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
      console.error("❌ Groq error:", errText);
      return res.status(500).send("❌ Failed to fetch from Groq");
    }

    // Stream Groq reply manually
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
  } catch (err) {
    console.error("🔥 Internal error:", err);
    res.status(500).send("❌ Internal error");
  }
}
