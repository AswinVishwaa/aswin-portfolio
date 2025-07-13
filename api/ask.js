import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "langchain/document";
import { FakeEmbeddings } from "langchain/embeddings/fake";

// ✅ Import markdown and JSON as raw/static files
import aboutRaw from "../src/data/about.md?raw";
import projects from "../src/data/projects.json";

// ✅ Use Edge runtime for compatibility
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    // 1. Construct documents
    const docs = [
      new Document({ pageContent: aboutRaw }),
      ...projects.map(
        (p) =>
          new Document({
            pageContent: `${p.title}: ${p.desc}. Tech: ${p.tech.join(", ")}`,
          })
      ),
    ];

    // 2. Split
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300 });
    const splitDocs = await splitter.splitDocuments(docs);

    // 3. Embed
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new FakeEmbeddings()
    );
    const retriever = vectorStore.asRetriever();

    // 4. Model (Groq fallback to plain response)
    const responseText = `This is a mock response. Your prompt was:\n\n"${prompt}"\n\nRAG would happen here using Groq + HF in full version.`;

    return new Response(responseText);
  } catch (err) {
    console.error("❌ Error in ask API:", err);
    return new Response("Oops! Internal server error.", { status: 500 });
  }
}
