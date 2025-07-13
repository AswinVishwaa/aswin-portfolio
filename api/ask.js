import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "vercel-ai-langchain-adaptor";
import { Document } from "langchain/document";
import fs from "fs";
import path from "path";
import projects from "../data/projects.json"; // not from /src

// Use Node.js runtime (✅ supports fs and experimental packages)
export const config = {
  runtime: "nodejs",
};

// Dynamic imports (✅ supported in nodejs runtime)
const { ChatGroq } = await import("langchain/experimental/chat_models/groq");
const { HuggingFaceInferenceEmbeddings } = await import("langchain/experimental/embeddings/hf");

// Read about.md using fs
const aboutPath = path.resolve(process.cwd(), "data/about.md");
const aboutRaw = fs.readFileSync(aboutPath, "utf-8");

export default LangChainAdapter(async (req) => {
  const { prompt } = await req.json();
  console.log("Incoming prompt:", prompt);

  // 1. Load documents (about + projects)
  const docs = [
    new Document({ pageContent: aboutRaw }),
    ...projects.map(
      (p) =>
        new Document({
          pageContent: `${p.title}: ${p.desc}. Tech: ${p.tech.join(", ")}`,
        })
    ),
  ];

  // 2. Chunk split
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300 });
  const splitDocs = await splitter.splitDocuments(docs);

  // 3. Embeddings (Hugging Face)
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  const store = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  const retriever = store.asRetriever();

  // 4. LLM from Groq
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-8b-8192",
    temperature: 0.4,
  });

  // 5. Prompt
  const promptTemplate = ChatPromptTemplate.fromTemplate(
    `Answer the user's question using the context below:\n\n{context}\n\nQuestion: {input}`
  );

  // 6. Chain
  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: promptTemplate,
  });

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain,
  });

  // 7. Run it
  const result = await retrievalChain.invoke({ input: prompt });

  return new Response(result.output);
});
