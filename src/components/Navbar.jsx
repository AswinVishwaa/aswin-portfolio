import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react"; 

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const links = (
    <>
      <Link to="/about" className={navStyle} onClick={() => setMenuOpen(false)}>
        About
      </Link>
      <Link to="/projects" className={navStyle} onClick={() => setMenuOpen(false)}>
        Projects
      </Link>
      <Link to="/ai" className={navStyle} onClick={() => setMenuOpen(false)}>
        AI
      </Link>
      <Link to="/blog" className={navStyle} onClick={() => setMenuOpen(false)}>
        Blog
      </Link>
      <a
        href="/Aswin_Startup_resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white text-black px-4 py-1 rounded-full hover:bg-gray-100 transition"
        onClick={() => setMenuOpen(false)}
      >
        Resume
      </a>
    </>
  );

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

        {/* Desktop */}
        <nav className="hidden md:flex gap-4 items-center text-sm font-medium">
          {links}
        </nav>

        {/* Mobile */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/80 text-white px-4 pb-4 pt-2 flex flex-col gap-3 text-sm font-medium">
          {links}
        </div>
      )}
    </header>
  );
};

export default Navbar;
