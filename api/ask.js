import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "langchain/document";
import { LangChainStream, StreamingTextResponse } from "ai";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { prompt } = await req.json();

  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const [aboutRes, projectRes] = await Promise.all([
    fetch(`${baseUrl}/data/about.md`),
    fetch(`${baseUrl}/data/projects.json`),
  ]);

  if (!aboutRes.ok || !projectRes.ok) {
    return new Response("Failed to fetch static data", { status: 500 });
  }

  const aboutRaw = await aboutRes.text();
  const projects = await projectRes.json();

  // Build documents
  const docs = [
    new Document({ pageContent: aboutRaw }),
    ...projects.map(
      (p) =>
        new Document({
          pageContent: `${p.title}: ${p.desc}. Tech: ${p.tech.join(", ")}`,
        })
    ),
  ];

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300 });
  const splitDocs = await splitter.splitDocuments(docs);

  const { HuggingFaceInferenceEmbeddings } = await import(
    "langchain/experimental/embeddings/hf"
  );
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  const retriever = vectorStore.asRetriever();

  const { ChatGroq } = await import("langchain/experimental/chat_models/groq");
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-8b-8192",
    temperature: 0.4,
  });

  const promptTemplate = ChatPromptTemplate.fromTemplate(
    `Answer the user's question using the context below:\n\n{context}\n\nQuestion: {input}`
  );

  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: promptTemplate,
  });

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain,
  });

  const { stream, handlers } = LangChainStream();

  retrievalChain
    .invoke({ input: prompt }, handlers)
    .catch((err) => console.error("❌ LangChain error:", err));

  return new StreamingTextResponse(stream);
}
