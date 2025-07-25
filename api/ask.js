export const config = {
  runtime: "edge",
};

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/embeddings/sentence-transformers/all-MiniLM-L6-v2";

const embedText = async (text) => {
  const res = await fetch(HUGGINGFACE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!res.ok) throw new Error("Embedding API failed");
  return await res.json();
};

const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
};

export default async function handler(req) {
  try {
    const { prompt } = await req.json();

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const [aboutRes, projectRes] = await Promise.all([
      fetch(`${baseUrl}/data/about.md`),
      fetch(`${baseUrl}/data/projects.json`),
    ]);

    if (!aboutRes.ok || !projectRes.ok) {
      return new Response("❌ Failed to load data", { status: 500 });
    }

    const aboutText = await aboutRes.text();
    const projects = await projectRes.json();

    const docs = [
      aboutText,
      ...projects.map((p) => `${p.title}: ${p.desc}. Tech: ${p.tech.join(", ")}`),
    ];

    const docEmbeddings = await Promise.all(docs.map(embedText));
    const queryEmbedding = await embedText(prompt);

    const topDocs = docs
      .map((text, i) => ({
        text,
        score: cosineSimilarity(docEmbeddings[i], queryEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((d) => d.text)
      .join("\n");

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
      return new Response("❌ Failed to fetch from Groq", { status: 500 });
    }

    return new Response(groqRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response("❌ Internal error", { status: 500 });
  }
}

