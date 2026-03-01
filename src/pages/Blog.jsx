import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import ParticlesBackground from "../components/ParticlesBackground";

// ─── Helpers ────────────────────────────────────────────────
const slugFromPath = (p) => p.split("/").pop().replace(/\.md$/, "");
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
  const title = (raw.match(/title:\s*(.+)/) || [])[1]?.trim() || "Untitled";
  const priority = parseInt((raw.match(/priority:\s*(\d+)/) || [])[1] || "999");
  const parts = raw.split("---");
  const content = parts.length >= 3 ? parts.slice(2).join("---").trim() : raw.trim();
  return { title, priority, content };
};
const renderContent = (text) =>
  text.split("\n").map((line, i) =>
    line.trim() ? (
      <p key={i} className="leading-relaxed text-sm text-gray-700">{line}</p>
    ) : (
      <div key={i} className="h-2" />
    )
  );

// ─── Split Modal (Portal) ────────────────────────────────────
// Renders into document.body to escape any ancestor transform stacking context
const SplitModal = ({ post, onClose }) => {
  if (!post) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="split-backdrop"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key="split-modal"
          className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row
            w-full max-w-3xl max-h-[85vh]"
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left — image panel */}
          <div className="sm:w-[40%] flex-shrink-0 bg-gray-50 flex items-center justify-center
            p-8 border-b sm:border-b-0 sm:border-r border-gray-100 min-h-[200px]">
            <img
              src={post.image}
              alt={post.title}
              data-slug={post.slug}
              onError={handleImgError}
              className="max-w-full max-h-[220px] sm:max-h-[320px] object-contain rounded-lg"
            />
          </div>

          {/* Right — detail panel */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col">
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center
                  justify-center text-gray-500 hover:text-black transition-colors text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <h2 className="text-2xl font-bold text-black mb-4 leading-tight">
              {post.title}
            </h2>

            <div className="space-y-1.5 flex-1">
              {renderContent(post.content)}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// ─── Podium Card ─────────────────────────────────────────────
const PodiumCard = ({ post, rank, onClick, className = "" }) => {
  const ringColor = rank === 1
    ? "border-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.25)]"
    : rank === 2
      ? "border-gray-300 shadow-[0_0_16px_rgba(200,200,200,0.15)]"
      : "border-orange-400/60 shadow-[0_0_16px_rgba(251,146,60,0.15)]";

  const badge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.12, duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.03 }}
      onClick={onClick}
      className={`relative bg-white/6 border-2 ${ringColor} rounded-2xl overflow-hidden
        cursor-pointer backdrop-blur-sm transition-all duration-300
        hover:bg-white/12 group ${className}`}
    >
      {/* Badge */}
      <div className="absolute top-3 left-3 z-10 text-xl leading-none">{badge}</div>

      {/* Image */}
      <div className="relative h-36 sm:h-44 bg-black/20 flex items-center justify-center overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          data-slug={post.slug}
          onError={handleImgError}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Text */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-400 text-xs mt-1.5 line-clamp-2">{post.content.slice(0, 70)}…</p>
        <span className="mt-3 inline-block text-xs text-white/40 group-hover:text-white/70 transition-colors">
          View details →
        </span>
      </div>
    </motion.div>
  );
};

// ─── Main ────────────────────────────────────────────────────
const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const files = import.meta.glob("../blog/*.md", { query: "?raw", import: "default" });
    Promise.all(
      Object.entries(files).map(async ([path, loader]) => {
        const raw = await loader();
        const slug = slugFromPath(path);
        return { ...parseFrontmatter(raw), image: imgSrc(slug), slug };
      })
    ).then((loaded) => setPosts(loaded.sort((a, b) => a.priority - b.priority)));
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  // Top 3 for podium, rest for grid
  const podium = posts.slice(0, 3);    // [1st, 2nd, 3rd]
  const rest = posts.slice(3);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#111118] to-[#0f0f0f] text-white">
      <ParticlesBackground id="tsparticles-blog" count={28} speed={0.2} opacity={0.1} />

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

      {/* ── Podium Stage ─────────────────────────────────── */}
      {posts.length > 0 && (
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-10">

          {/* 1st place — centre top, larger card */}
          {podium[0] && (
            <div className="flex justify-center mb-5">
              <PodiumCard
                post={podium[0]}
                rank={1}
                onClick={() => setSelected(podium[0])}
                className="w-full sm:w-[340px]"
              />
            </div>
          )}

          {/* 2nd (left) and 3rd (right) — slightly lower */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:px-12 mt-2">
            {podium[1] && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="translate-y-3 sm:translate-y-4"
              >
                <PodiumCard
                  post={podium[1]}
                  rank={2}
                  onClick={() => setSelected(podium[1])}
                />
              </motion.div>
            )}
            {podium[2] && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="translate-y-6 sm:translate-y-8"
              >
                <PodiumCard
                  post={podium[2]}
                  rank={3}
                  onClick={() => setSelected(podium[2])}
                />
              </motion.div>
            )}
          </div>

          {/* Podium base bar */}
          <div className="mt-10 sm:mt-14 mx-4 sm:mx-12 h-1 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </section>
      )}

      {/* ── All Achievements Grid ─────────────────────────── */}
      {posts.length > 0 && (
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
            All Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                onClick={() => setSelected(post)}
                className="group flex items-start gap-3 bg-white/4 border border-white/8 rounded-xl p-4
                  cursor-pointer hover:bg-white/8 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-black/30 border border-white/10 flex-shrink-0 overflow-hidden">
                  <img
                    src={post.image}
                    alt=""
                    data-slug={post.slug}
                    onError={handleImgError}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-white leading-snug line-clamp-2 group-hover:text-white">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">{post.content.slice(0, 60)}…</p>
                </div>
                <span className="text-white/25 group-hover:text-white/60 transition-colors text-sm flex-shrink-0 mt-0.5">→</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Loading state */}
      {posts.length === 0 && (
        <div className="relative z-10 flex justify-center items-center h-64">
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
      )}

      {/* ── Split Modal ───────────────────────────────────── */}
      <SplitModal post={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Blog;
