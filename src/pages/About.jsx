import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { Typewriter } from "react-simple-typewriter";

const About = () => {
  const [aboutText, setAboutText] = useState("");
  const initParticles = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    fetch("/data/about.md")
      .then((res) => res.text())
      .then(setAboutText)
      .catch(console.error);
  }, []);

  const aboutParagraphs = aboutText.split("\n\n");

  return (
    <div className="overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white">
        {/* Particle Background */}
        <Particles
          className="absolute inset-0 z-0"
          id="tsparticles-about"
          init={initParticles}
          options={{
            fullScreen: false,
            particles: {
              color: { value: "#ffffff" },
              links: { enable: true, distance: 130, opacity: 0.15 },
              move: { enable: true, speed: 0.4 },
              number: { value: 45 },
              opacity: { value: 0.2 },
              size: { value: 1.5 },
            },
          }}
        />

        {/* Foreground Content */}
        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">About Me</h1>
          <p className="text-xl font-medium mb-8 text-gray-300">
            <Typewriter
              words={["AI Developer 🧠", "Web Builder 💻", "Product Thinker 🚀"]}
              loop={false}
              cursor
              cursorStyle="_"
              typeSpeed={60}
              deleteSpeed={40}
              delaySpeed={1500}
            />
          </p>

          {aboutParagraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="mb-4 text-gray-300 leading-relaxed text-sm sm:text-base"
            >
              {para}
            </motion.p>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default About;
