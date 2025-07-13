import { motion } from "framer-motion";

const ProjectDrawer = ({ project, onClose, isMobile }) => {
  const animation = {
    initial: isMobile ? { y: "100%" } : { x: "100%" },
    animate: isMobile ? { y: 0 } : { x: 0 },
    exit: isMobile ? { y: "100%" } : { x: "100%" },
  };

  return (
    <motion.div
      drag={isMobile ? "y" : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(e, info) => {
        if (isMobile && info.offset.y > 100) {
          onClose();
        }
      }}
      {...animation}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 ${
        isMobile ? "bottom-0" : "right-0"
      } w-full ${isMobile ? "h-[90%]" : "sm:w-[480px] h-full"} 
         bg-white z-[999] shadow-xl p-6 overflow-y-auto rounded-t-xl`}
    >
      <motion.button
        whileHover={{ scale: 1.1, x: -4 }}
        whileTap={{ scale: 0.9 }}
        className="text-gray-700 text-base mb-4 font-semibold"
        onClick={onClose}
      >
        ← Back to Projects
      </motion.button>

      {/* Image or Placeholder */}
      {project.image ? (
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 mb-4 rounded-lg flex items-center justify-center text-gray-500 text-sm">
          Project Preview Image
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
      <p className="text-gray-600 mb-4">{project.desc}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tech.map((t) => (
          <span
            key={t}
            className="bg-black text-white px-2 py-1 rounded text-sm"
          >
            {t}
          </span>
        ))}
      </div>
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        Open Live ↗
      </a>
    </motion.div>
  );
};

export default ProjectDrawer;
