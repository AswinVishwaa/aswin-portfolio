import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    const files = import.meta.glob("../blog/*.md", { as: "raw" });
    const loadPosts = async () => {
      const entries = Object.entries(files);
      const loaded = await Promise.all(
        entries.map(async ([path, loader], index) => {
          const raw = await loader();

          const titleMatch = raw.match(/title:\s*(.+)/);
          const priorityMatch = raw.match(/priority:\s*(\d+)/);

          const title = titleMatch ? titleMatch[1].trim() : "Untitled";
          const priority = priorityMatch ? parseInt(priorityMatch[1]) : 999; // default low priority
          const content = raw.split("---").pop().trim();
          const image = `/imgs/blog${index + 1}.jpg`;

          return { title, content, image, priority };
        })
      );
      const sorted = loaded.sort((a, b) => a.priority - b.priority);
      setPosts(sorted);
    };

    loadPosts();
  }, []);

  // auto-scroll
  useEffect(() => {
    const el = document.getElementById("blog-carousel");
    if (!el) return;
    const interval = setInterval(() => {
      el.scrollBy({ left: 1, behavior: "smooth" });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white">
      {/* Particles */}
      <Particles
        className="absolute inset-0 z-0"
        init={particlesInit}
        options={{
          fullScreen: false,
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, distance: 120, opacity: 0.1 },
            move: { enable: true, speed: 0.25 },
            number: { value: 35 },
            opacity: { value: 0.15 },
            size: { value: 1.5 },
          },
        }}
      />

      {/* Top Carousel */}
      <section className="relative z-10 pt-24 pb-10">
        <h2 className="text-4xl font-bold text-center mb-6">My Achievements</h2>
        <div
          id="blog-carousel"
          className="flex overflow-x-auto gap-6 px-6 py-4 scroll-smooth no-scrollbar"
        >
          {posts.map((post, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedPost(post)}
              className="min-w-[240px] sm:min-w-[300px] bg-white/10 border border-white/20 text-white p-4 rounded-xl shadow-md hover:cursor-pointer hover:bg-white/20 transition-all"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full max-h-60 object-contain rounded-md mb-3 mx-auto"
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.src = "/imgs/blog_placeholder.jpg";
                    e.target.dataset.fallback = "true";
                  }
                }}
              />
              <h3 className="font-semibold text-lg text-center">
                {post.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Detailed View of Selected Blog */}
      <AnimatePresence mode="wait">
        {selectedPost && (
          <motion.section
            key={selectedPost.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 px-6 max-w-4xl mx-auto pb-32"
          >
            <motion.div
              className="bg-white text-black rounded-xl shadow-lg overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full max-h-60 object-contain rounded-md mb-3 mx-auto"
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.src = "/imgs/blog_placeholder.jpg";
                    e.target.dataset.fallback = "true";
                  }
                }}
              />
              <div className="p-6 text-center">
                <div className="flex justify-center items-center mb-4">
                  <h3 className="text-2xl font-bold mb-2 text-center">
                    {selectedPost.title}
                  </h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="absolute right-6 text-gray-600 hover:text-black text-xl"
                  >
                    &times;
                  </button>
                </div>
                <p className="whitespace-pre-line text-gray-800 leading-relaxed text-sm max-w-2xl mx-auto justify-center">
                  {selectedPost.content}
                </p>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
      {selectedPost && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 right-6 z-[999] bg-white text-black px-4 py-2 rounded-full shadow hover:scale-105 transition-all"
        >
          ↑ Back to Top
        </motion.button>
      )}
    </div>
  );
};

export default Blog;
