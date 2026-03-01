import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

const STATS = [
  { value: "₹10L", label: "Grant Funding Won", icon: "🏆" },
  { value: "2+", label: "Years Building AI", icon: "🧠" },
  { value: "4+", label: "Awards & Prizes", icon: "🥇" },
  { value: "1", label: "IEEE Publication", icon: "📄" },
];

const SKILLS = [
  { category: "Deep Learning & CV", level: 92, items: ["3D UNet", "YOLOv9", "MONAI", "PyTorch", "TensorFlow"] },
  { category: "LLMs & RAG", level: 88, items: ["Groq", "LangChain", "FAISS", "BM25", "MedGemma", "Llama-3"] },
  { category: "Backend & APIs", level: 85, items: ["FastAPI", "Node.js", "Flask", "PostgreSQL", "REST"] },
  { category: "Frontend", level: 78, items: ["React", "Vite", "Tailwind", "Angular", "Framer Motion"] },
  { category: "Systems & DevOps", level: 72, items: ["C#/.NET", "MSI", "Wazuh", "Git", "Docker", "Vercel"] },
  { category: "Data & Analytics", level: 80, items: ["PySpark", "Pandas", "Mixpanel", "Matplotlib", "Seaborn"] },
];

const About = () => {
  const [aboutText, setAboutText] = useState("");

  useEffect(() => {
    fetch("/data/about.md")
      .then((res) => res.text())
      .then(setAboutText)
      .catch(console.error);
  }, []);

  return (
    <div className="overflow-x-hidden bg-white">

      {/* ── Dark hero ────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex flex-col justify-center items-center text-center px-4
        bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white">
        <ParticlesBackground id="tsparticles-about" count={40} speed={0.3} opacity={0.18} />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-3 font-mono">
            Aswin Vishwaa · AI/ML Engineer
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">About Me</h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            I build AI systems that go from research to real-world impact — medical imaging pipelines,
            LLM-powered tools, and production backend infrastructure.
          </p>
        </motion.div>
      </section>

      {/* ── Stats bar ────────────────────────────────── */}
      <section className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-gray-400 text-xs mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bio as structured bullet points ────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-black mb-8 text-center">The Full Story</h2>
        <div className="space-y-5 text-sm sm:text-base">
          {[
            { bold: "Current role:", text: "Software Engineer at Dobbe AI (Aug 2025–present) — building backend systems, event logging, analytics pipelines, and a C#/.NET medical imaging agent across 7+ months." },
            { bold: "Freelancing:", text: "Building an end-to-end AI Brain Tumor Radiotherapy Planning Pipeline — 3D UNet (Dice WT=0.929) + MedGemma 1.5 + LangChain RAG + GPU-accelerated GTV/CTV/PTV contouring on dual Tesla T4s." },
            { bold: "Biggest win:", text: "Won ₹10 Lakh grant from Titan Nest / IIM Calcutta and ₹30K cash prize at Startup Mania 9.0 for the Glaucoma Detection AI (UNet + YOLOv9)." },
            { bold: "Published researcher:", text: "Research paper published at ICCCNT 2025 (IEEE, IIT Indore) covering Glaucoma Detection methodology and clinical validation." },
            { bold: "What I build:", text: "Medical AI pipelines, LLM-powered tools, production backend infrastructure, and full-stack web apps. I bridge deep research with real-world product impact." },
            { bold: "How I work:", text: "Speed-first, proof-of-concept driven. I jump into new tech under pressure and deliver — Docker, FastAPI, C#/.NET, binary parsing — all learned on the job." },
            { bold: "Education:", text: "Pursuing B.Tech in AI/ML Engineering, actively building real-world systems in parallel with academics." },
          ].map(({ bold, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="flex gap-3 items-start"
            >
              <span className="text-black mt-1.5 flex-shrink-0">▸</span>
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-black font-semibold">{bold}</strong>{" "}{text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Skills with progress bars ─────────────────── */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Where I Rock It 🎸</h2>
          <div className="space-y-8">
            {SKILLS.map((skill, i) => (
              <motion.div
                key={skill.category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">{skill.category}</span>
                  <span className="text-gray-400 text-xs font-mono">{skill.level}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
                    viewport={{ once: true }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skill.items.map((item) => (
                    <span
                      key={item}
                      className="text-[10px] bg-white/8 border border-white/10 text-gray-300
                        px-2 py-0.5 rounded-full font-mono"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Current focus ────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-black mb-8 text-center">Currently Working On 🚀</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: "🏥", title: "Dobbe AI — FastAPI Backend", desc: "Refactoring medical imaging backend for lower latency AI output storage and better data architecture." },
            { icon: "🧬", title: "Brain Tumor RT Pipeline", desc: "Finalising the end-to-end GBM radiotherapy planning system with dual-protocol contour validation." },
            { icon: "🎓", title: "B.Tech AI/ML", desc: "Pursuing a degree in AI/ML Engineering while building real-world systems in parallel." },
            { icon: "📝", title: "More Research", desc: "Looking to publish further work on multi-modal medical AI at top venues after ICCCNT 2025." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-400 transition-all"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-black text-sm mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
