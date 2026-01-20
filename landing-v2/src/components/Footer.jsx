export function Footer({ t }) {
  return (
    <footer className="py-8 bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-slate-400 text-sm">
              {t.footer.copyright}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {t.footer.links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-slate-400 hover:text-white text-sm transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
