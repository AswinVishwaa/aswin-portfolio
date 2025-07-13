import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link, useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import projects from "../data/projects.json";

const BlogPreview = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const files = import.meta.glob("../blog/*.md", { as: "raw" });
    const loadPosts = async () => {
      const entries = Object.entries(files);
      const loaded = await Promise.all(
        entries.map(async ([path, loader]) => {
          const raw = await loader();

          const titleMatch = raw.match(/title:\s*(.+)/);
          const priorityMatch = raw.match(/priority:\s*(\d+)/);

          const title = titleMatch ? titleMatch[1].trim() : "Untitled";
          const priority = priorityMatch ? parseInt(priorityMatch[1]) : 999; // fallback priority
          const content = raw.split("---").pop().trim();

          return { title, content, priority };
        })
      );

      // Sort by ascending priority (1 is highest)
      const sorted = loaded.sort((a, b) => a.priority - b.priority);

      // Show top 2 priority items
      setPosts(sorted.slice(0, 2));
    };

    loadPosts();
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelected(null);
    };

    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <section className="py-16 px-4 max-w-4xl mx-auto relative z-10">
      <h2 className="text-2xl font-bold text-center mb-6">Latest Posts</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            onClick={() => setSelected(post)}
            className="bg-white text-black p-6 rounded-lg shadow-md border 
              hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
            <p className="text-gray-700 text-sm line-clamp-3">
              {post.content.slice(0, 200)}...
            </p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[99]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />

            <motion.div
              className={`fixed bg-white text-black z-[100] p-6 shadow-xl 
                ${
                  isMobile
                    ? "left-0 right-0 bottom-0 top-[20%] sm:top-[15%] rounded-t-2xl"
                    : "top-1/2 left-1/2 w-[90%] sm:w-[600px] transform -translate-x-1/2 -translate-y-1/2 rounded-lg"
                }
                overflow-y-auto max-h-[85vh]`}
              initial={
                isMobile
                  ? { y: "100%", opacity: 0 }
                  : { y: -20, scale: 0.96, opacity: 0 }
              }
              animate={
                isMobile ? { y: 0, opacity: 1 } : { y: 0, scale: 1, opacity: 1 }
              }
              exit={
                isMobile
                  ? { y: "100%", opacity: 0 }
                  : { y: -20, scale: 0.96, opacity: 0 }
              }
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: "transform, opacity" }}
            >
              {isMobile && (
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
              )}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selected.title}</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/blog")}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    See All
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-600 hover:text-black text-xl"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="text-gray-800 whitespace-pre-line text-sm leading-relaxed pb-10">
                {selected.content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

const Home = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden">
      <section className="h-screen flex flex-col justify-center items-center text-center px-4 relative bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white">
        <Particles
          className="absolute inset-0 z-0"
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: false,
            background: { color: "transparent" },
            particles: {
              color: { value: "#ffffff" },
              links: {
                enable: true,
                distance: 130,
                color: "#ffffff",
                opacity: 0.2,
              },
              move: { enable: true, speed: 0.3 },
              number: { value: 40 },
              opacity: { value: 0.2 },
              size: { value: 1.5 },
            },
          }}
        />
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

      <section id="projects" className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Projects
        </h2>
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
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-black text-white">
        <h2 className="text-2xl font-bold text-center mb-12">
          Tech I Work With
        </h2>

        {/* 🧠 AI / ML */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-center">
            🧠 AI / Machine Learning
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              "Python",
              "TensorFlow",
              "Scikit-learn",
              "Pytorch",
              "YOLOv9",
              "UNet",
              "LangChain",
              "RAG",
              "Groq",
              "HuggingFace",
              "NLP",
            ].map((tech, i) => (
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

        {/* 💻 Web Development */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-center">
            💻 Web Development
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              "React",
              "Angular",
              "Node.js",
              "Flask",
              "MongoDB",
              "Bootstrap",
              "HTML",
              "CSS",
              "Vite",
              "Tailwind CSS",
            ].map((tech, i) => (
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

        {/* 📊 Data & Big Data */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-center">
            📊 Data & Big Data
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {["PySpark", "Pandas", "NumPy", "Matplotlib", "Seaborn"].map(
              (tech, i) => (
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
              )
            )}
          </div>
        </div>

        {/* 🔍 Automation & APIs */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-center">
            🔍 Automation & APIs
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              "BeautifulSoup",
              "Requests",
              "Multithreading",
              "Twilio",
              "Gmail API",
              "TMDB API",
            ].map((tech, i) => (
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

        {/* 🔧 Tools & Deployment */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-center">
            🔧 Tools & Deployment
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {["Git", "GitHub", "Render", "Vercel"].map((tech, i) => (
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
      </section>

      <BlogPreview />
    </div>
  );
};

export default Home;
