import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const AI = () => {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
  if (!input.trim()) return;

  setLoading(true);
  setAnswer("");

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    if (!res.ok || !res.body) {
      throw new Error("Something went wrong");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });

      // ✅ Only stream actual text from chunks
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
      setAnswer(fullText);
    }
  } catch (err) {
    console.error(err);
    setAnswer("Oops! Something went wrong. Try again.");
  } finally {
    setLoading(false);
  }
};


  const initParticles = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white">
      {/* Particle Background */}
      <Particles
        className="absolute inset-0 z-0"
        init={initParticles}
        options={{
          fullScreen: false,
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, distance: 120, opacity: 0.1 },
            move: { enable: true, speed: 0.3 },
            number: { value: 35 },
            opacity: { value: 0.15 },
            size: { value: 1.5 },
          },
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 max-w-2xl mx-auto pt-32">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Ask Me About My Work
        </motion.h2>

        <p className="text-gray-300 text-sm sm:text-base mb-8">
          This is powered by a real AI (Groq + LangChain). Ask me about my
          projects, skills, or tech stack.
        </p>

        <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            <textarea
              rows={1}
              placeholder="e.g., What is LangChain?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              className="flex-1 px-4 py-2 rounded-lg text-black outline-none resize-none overflow-hidden"
            ></textarea>
            <button
              onClick={handleAsk}
              className="bg-black text-white px-6 py-2 rounded-lg hover:scale-105 transition-transform"
            >
              Ask
            </button>
          </div>

          {/* Loading animation */}
          {loading && (
            <motion.div
              className="mt-6 text-gray-300 text-sm italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Typewriter
                words={["Thinking with LLaMA 3...", "Retrieving memory..."]}
                loop={false}
                cursor
                cursorStyle="_"
                typeSpeed={40}
              />
            </motion.div>
          )}

          {/* Response */}
          {answer && !loading && (
            <motion.div
              className="mt-6 bg-gray-100 text-black p-4 rounded-lg whitespace-pre-line text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {answer}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AI;
