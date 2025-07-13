import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "vercel-ai-langchain-adaptor";
import { Document } from "langchain/document";
import fs from "fs";
import path from "path";

// ✅ Use Node.js runtime for fs and dynamic imports
export const config = {
  runtime: "nodejs",
};

// ✅ Dynamic imports
const { ChatGroq } = await import("langchain/experimental/chat_models/groq");
const { HuggingFaceInferenceEmbeddings } = await import("langchain/experimental/embeddings/hf");

// ✅ Read about.md and projects.json from src/data/
const aboutPath = path.resolve(process.cwd(), "src/data/about.md");
const projectsPath = path.resolve(process.cwd(), "src/data/projects.json");

const aboutRaw = fs.readFileSync(aboutPath, "utf-8");
const projectsRaw = fs.readFileSync(projectsPath, "utf-8");
const projects = JSON.parse(projectsRaw);

export default LangChainAdapter(async (req) => {
  const { prompt } = await req.json();
  console.log("Incoming prompt:", prompt);

  // 1. Create docs
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

  // 3. Embeddings
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  const retriever = vectorStore.asRetriever();

  // 4. LLM
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-8b-8192",
    temperature: 0.4,
  });

  // 5. Prompt
  const promptTemplate = ChatPromptTemplate.fromTemplate(
    `Answer the user's question using the context below:\n\n{context}\n\nQuestion: {input}`
  );

  // 6. Combine chain
  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: promptTemplate,
  });

  const retrievalChain = await createRetrievalChain({
    retriever,
    combineDocsChain,
  });

  // 7. Run
  const result = await retrievalChain.invoke({ input: prompt });
  return new Response(result.output);
});
