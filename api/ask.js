import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "langchain/document";
import { FakeEmbeddings } from "langchain/embeddings/fake";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    // 1. Fetch files from public/
    const [aboutRes, projectRes] = await Promise.all([
      fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/data/about.md`),
      fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/data/projects.json`),
    ]);

    const [aboutRaw, projects] = await Promise.all([
      aboutRes.text(),
      projectRes.json(),
    ]);

    // 2. Create documents
    const docs = [
      new Document({ pageContent: aboutRaw }),
      ...projects.map((p) =>
        new Document({
          pageContent: `${p.title}: ${p.desc}. Tech: ${p.tech.join(", ")}`,
        })
      ),
    ];

    // 3. Split
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300 });
    const splitDocs = await splitter.splitDocuments(docs);

    // 4. Embed
    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, new FakeEmbeddings());
    const retriever = vectorStore.asRetriever();

    // 5. Prompt
    const promptTemplate = ChatPromptTemplate.fromTemplate(
      `Answer the user's question using the context below:\n\n{context}\n\nQuestion: {input}`
    );

    const combineDocsChain = await createStuffDocumentsChain({
      llm: {
        call: async ({ messages }) => ({
          content: `This is a fake response.\nPrompt: "${prompt}"\nDocs used:\n${docs.length} documents.`,
        }),
      },
      prompt: promptTemplate,
    });

    const retrievalChain = await createRetrievalChain({
      retriever,
      combineDocsChain,
    });

    const result = await retrievalChain.invoke({ input: prompt });

    return new Response(result.output);
  } catch (err) {
    console.error("❌ ask.js error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
