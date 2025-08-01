# Aswin's AI-Powered Portfolio 🚀

A personal portfolio website showcasing my projects, resume, and an AI assistant that answers queries based on my content. Built using **React**, **Tailwind CSS**, and **Transformers.js**, and deployed on **Vercel**.

---

## ✨ Features

- 🧠 **AI Assistant** using [Groq's LLaMA 3 model](https://console.groq.com/)
- ⚡ Fast and lightweight UI with Tailwind CSS
- 📱 Responsive design with a **mobile navbar toggle**
- 📝 Embedded document search using cosine similarity
- 🚀 Deployed on Vercel with serverless functions

---

## 🛠️ Tech Stack

| Frontend       | Backend/API        | AI/ML                | Hosting       |
|----------------|--------------------|----------------------|----------------|
| React (Vite)   | Node.js (Vercel API)| transformers.js (Xenova) | Vercel        |
| Tailwind CSS   | JSON server (optional for mock data) | Groq API (LLaMA 3) |        |

---

## 🔧 Project Structure

```
aswin_port/
├── public/
│   └── Aswin_Startup_resume.pdf
├── src/
│   ├── components/        # Navbar, pages, etc.
│   ├── App.jsx
│   └── main.jsx
├── api/
│   ├── ask.js             # Serverless API handler
│   └── data/
│       └── docs.json      # Your embedded content
├── index.html
└── README.md
```

---

## 🧠 AI Assistant Setup

The AI assistant uses a technique similar to Retrieval-Augmented Generation (RAG):

1. Embeds user prompt and documents using `Xenova/all-MiniLM-L6-v2`
2. Finds top-matching context using cosine similarity
3. Sends both prompt + context to Groq's `llama3-8b-8192` model
4. Streams the output back to the client

---

## 🔑 Environment Variables (Vercel)

Make sure these are set in your Vercel project settings:

```
GROQ_API_KEY=<your_groq_api_key>
VERCEL_URL=<your_vercel_project_url>  # e.g., aswin-ai.vercel.app
```

---

## 📱 Mobile Navbar

- Uses a responsive hamburger menu with toggle state.
- Integrated with `lucide-react` icons.
- Automatically closes on navigation.

---

## 📦 Deployment

1. Push to GitHub
2. Import to Vercel (auto-detects Vite/React)
3. Set environment variables
4. Done 🎉

---

## 🧪 Development

```bash
npm install
npm run dev
```

---

## 🙏 Credits

- [Xenova/transformers.js](https://huggingface.co/Xenova)
- [Groq API](https://console.groq.com/)
- [Lucide React](https://lucide.dev/)