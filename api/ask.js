import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "vercel-ai-langchain-adaptor";
import { Document } from "langchain/document";

import aboutRaw from "../src/data/about.md?raw"; // ✅ use Vite's raw loader
import projects from "../src/data/projects.json"; // ✅ static import

// ✅ Keep runtime nodejs only if needed
export const config = {
  runtime: "nodejs",
};

const { ChatGroq } = await import("langchain/experimental/chat_models/groq");
const { HuggingFaceInferenceEmbeddings } = await import("langchain/experimental/embeddings/hf");

export default LangChainAdapter(async (req) => {
  const { prompt } = await req.json();

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
