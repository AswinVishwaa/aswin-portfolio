import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "vercel-ai-langchain-adaptor";
import { Document } from "langchain/document";
import { readFileSync } from "fs";
import { join } from "path";

// Edge config
export const config = {
  runtime: "edge",
};

// Import Groq + HF embeddings from experimental exports
const { ChatGroq } = await import("langchain/experimental/chat_models/groq");
const { HuggingFaceInferenceEmbeddings } = await import("langchain/experimental/embeddings/hf");

export default LangChainAdapter(async (req) => {
  const { prompt } = await req.json();

  // ✅ Read files at runtime
  const aboutRaw = readFileSync(join(process.cwd(), "data/about.md"), "utf8");
  const projectsRaw = readFileSync(join(process.cwd(), "data/projects.json"), "utf8");
  const projects = JSON.parse(projectsRaw);

  // 1. Create documents from about + projects
  const docs = [
    new Document({ pageContent: aboutRaw }),
    ...projects.map(
      (p) =>
        new Document({
          pageContent: `${p.title}: ${p.desc}. Tech: ${p.tech.join(", ")}`,
        })
    ),
  ];

  // 2. Split docs into chunks
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300 });
  const splitDocs = await splitter.splitDocuments(docs);

  // 3. Embeddings
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  const retriever = vectorStore.asRetriever();

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

  // 7. Invoke
  const result = await retrievalChain.invoke({ input: prompt });

  return new Response(result.output);
});
