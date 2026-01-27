export function LanguageToggle({ locale, t }) {
  const targetLocale = locale === 'en' ? 'ko' : 'en';
  const targetPath = locale === 'en' ? '/ko/' : '/';

  const handleClick = (e) => {
    // 쿠키에 언어 선택 저장 (1년간 유효)
    document.cookie = `locale=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <a
      href={targetPath}
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition-all duration-300"
    >
      {t.nav.language}
    </a>
  );
}
