import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

// ─── Helpers ────────────────────────────────────────────────
const slugFromPath = (path) => path.split("/").pop().replace(/\.md$/, "");

const IMG_EXTS = ["jpg", "jpeg", "png", "webp"];
const imgSrc = (slug) => `/imgs/${slug}.${IMG_EXTS[0]}`;

const handleImgError = (e) => {
  const slug = e.target.dataset.slug;
  const idx = parseInt(e.target.dataset.extIdx || "0", 10);
  const next = idx + 1;
  if (next < IMG_EXTS.length) {
    e.target.dataset.extIdx = String(next);
    e.target.src = `/imgs/${slug}.${IMG_EXTS[next]}`;
  } else {
    e.target.src = "/imgs/blog_placeholder.jpg";
    e.target.onerror = null;
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

// Line-by-line renderer for the content emoji bullets
const renderContent = (text) =>
  text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p key={i} className="flex gap-2 items-start leading-relaxed text-sm text-gray-700">
        {line}
      </p>
    );
  });

// ─── Main Component ─────────────────────────────────────────
const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const carouselRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // Load markdown posts
  useEffect(() => {
    const files = import.meta.glob("../blog/*.md", { query: "?raw", import: "default" });
    const load = async () => {
      const entries = Object.entries(files);
      const loaded = await Promise.all(
        entries.map(async ([path, loader]) => {
          const raw = await loader();
          const slug = slugFromPath(path);
          return { ...parseFrontmatter(raw), image: imgSrc(slug), slug };
        })
      );
      setPosts(loaded.sort((a, b) => a.priority - b.priority));
    };
    load();
  }, []);

  // Auto-scroll carousel — pauses on hover/touch
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || posts.length === 0) return;

    const start = () => {
      scrollIntervalRef.current = setInterval(() => {
        if (!el) return;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 1, behavior: "smooth" });
        }
      }, 30);
    };

    start();
    const pause = () => clearInterval(scrollIntervalRef.current);
    const resume = () => start();

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);

    return () => {
      clearInterval(scrollIntervalRef.current);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [posts]);

  // Escape to close modal + body scroll lock
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelectedPost(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = selectedPost ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedPost]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#111118] to-[#0f0f0f] text-white">
      <ParticlesBackground id="tsparticles-blog" count={30} speed={0.2} opacity={0.12} />

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="relative z-10 text-center pt-28 pb-8 px-4">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Achievements &amp; Milestones
        </motion.h1>
        <motion.p
          className="text-gray-400 text-sm sm:text-base max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          A journey through competitions, research, and real-world impact.
        </motion.p>
      </div>

      {/* ── Horizontal Scroll Carousel ───────────────────── */}
      <section className="relative z-10 pb-4">
        {posts.length === 0 ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto no-scrollbar px-6 sm:px-12 py-4 cursor-grab active:cursor-grabbing"
            >
              {posts.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  onClick={() => { setSelectedPost(post); setActiveIdx(i); }}
                  className="flex-shrink-0 w-[260px] sm:w-[300px] bg-white/5 border border-white/10
                    rounded-2xl overflow-hidden cursor-pointer group
                    hover:border-white/30 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(255,255,255,0.06)]
                    transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-black/30 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      data-slug={post.slug}
                      onError={handleImgError}
                      className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Card text */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {post.content.slice(0, 90)}…
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-white/50 group-hover:text-white/80 transition-colors">
                      Read more →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-2 pb-2">
              {posts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = carouselRef.current;
                    if (!el) return;
                    const card = el.children[i];
                    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    setActiveIdx(i);
                  }}
                  className={`rounded-full transition-all duration-300 ${i === activeIdx
                      ? "w-5 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
                    }`}
                  aria-label={`Go to achievement ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Grid View (all posts below carousel) ─────────── */}
      {posts.length > 0 && (
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-xl font-semibold text-white/60 mb-6 tracking-wide uppercase text-xs">
            All Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                onClick={() => setSelectedPost(post)}
                className="group relative bg-white/4 border border-white/8 rounded-xl p-5 cursor-pointer
                  hover:bg-white/8 hover:border-white/20 hover:shadow-[0_4px_24px_rgba(255,255,255,0.04)]
                  transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/8 border border-white/10 flex-shrink-0
                    overflow-hidden flex items-center justify-center">
                    <img
                      src={post.image}
                      alt=""
                      data-slug={post.slug}
                      onError={handleImgError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm text-white leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {post.content.slice(0, 80)}…
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/50 transition-colors text-sm">
                  →
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Modal Detail View ────────────────────────────── */}
      <AnimatePresence>
        {selectedPost && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[98] bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
            />

            {/* Modal panel */}
            <motion.div
              className="fixed z-[99] inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2
                sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[560px] sm:max-h-[80vh]
                bg-[#111] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl
                overflow-hidden flex flex-col"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Hero image */}
              <div className="relative h-48 bg-black/40 flex-shrink-0">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  data-slug={selectedPost.slug}
                  onError={handleImgError}
                  className="w-full h-full object-contain p-6"
                />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#111] to-transparent" />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 pt-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white leading-snug pr-4">
                    {selectedPost.title}
                  </h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-white/40 hover:text-white text-xl flex-shrink-0 mt-0.5 transition-colors"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1.5 text-gray-300">
                  {renderContent(selectedPost.content)}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blog;
