import { motion } from "framer-motion";

const Loader = () => {
  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full bg-white z-[9999] flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.2, delay: 0.5 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-3xl font-bold tracking-wider">Loading...</h1>
    </motion.div>
  );
};

export default Loader;
