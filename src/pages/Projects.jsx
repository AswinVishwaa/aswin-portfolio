import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import ProjectDrawer from "../components/ProjectDrawer";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
    },
  }),
};

const Projects = () => {
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [projectData, setProjectData] = useState([]);

  useEffect(() => {
    fetch("/data/projects.json")
      .then((res) => res.json())
      .then(setProjectData)
      .catch(console.error);
  }, []);


  const handleSelect = (project) => {
    setIsMobile(window.innerWidth < 768);
    setSelected(project);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const initParticles = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white">
      {/* Particle background */}
      <Particles
        className="absolute inset-0 z-0"
        init={initParticles}
        options={{
          fullScreen: false,
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, distance: 120, opacity: 0.1 },
            move: { enable: true, speed: 0.3 },
            number: { value: 35 },
            opacity: { value: 0.15 },
            size: { value: 1.5 },
          },
        }}
      />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-28 pb-8 px-4 relative z-10 text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Projects</h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
          A mix of deep learning, web automation, LLMs, and production-level
          apps.
        </p>
      </motion.div>

      {/* Cards Container with Perspective */}
      <div 
        className="relative z-10 px-4 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
        style={{ perspective: "1000px" }}
      >
        {projectData.map((project, i) => (
          <motion.div
            key={project.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            onClick={() => handleSelect(project)}
            className="relative group bg-white text-black shadow-md p-6 rounded-lg border border-gray-200 
              cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
              hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:z-20 hover:border-opacity-70 hover:border-white"
            style={{
              transformStyle: "preserve-3d",
              transform: "translateZ(0)",
            }}
            whileHover={{
              rotateX: -3,
              rotateY: 2,
              scale: 1.03,
              y: -5,
              transition: { duration: 0.3 }
            }}
          >
            <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
            <p className="text-gray-600 mb-4">{project.desc}</p>
            <div className="flex flex-wrap gap-2 text-sm text-white">
              {project.tech.map((t) => (
                <span key={t} className="bg-gray-800 px-2 py-1 rounded">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md z-[998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <ProjectDrawer
              key={selected.title}
              project={selected}
              isMobile={isMobile}
              onClose={() => setSelected(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;