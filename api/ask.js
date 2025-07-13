import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "vercel-ai-langchain-adaptor";
import { Document } from "langchain/document";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { ChatGroq } from "langchain/chat_models/groq"; // ✅ Stable export
import fs from "fs";
import path from "path";

// ✅ Node.js runtime
export const config = {
  runtime: "nodejs",
};

// ✅ Read content
const aboutPath = path.resolve(process.cwd(), "data/about.md");
const projectsPath = path.resolve(process.cwd(), "data/projects.json");

const aboutRaw = fs.readFileSync(aboutPath, "utf-8");
const projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));

export default LangChainAdapter(async (req) => {
  const { prompt } = await req.json();
  console.log("🔍 Prompt:", prompt);

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

  // 2. Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300 });
  const splitDocs = await splitter.splitDocuments(docs);

  // 3. Use Fake Embeddings
  const embeddings = new FakeEmbeddings();
  const store = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  const retriever = store.asRetriever();

  // 4. LLM from Groq (✅ stable import)
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-8b-8192",
    temperature: 0.4,
  });

  // 5. Prompt template
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

  // 7. Run
  const result = await retrievalChain.invoke({ input: prompt });

  return new Response(result.output);
});
