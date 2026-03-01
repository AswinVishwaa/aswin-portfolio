import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import ParticlesBackground from "../components/ParticlesBackground";

// ─── Simple inline markdown renderer ───────────────────────
// Handles: **bold**, `code`, bullet lists, numbered lists, line breaks
const renderMarkdown = (text) => {
  if (!text) return null;

  // Split into lines for list handling
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bullet list item
    if (/^[-*•]\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[-*•]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-none space-y-1.5 my-2">
          {listItems.map((item, j) => (
            <li key={j} className="flex gap-2 items-start">
              <span className="text-indigo-400 mt-0.5 flex-shrink-0">▸</span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list item
    if (/^\d+\.\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-2">
          {listItems.map((item, j) => (
            <li key={j} className="flex gap-2 items-start">
              <span className="text-indigo-400 font-mono text-xs mt-1 flex-shrink-0 w-4">
                {j + 1}.
              </span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line → spacer
    if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Normal paragraph line
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
};

// Format inline: **bold**, *italic*, `code`
const inlineFormat = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic text-gray-300">{part.slice(1, -1)}</em>;
    return part;
  });
};

// ─── Suggested questions ────────────────────────────────────
const SUGGESTIONS = [
  "What projects has Aswin built?",
  "What AI skills does Aswin have?",
  "Tell me about Aswin's tech stack",
  "What is Aswin's experience with LLMs?",
];

// ─── Component ──────────────────────────────────────────────
const AI = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // { role: "user"|"ai", text: string }
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  const handleAsk = async (promptOverride) => {
    const prompt = (promptOverride || input).trim();
    if (!prompt || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    // Add a placeholder AI message that we'll stream into
    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });

        const clean = chunk
          .split("data:")
          .filter((line) => line && !line.includes("[DONE]"))
          .map((line) => {
            try {
              const parsed = JSON.parse(line.trim());
              return parsed.choices?.[0]?.delta?.content || "";
            } catch {
              return "";
            }
          })
          .join("");

        fullText += clean;

        // Live-update the last AI message while streaming
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", text: fullText };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          text: "Oops! Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1a1a2e] text-white flex flex-col">
      <ParticlesBackground id="tsparticles-ai" count={30} speed={0.2} opacity={0.12} />

      {/* ── Header ── */}
      <div className="relative z-10 text-center pt-28 pb-6 px-4">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Ask Me Anything
        </motion.h1>
        <motion.p
          className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Powered by{" "}
          <span className="text-indigo-400 font-medium">Groq LLaMA 3.3</span> +{" "}
          <span className="text-indigo-400 font-medium">Local RAG Embeddings</span>.
          Ask about my projects, skills, or tech stack.
        </motion.p>
      </div>

      {/* ── Suggestions (only before first message) ── */}
      <AnimatePresence>
        {messages.length === 0 && !loading && (
          <motion.div
            className="relative z-10 flex flex-wrap justify-center gap-2 px-4 pb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleAsk(s)}
                className="text-xs bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-full
                  hover:bg-indigo-500/20 hover:border-indigo-400/50 hover:text-white transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat History ── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4 max-w-3xl w-full mx-auto space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-1">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md
                  ${msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-white/8 backdrop-blur-sm border border-white/10 text-gray-100 rounded-tl-sm"
                  }`}
              >
                {msg.role === "ai" ? (
                  msg.text ? (
                    <div className="space-y-1">{renderMarkdown(msg.text)}</div>
                  ) : (
                    /* Typing dots while streaming starts */
                    <div className="flex gap-1 items-center h-5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400 block"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  msg.text
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0 mt-1">
                  You
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading status line */}
        {loading && (
          <motion.p
            className="text-center text-indigo-400 text-xs italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Typewriter
              words={["Thinking with LLaMA 3.3…", "Retrieving memory…", "Crafting response…"]}
              loop={false}
              cursor
              cursorStyle="_"
              typeSpeed={40}
            />
          </motion.p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ── */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 pb-8 pt-2">
        <div className="flex gap-3 items-end bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask about my projects, skills, or experience…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-grow
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none resize-none
              leading-relaxed min-h-[36px] max-h-[120px] overflow-y-auto"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
              text-white px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200
              hover:scale-105 active:scale-95"
          >
            {loading ? "…" : "Send"}
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">
          Press <kbd className="bg-white/10 px-1 rounded text-gray-400">Enter</kbd> to send ·{" "}
          <kbd className="bg-white/10 px-1 rounded text-gray-400">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};

export default AI;
