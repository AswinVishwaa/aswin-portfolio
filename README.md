# Aswin Vishwaa — AI-Powered Portfolio 🚀

A personal portfolio showcasing projects, experience, and a live AI assistant — built with **React (Vite)**, **Framer Motion**, **Tailwind CSS**, and a custom **RAG (Retrieval-Augmented Generation)** backend using **Groq LLaMA 3.3** and local embeddings.

🔗 **Live:** [aswin-portfolio-one.vercel.app](https://aswin-portfolio-one.vercel.app)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🧠 **AI Assistant** | Chat with an LLM that knows my full portfolio — projects, experience, awards |
| 📡 **Live streaming** | AI response streamed token-by-token via Server-Sent Events |
| 🏆 **Achievements podium** | Blog page with gold/silver/bronze podium layout + split-view modal |
| 📈 **Experience timeline** | Git-graph style interactive career timeline |
| 📊 **About stats** | Animated skill progress bars + stats (₹10L grant, 2.5+ yrs, 4+ awards) |
| 🎨 **Dark glassmorphism UI** | Framer Motion animations, particle backgrounds, responsive layout |
| 📱 **Mobile responsive** | Hamburger nav, touch-friendly interactions |
| 🔒 **Rate limiting** | 10 requests/IP/min on the AI API endpoint |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Tailwind CSS, Framer Motion, React Router |
| **AI Backend** | Vercel Serverless Function (Node.js), Groq API (LLaMA 3.3-70B) |
| **RAG Pipeline** | `@xenova/transformers` (MiniLM embeddings), cosine similarity, `api/data/docs.json` |
| **Local Dev** | Express server (`server.js`) + Vite proxy for API — no Vercel CLI needed |
| **Hosting** | Vercel (SPA rewrites + serverless functions) |

---

## 📁 Project Structure

```
aswin-portfolio/
├── api/
│   ├── ask.js              # Serverless AI handler (RAG + Groq streaming)
│   └── data/
│       └── docs.json       # ⭐ RAG knowledge base (projects, experience, awards)
├── public/
│   ├── data/
│   │   ├── projects.json   # Project cards data
│   │   └── about.md        # About page bio
│   └── imgs/               # Blog post images
├── src/
│   ├── blog/               # Markdown blog/achievement posts
│   │   ├── titan-dic.md    # ₹10L Titan Nest grant
│   │   ├── startup-mania.md# ₹30K 1st prize
│   │   └── icccnt-paper.md # IEEE research paper
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── BlogPreview.jsx
│   │   └── ParticlesBackground.jsx
│   └── pages/
│       ├── Home.jsx
│       ├── About.jsx       # Stats + skill bars
│       ├── Projects.jsx
│       ├── Experience.jsx  # Git-graph timeline
│       ├── Blog.jsx        # Podium layout + split modal
│       └── AI.jsx          # Chat interface
├── server.js               # Local Express dev server for API
├── vercel.json             # SPA rewrites + function config
└── .env                    # GROQ_API_KEY (local dev only)
```

---

## 🧠 AI Assistant — How It Works

```
User prompt
    ↓
Embed with Xenova/all-MiniLM-L6-v2
    ↓
Cosine similarity search over api/data/docs.json
    ↓
Top 3 relevant context docs retrieved
    ↓
Groq LLaMA 3.3-70B generates response (streamed)
    ↓
Live stream displayed in chat bubble UI
```

**To update what the AI knows:** Edit `api/data/docs.json` — add or update knowledge entries. The file is reloaded on every request in dev mode automatically (no restart needed).

---

## 🔑 Environment Variables

### Local Development (`.env` file)
```env
GROQ_API_KEY=your_groq_api_key_here
```

### Vercel Production
Set in **Vercel Dashboard → Project → Settings → Environment Variables:**
```
GROQ_API_KEY = your_groq_api_key_here
```

> ⚠️ The `.env` file is git-ignored. Never commit API keys.

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Option 1: Start everything (Vite frontend + Express API server)
npm run dev:all

# Option 2: Start separately
npm run dev        # Vite frontend on :5173
npm run dev:api    # Express API server on :3001
```

The Vite proxy forwards `/api/*` requests to `localhost:3001` automatically.

---

## 📦 Deployment

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com) (auto-detects Vite)
3. Set `GROQ_API_KEY` in Vercel Environment Variables
4. Deploy — done ✅

The `vercel.json` uses `rewrites` (not legacy `routes`) to properly serve static assets while enabling SPA client-side routing.

---

## 📝 Blog Posts / Achievements

Blog posts live in `src/blog/*.md` as markdown files with frontmatter:

```markdown
---
title: 🏆 Title of Achievement
date: 2025-10-16
priority: 1        # 1 = gold podium (top), 2 = silver, 3 = bronze
---

Content here...
```

Blog images go in `public/imgs/` named `<slug>.jpg` (slug = filename without `.md`).
Supports: `.jpg`, `.jpeg`, `.png`, `.webp` — with automatic fallback.

---

## 🙏 Credits

- [Xenova/transformers.js](https://huggingface.co/Xenova) — in-browser/Node.js embeddings
- [Groq API](https://console.groq.com/) — LLaMA 3.3-70B inference
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Lucide React](https://lucide.dev/) — icons
- [tsParticles](https://particles.tsparticles.com/) — particle backgrounds