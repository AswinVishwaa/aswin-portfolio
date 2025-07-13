import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "vercel-ai-langchain-adaptor";
import { Document } from "langchain/document";
import fs from "fs";
import path from "path";

// ✅ Use Node.js runtime to support fs
export const config = {
  runtime: "nodejs",
};

// ✅ Dynamic imports for Groq + HF
const { ChatGroq } = await import("langchain/experimental/chat_models/groq");
const { HuggingFaceInferenceEmbeddings } = await import("langchain/experimental/embeddings/hf");

// ✅ Read files from root-level /data/
const aboutPath = path.resolve(process.cwd(), "data/about.md");
const projectsPath = path.resolve(process.cwd(), "data/projects.json");

const aboutRaw = fs.readFileSync(aboutPath, "utf-8");
const projectsRaw = fs.readFileSync(projectsPath, "utf-8");
const projects = JSON.parse(projectsRaw);

export default LangChainAdapter(async (req) => {
  const { prompt } = await req.json();
  console.log("Incoming prompt:", prompt);

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

  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  const retriever = vectorStore.asRetriever();

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

  const result = await retrievalChain.invoke({ input: prompt });

  return new Response(result.output);
});
