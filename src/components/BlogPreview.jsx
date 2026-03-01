import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const parseFrontmatter = (raw) => {
    const titleMatch = raw.match(/title:\s*(.+)/);
    const priorityMatch = raw.match(/priority:\s*(\d+)/);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled";
    const priority = priorityMatch ? parseInt(priorityMatch[1]) : 999;
    const parts = raw.split("---");
    const content = parts.length >= 3 ? parts.slice(2).join("---").trim() : raw.trim();
    return { title, priority, content };
};

// ── Portal Modal — rendered directly into document.body to
//    escape any ancestor CSS transform stacking context ──────
const CenteredModal = ({ selected, onClose, onSeeAll }) => {
    if (!selected) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                key="backdrop"
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    key="modal"
                    className="bg-white text-black rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
                    initial={{ scale: 0.9, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 24 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4 gap-3">
                            <h3 className="text-xl font-bold leading-snug">{selected.title}</h3>
                            <div className="flex gap-3 flex-shrink-0 items-center">
                                <button
                                    onClick={onSeeAll}
                                    className="text-gray-500 hover:text-black text-sm font-medium underline"
                                >
                                    See All
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200
                    flex items-center justify-center text-gray-500 hover:text-black text-sm transition-colors"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                            {selected.content}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

const BlogPreview = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const files = import.meta.glob("../blog/*.md", { query: "?raw", import: "default" });
        const loadPosts = async () => {
            const entries = Object.entries(files);
            const loaded = await Promise.all(
                entries.map(async ([, loader]) => {
                    const raw = await loader();
                    return parseFrontmatter(raw);
                })
            );
            const sorted = loaded.sort((a, b) => a.priority - b.priority);
            setPosts(sorted.slice(0, 2));
        };
        loadPosts();
    }, []);

    // Scroll lock + Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") setSelected(null); };
        document.body.style.overflow = selected ? "hidden" : "";
        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [selected]);

    if (posts.length === 0) return null;

    return (
        <section className="py-16 px-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6 text-black">Latest Posts</h2>

            <div className="grid gap-6 sm:grid-cols-2">
                {posts.map((post, i) => (
                    <motion.div
                        key={post.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        viewport={{ once: true }}
                        onClick={() => setSelected(post)}
                        className="bg-white text-black p-6 rounded-lg shadow-md border border-gray-200
              hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                            {post.content.slice(0, 200)}...
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Portal-based centered modal — escapes any ancestor transform */}
            <CenteredModal
                selected={selected}
                onClose={() => setSelected(null)}
                onSeeAll={() => navigate("/blog")}
            />

            {/* Explore All Posts button */}
            <motion.div
                className="flex justify-center mt-10"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
            >
                <button
                    onClick={() => navigate("/blog")}
                    className="group inline-flex items-center gap-2 border border-gray-300 bg-white text-black
            px-7 py-3 rounded-full font-semibold text-sm transition-all duration-300
            hover:bg-black hover:text-white hover:border-black
            hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:scale-105 hover:translate-y-[-2px]"
                >
                    <span>Explore All Posts</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
            </motion.div>
        </section>
    );
};

export default BlogPreview;
