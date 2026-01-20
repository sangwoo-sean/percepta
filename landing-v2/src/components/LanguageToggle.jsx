export function LanguageToggle({ locale, t }) {
  const targetPath = locale === 'en' ? '/ko/' : '/';

  return (
    <a
      href={targetPath}
      className="fixed top-4 right-4 z-50 px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition-all duration-300"
    >
      {t.nav.language}
    </a>
  );
}
