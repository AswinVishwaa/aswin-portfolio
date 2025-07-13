import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { LangChainAdapter } from "vercel-ai-langchain-adaptor";
import { Document } from "langchain/document";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import fs from "fs";
import path from "path";

export const config = {
  runtime: "nodejs",
};

// Load static files
const aboutPath = path.resolve(process.cwd(), "data/about.md");
const projectsPath = path.resolve(process.cwd(), "data/projects.json");

const aboutRaw = fs.readFileSync(aboutPath, "utf-8");
const projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));

export default LangChainAdapter(async (req) => {
  const { prompt } = await req.json();

  const docs = [
    new Document({ pageContent: aboutRaw }),
    ...projects.map((p) => new Document({
      pageContent: `${p.title}: ${p.desc}. Tech: ${p.tech.join(", ")}`
    }))
  ];

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300 });
  const splitDocs = await splitter.splitDocuments(docs);

  const store = await MemoryVectorStore.fromDocuments(splitDocs, new FakeEmbeddings());
  const retriever = store.asRetriever();

  const relevantDocs = await retriever.getRelevantDocuments(prompt);

  const summary = relevantDocs.map((doc, idx) => `#${idx + 1}: ${doc.pageContent}`).join("\n\n");

  return new Response(
    summary || "I couldn't find anything related to your question in my knowledge."
  );
});
