import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link, useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import BlogPreview from "../components/BlogPreview";

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("/data/projects.json")
      .then((res) => res.json())
      .then(setProjects)
      .catch((err) => {
        console.error("Failed to load projects on Home:", err);
        setProjects([]);
      });
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="h-screen flex flex-col justify-center items-center text-center px-4 relative bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white">
        <ParticlesBackground id="tsparticles-home" count={40} speed={0.3} opacity={0.2} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 text-center relative"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 tracking-tight">
            Aswin Vishwaa
          </h1>

          <p className="max-w-2xl mx-auto text-gray-300 text-lg sm:text-xl leading-relaxed mb-6">
            Building real-world AI + Web solutions from{" "}
            <span className="text-white font-semibold">Deep Learning</span> to{" "}
            <span className="text-white font-semibold">LLMs</span>,{" "}
            <span className="text-white font-semibold">GCNs</span>, and
            full-stack magic.
            <br />
            <span className="text-gray-400 text-base sm:text-lg italic">
              Crafted with code. Driven by impact.
            </span>
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/ai"
              className="bg-white text-black px-6 py-3 rounded-full font-semibold text-sm transform transition hover:scale-105 hover:shadow-[0_6px_0_rgba(0,0,0,0.2)] hover:translate-y-[-2px]"
            >
              🔍 AI Showcase
            </Link>
            <ScrollLink
              to="projects"
              smooth={true}
              duration={500}
              offset={-70}
              className="bg-transparent border border-white px-6 py-3 rounded-full font-semibold text-sm text-white transform transition hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_6px_0_rgba(255,255,255,0.2)] hover:translate-y-[-2px] cursor-pointer"
            >
              📂 Projects
            </ScrollLink>
          </div>
        </motion.div>
      </section>

      {/* ── Featured Projects ──────────────────────────────── */}
      <section id="projects" className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Projects
        </h2>

        {projects.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">Loading projects…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {projects.slice(0, 2).map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                viewport={{ once: true }}
                onClick={() => navigate("/projects")}
                className="bg-white rounded-lg p-6 shadow-md border hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-700 mb-3">{project.desc}</p>
                <div className="flex flex-wrap gap-2 text-sm text-white">
                  {project.tech.map((t) => (
                    <span key={t} className="bg-black px-2 py-1 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Explore Projects Button ── */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link
            to="/projects"
            className="group relative inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold text-sm border border-black
              transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:scale-105 hover:translate-y-[-2px]"
          >
            <span>Explore All Projects</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-black text-white">
        <h2 className="text-2xl font-bold text-center mb-12">
          Tech I Work With
        </h2>

        {[
          {
            icon: "🧠",
            label: "AI / Machine Learning",
            items: ["Python", "TensorFlow", "Scikit-learn", "Pytorch", "YOLOv9", "UNet", "LangChain", "RAG", "Groq", "HuggingFace", "NLP"],
          },
          {
            icon: "💻",
            label: "Web Development",
            items: ["React", "Angular", "Node.js", "Flask", "MongoDB", "Bootstrap", "HTML", "CSS", "Vite", "Tailwind CSS"],
          },
          {
            icon: "📊",
            label: "Data & Big Data",
            items: ["PySpark", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
          },
          {
            icon: "🔍",
            label: "Automation & APIs",
            items: ["BeautifulSoup", "Requests", "Multithreading", "Twilio", "Gmail API", "TMDB API"],
          },
          {
            icon: "🔧",
            label: "Tools & Deployment",
            items: ["Git", "GitHub", "Render", "Vercel"],
          },
        ].map((group) => (
          <div key={group.label} className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-center">
              {group.icon} {group.label}
            </h3>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {group.items.map((tech, i) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white text-black px-4 py-2 rounded-full shadow-sm hover:bg-gray-200 hover:scale-105 transition duration-300"
                >
                  {tech}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Blog Preview ───────────────────────────────────── */}
      <BlogPreview />
    </div>
  );
};

export default Home;
