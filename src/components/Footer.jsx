const Footer = () => {
  return (
    <footer className="bg-black text-white py-6 text-center text-sm">
      <p className="mb-2">Built by Aswin Vishwaa</p>
      <div className="flex justify-center gap-6 text-gray-400">
        <a href="https://github.com/AswinVishwaa" target="_blank" className="hover:text-white transition">GitHub</a>
        <a href="https://www.linkedin.com/in/aswinvishwaa" target="_blank" className="hover:text-white transition">LinkedIn</a>
        <a href="mailto:aswinvishwaa@gmail.com" className="hover:text-white transition">Email</a>
      </div>
    </footer>
  );
};

export default Footer;
