import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navStyle = `px-3 py-1 rounded hover:bg-white/20 transition ${
    location.pathname === "/" ? "text-white" : "text-white"
  }`;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled ? "backdrop-blur-md bg-black/30 shadow" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-white font-semibold text-lg">
          Aswin
        </Link>
        <nav className="flex gap-4 items-center text-sm font-medium">
          <Link to="/about" className={navStyle}>
            About
          </Link>
          <Link to="/projects" className={navStyle}>
            Projects
          </Link>
          <Link to="/ai" className={navStyle}>
            AI
          </Link>
          <Link to="/blog" className={navStyle}>
            Blog
          </Link>
          <a
            href="/Aswin_Startup_resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black px-4 py-1 rounded-full hover:bg-gray-100 transition"
          >
            Resume
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
