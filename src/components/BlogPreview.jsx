import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * Parses frontmatter from raw markdown text.
 * Extracts `title` and `priority` fields.
 */
const parseFrontmatter = (raw) => {
    const titleMatch = raw.match(/title:\s*(.+)/);
    const priorityMatch = raw.match(/priority:\s*(\d+)/);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled";
    const priority = priorityMatch ? parseInt(priorityMatch[1]) : 999;
    // Content is everything after the closing ---
    const parts = raw.split("---");
    const content = parts.length >= 3 ? parts.slice(2).join("---").trim() : raw.trim();
    return { title, priority, content };
};

const BlogPreview = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // ✅ Use ?raw query to bypass vite-plugin-md transformation
        const files = import.meta.glob("../blog/*.md", { query: "?raw", import: "default" });

        const loadPosts = async () => {
            const entries = Object.entries(files);
            const loaded = await Promise.all(
                entries.map(async ([, loader]) => {
                    const raw = await loader();
                    return parseFrontmatter(raw);
                })
            );
            // Sort by ascending priority (1 = highest) then show top 2
            const sorted = loaded.sort((a, b) => a.priority - b.priority);
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
        document.body.style.overflow = selected ? "hidden" : "";
        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [selected]);

    if (posts.length === 0) return null;

    return (
        <section className="py-16 px-4 max-w-4xl mx-auto relative z-10">
            <h2 className="text-2xl font-bold text-center mb-6">Latest Posts</h2>
            <div className="grid gap-6 sm:grid-cols-2">
                {posts.map((post, i) => (
                    <motion.div
                        key={post.title}
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
                ${isMobile
                                    ? "left-0 right-0 bottom-0 top-[20%] rounded-t-2xl"
                                    : "top-1/2 left-1/2 w-[90%] sm:w-[600px] transform -translate-x-1/2 -translate-y-1/2 rounded-lg"
                                }
                overflow-y-auto max-h-[85vh]`}
                            initial={isMobile ? { y: "100%", opacity: 0 } : { y: -20, scale: 0.96, opacity: 0 }}
                            animate={isMobile ? { y: 0, opacity: 1 } : { y: 0, scale: 1, opacity: 1 }}
                            exit={isMobile ? { y: "100%", opacity: 0 } : { y: -20, scale: 0.96, opacity: 0 }}
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

export default BlogPreview;
