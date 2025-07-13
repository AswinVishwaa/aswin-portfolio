import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "langchain/document";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import fs from "fs";
import path from "path";

// ✅ Use Node.js runtime to support fs
export const config = {
  runtime: "nodejs",
};

// ✅ Load data
const aboutPath = path.resolve(process.cwd(), "data/about.md");
const projectsPath = path.resolve(process.cwd(), "data/projects.json");

const aboutRaw = fs.readFileSync(aboutPath, "utf-8");
const projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));

export default async function handler(req, res) {
  const { prompt } = await req.json?.();

  if (!prompt) {
    return new Response("Prompt is required", { status: 400 });
  }

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

  const store = await MemoryVectorStore.fromDocuments(splitDocs, new FakeEmbeddings());
  const retriever = store.asRetriever();
  const relevantDocs = await retriever.getRelevantDocuments(prompt);

  const result = relevantDocs.map((doc, i) => `• ${doc.pageContent}`).join("\n\n");

  return new Response(result || "Sorry, I couldn't find anything relevant.");
}
