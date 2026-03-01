import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

/**
 * Derives a stable image slug from the file path.
 * e.g. "../blog/icccnt-paper.md" → "icccnt-paper"
 */
const slugFromPath = (path) => {
  const filename = path.split("/").pop(); // "icccnt-paper.md"
  return filename.replace(/\.md$/, "");   // "icccnt-paper"
};

/** Supported image extensions tried in order. */
const IMG_EXTS = ["jpg", "jpeg", "png", "webp"];

/** Returns the initial image src for a slug (always starts with jpg). */
const imgSrc = (slug) => `/imgs/${slug}.${IMG_EXTS[0]}`;

/**
 * onError handler that cycles through IMG_EXTS before falling back
 * to the placeholder. Attach data-slug={slug} to the <img> element.
 */
const handleImgError = (e) => {
  const slug = e.target.dataset.slug;
  const idx = parseInt(e.target.dataset.extIdx || "0", 10);
  const next = idx + 1;
  if (next < IMG_EXTS.length) {
    e.target.dataset.extIdx = String(next);
    e.target.src = `/imgs/${slug}.${IMG_EXTS[next]}`;
  } else {
    e.target.src = "/imgs/blog_placeholder.jpg";
    e.target.onerror = null; // stop further retries
  }
};

const parseFrontmatter = (raw) => {
  const titleMatch = raw.match(/title:\s*(.+)/);
  const priorityMatch = raw.match(/priority:\s*(\d+)/);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled";
  const priority = priorityMatch ? parseInt(priorityMatch[1]) : 999;
  const parts = raw.split("---");
  const content = parts.length >= 3 ? parts.slice(2).join("---").trim() : raw.trim();
  return { title, priority, content };
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const carouselRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const particlesInit = useCallback(async (engine) => {
    const { loadSlim } = await import("tsparticles-slim");
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    // ✅ Fix: use { query: "?raw", import: "default" } to bypass vite-plugin-md
    const files = import.meta.glob("../blog/*.md", { query: "?raw", import: "default" });

    const loadPosts = async () => {
      const entries = Object.entries(files);
      const loaded = await Promise.all(
        entries.map(async ([path, loader]) => {
          const raw = await loader();
          const slug = slugFromPath(path);
          const parsed = parseFrontmatter(raw);
          // ✅ image path starts with .jpg; handleImgError will try .jpeg/.png/.webp next
          const image = imgSrc(slug);
          return { ...parsed, image, slug };
        })
      );
      const sorted = loaded.sort((a, b) => a.priority - b.priority);
      setPosts(sorted);
    };

    loadPosts();
  }, []);

  // ✅ Fix: auto-scroll that pauses on hover and resets at end
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || posts.length === 0) return;

    const startScroll = () => {
      scrollIntervalRef.current = setInterval(() => {
        if (!el) return;
        // Reset scroll to start if near end
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 1, behavior: "smooth" });
        }
      }, 40);
    };

    startScroll();

    const pause = () => clearInterval(scrollIntervalRef.current);
    const resume = () => startScroll();

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });

    return () => {
      clearInterval(scrollIntervalRef.current);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
    };
  }, [posts]);

  // Close modal on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedPost(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white">
      <ParticlesBackground id="tsparticles-blog" count={35} speed={0.25} opacity={0.15} />

      {/* ── Carousel ────────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-10">
        <h2 className="text-4xl font-bold text-center mb-6">My Achievements</h2>

        {posts.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">Loading achievements…</p>
        ) : (
          <div
            ref={carouselRef}
            id="blog-carousel"
            className="flex overflow-x-auto gap-6 px-6 py-4 scroll-smooth no-scrollbar"
          >
            {posts.map((post) => (
              <motion.div
                key={post.slug}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedPost(post)}
                className="min-w-[240px] sm:min-w-[300px] bg-white/10 border border-white/20 text-white p-4 rounded-xl shadow-md hover:cursor-pointer hover:bg-white/20 transition-all flex-shrink-0"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  data-slug={post.slug}
                  className="w-full max-h-60 object-contain rounded-md mb-3 mx-auto"
                  onError={handleImgError}
                />
                <h3 className="font-semibold text-lg text-center">{post.title}</h3>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Selected Post Detail ─────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedPost && (
          <motion.section
            key={selectedPost.slug}
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
                data-slug={selectedPost.slug}
                className="w-full max-h-60 object-contain rounded-md mb-3 mx-auto pt-4"
                onError={handleImgError}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold">{selectedPost.title}</h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-500 hover:text-black text-2xl leading-none ml-4 flex-shrink-0"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <p className="whitespace-pre-line text-gray-800 leading-relaxed text-sm max-w-2xl">
                  {selectedPost.content}
                </p>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Scroll to top ─────────────────────────────── */}
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
