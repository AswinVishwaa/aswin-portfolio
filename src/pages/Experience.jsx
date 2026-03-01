import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

// ─── Experience Data ─────────────────────────────────────────
const EXPERIENCES = [
    {
        id: "dobbe",
        role: "Software Engineer — Backend & Systems",
        company: "Dobbe AI",
        type: "Full-time",
        period: "Aug 2025 – Present",
        color: "#6ee7b7",   // emerald
        icon: "🏥",
        branch: "main",
        commits: [
            { month: "Aug 2025", label: "Event Logging Infrastructure", detail: "Built 53+ event logs (login, uploads, pipeline events) across frontend (React) and backend (Node.js). Added PostgreSQL pg_extension logging, routed all logs to Wazuh SIEM via custom decoders and rules. Created monitoring dashboards and automated email alerting for critical events.", tags: ["Node.js", "PostgreSQL", "Wazuh", "React"] },
            { month: "Sep 2025", label: "Mixpanel Analytics & Meta Ads", detail: "Implemented 150+ Mixpanel tracking events across the full stack. Built beginner-level funnels, user behaviour insights, and conversion boards. Configured Meta Ads event setup for campaign tracking integration.", tags: ["Mixpanel", "Analytics", "Meta Ads", "JavaScript"] },
            { month: "Oct 2025", label: "C#/.NET MSI Desktop Agent", detail: "Joined the Dobbe Agent — a C#/.NET MSI installer that monitors local folders and uploads .dcm/.ixr/.ioss medical files to the backend. Understood the full architecture and introduced new file format support.", tags: ["C#", ".NET", "MSI", "Windows"] },
            { month: "Nov 2025", label: "Binary Format Reverse Engineering", detail: "Worked with proprietary binary files — reverse-engineered hex patterns to extract patient metadata, converted binary X-ray files to PNG, and mapped data to backend structures. Extended backend endpoints for preprocessing and bucket storage.", tags: ["Binary Parsing", "C#", "Python", "Medical Imaging"] },
            { month: "Dec 2025", label: "System Architecture Refactor", detail: "Refactored the entire Dobbe Agent architecture for more efficient processing — restructured agent-server communication pipeline, optimised file upload flows, and resolved performance bottlenecks after backend upgrades.", tags: ["Architecture", "C#", ".NET", "Optimization"] },
            { month: "Jan 2026", label: "Windows 7 & 32-bit Compatibility", detail: "Ported the MSI from .NET 9.0 to .NET Framework 4.8 to support Windows 7+. Added separate 32-bit and 64-bit build targets. Deployed and tested on clinic machines at client sites, debugging real-time issues on location.", tags: [".NET 4.8", "Win7", "MSI", "Deployment"] },
            { month: "Feb 2026", label: "FastAPI Backend Refactor", detail: "Began refactoring the entire website backend to FastAPI — restructuring AI output storage, designing source tables, and reorganizing data flow to reduce query latency and improve accuracy of AI-generated results.", tags: ["FastAPI", "Python", "PostgreSQL", "System Design"] },
        ],
    },
    {
        id: "freelance-rt",
        role: "AI Research Engineer",
        company: "Freelance — Brain Tumor RT Pipeline",
        type: "Freelance",
        period: "Oct 2025 – Present",
        color: "#a78bfa",   // violet
        icon: "🧬",
        branch: "feature/rt-pipeline",
        commits: [
            { month: "Oct–Nov 2025", label: "3D UNet Tumour Segmentation", detail: "Trained a custom 3D UNet on BraTS2020 multi-modal MRI (T1, T1CE, T2, FLAIR) using MONAI sliding-window inference. Achieved Dice WT=0.9288, TC=0.8748, ET=0.8876 — competitive with published BraTS SOTA submissions.", tags: ["PyTorch", "MONAI", "3D UNet", "BraTS2020"] },
            { month: "Dec 2025", label: "MedGemma 1.5 Radiology Reports", detail: "Integrated Google's MedGemma 1.5 (4B-IT medical VLM built on Gemma 3) for automated clinical radiology report generation from T1-CE MRI slices. Corrected Gemma 3 chat template format, ran in bfloat16 on cuda:0.", tags: ["MedGemma", "VLM", "HuggingFace", "CUDA"] },
            { month: "Jan 2026", label: "RAG Clinical Guidance Agent", detail: "Built a hybrid RAG pipeline: FAISS dense retrieval + BM25 sparse retrieval + cross-encoder reranking over 370 pages of ESTRO-EANO 2023 and RTOG clinical guidelines. Used Llama-3 4-bit QLoRA as the generator via LangChain RetrievalQA.", tags: ["LangChain", "FAISS", "BM25", "Llama-3", "RAG"] },
            { month: "Feb 2026", label: "GPU-Accelerated RT Contouring", detail: "Implemented GTV/CTV/PTV margin algorithms per ESTRO-EANO 2023 (15mm CTV, 60Gy) and RTOG dual-phase protocols. GPU-accelerated 3D dilation via max_pool3d — 50× faster than CPU scipy baseline. Brain-boundary masking for anatomical accuracy.", tags: ["PyTorch", "CUDA", "ESTRO-EANO", "RTOG", "Medical Imaging"] },
        ],
    },
    {
        id: "glucotrack",
        role: "AI Researcher & Co-founder",
        company: "Glucotrack — Glaucoma AI",
        type: "Startup",
        period: "Sep 2023 – Oct 2025",
        color: "#fbbf24",   // amber
        icon: "👁️",
        branch: "feature/glaucoma",
        commits: [
            { month: "Sep 2023", label: "Project Kickoff — Glaucoma AI Vision", detail: "Started building an AI-powered glaucoma screening device. Identified the gap: most clinics in India lack affordable screening tools. Goal: build a portable, low-cost device using deep learning.", tags: ["Python", "Computer Vision", "UNet"] },
            { month: "2024", label: "UNet + YOLOv9 Model Development", detail: "Developed the AI pipeline using UNet for optic disc/cup segmentation and YOLOv9 for detection. Optimised for fast inference on low-spec hardware suitable for clinical environments.", tags: ["UNet", "YOLOv9", "PyTorch", "Medical AI"] },
            { month: "Dec 2024", label: "🥇 ₹30K Prize — Startup Mania 9.0", detail: "Won 1st Prize at Startup Mania 9.0. Judges praised the clinical impact, scalability, and the AI stack (UNet + YOLOv9). Competition featured startups across MedTech, AI, and Automation sectors.", tags: ["Award", "Startup Mania", "₹30K Prize"] },
            { month: "2025", label: "Research Publication — ICCCNT 2025", detail: "Published research paper at ICCCNT 2025 (IEEE conference at IIT Indore) covering the Glaucoma Detection methodology, dataset experiments, and clinical validation results.", tags: ["Research", "ICCCNT", "IIT Indore", "IEEE"] },
            { month: "Oct 2025", label: "🏆 ₹10L Grant — Titan Nest / IIM Calcutta", detail: "Won ₹10,00,000 (₹10 Lakh) in grant funding from the Titan Nest national innovation program organised by IIM Calcutta. Selected among top teams nationally for social innovation, scalability, and impact in AI + Healthcare.", tags: ["Award", "IIM Calcutta", "₹10L Grant", "Titan Nest"] },
        ],
    },
];

// ─── Commit Node ─────────────────────────────────────────────
const CommitNode = ({ commit, color, isLast, onClick, active }) => (
    <div className="flex gap-4 group">
        {/* Graph line + dot */}
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
            <div
                className="w-3 h-3 rounded-full border-2 z-10 flex-shrink-0 transition-all duration-200 group-hover:scale-125 cursor-pointer"
                style={{
                    backgroundColor: active ? color : "transparent",
                    borderColor: color,
                    boxShadow: active ? `0 0 8px ${color}88` : "none",
                }}
                onClick={onClick}
            />
            {!isLast && (
                <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: `${color}40` }} />
            )}
        </div>

        {/* Content */}
        <div className="pb-6 flex-1 min-w-0">
            <button
                onClick={onClick}
                className="text-left w-full group-hover:opacity-90 transition-opacity"
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 font-mono">{commit.month}</span>
                    <span className="text-white text-sm font-medium">{commit.label}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                    {commit.tags.map((t) => (
                        <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-full border font-mono"
                            style={{ borderColor: `${color}50`, color: color, backgroundColor: `${color}10` }}
                        >
                            {t}
                        </span>
                    ))}
                </div>
            </button>

            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="mt-3 p-4 rounded-xl border text-sm text-gray-300 leading-relaxed"
                            style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
                        >
                            {commit.detail}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
);

// ─── Branch Track ─────────────────────────────────────────────
const BranchTrack = ({ exp }) => {
    const [activeCommit, setActiveCommit] = useState(null);
    const toggle = (i) => setActiveCommit(activeCommit === i ? null : i);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white/4 border border-white/8 rounded-2xl p-6"
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${exp.color}18`, border: `1px solid ${exp.color}40` }}
                >
                    {exp.icon}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold text-base">{exp.role}</h3>
                        <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: `${exp.color}20`, color: exp.color }}
                        >
                            {exp.type}
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">{exp.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className="font-mono text-[10px] px-2 py-0.5 rounded border"
                            style={{ color: exp.color, borderColor: `${exp.color}40`, backgroundColor: `${exp.color}10` }}
                        >
                            git:{exp.branch}
                        </span>
                        <span className="text-gray-600 text-xs">{exp.period}</span>
                    </div>
                </div>
            </div>

            {/* Commits */}
            <div className="ml-1">
                {exp.commits.map((commit, i) => (
                    <CommitNode
                        key={i}
                        commit={commit}
                        color={exp.color}
                        isLast={i === exp.commits.length - 1}
                        active={activeCommit === i}
                        onClick={() => toggle(i)}
                    />
                ))}
            </div>
        </motion.div>
    );
};

// ─── Page ─────────────────────────────────────────────────────
const Experience = () => (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#0d0d14] to-[#0f0f0f] text-white">
        <ParticlesBackground id="tsparticles-exp" count={25} speed={0.15} opacity={0.08} />

        {/* Header */}
        <div className="relative z-10 text-center pt-28 pb-10 px-4">
            <motion.div
                className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 border border-white/10
          px-3 py-1.5 rounded-full mb-4 bg-white/4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                git log --all --graph --oneline
            </motion.div>

            <motion.h1
                className="text-4xl sm:text-5xl font-bold mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                Experience
            </motion.h1>
            <motion.p
                className="text-gray-400 text-sm sm:text-base max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                My career as a git graph — click any commit to expand the details.
            </motion.p>
        </div>

        {/* Stats bar */}
        <motion.div
            className="relative z-10 max-w-3xl mx-auto px-4 mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "AI/ML Career", value: "2.5+ Yrs" },
                    { label: "Grant Funding", value: "₹10L" },
                    { label: "Awards Won", value: "4+" },
                    { label: "Active Roles", value: "3" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="bg-white/4 border border-white/8 rounded-xl p-4 text-center"
                    >
                        <div className="text-2xl font-bold text-white">{s.value}</div>
                        <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                    </div>
                ))}
            </div>
        </motion.div>

        {/* Branch tracks */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 pb-20 space-y-6">
            {EXPERIENCES.map((exp) => (
                <BranchTrack key={exp.id} exp={exp} />
            ))}
        </div>
    </div>
);

export default Experience;
