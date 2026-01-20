export function HeroSection({ t, appUrl }) {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-sm mb-8">
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          {t.hero.badge}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {t.hero.title}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            {t.hero.titleHighlight}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <a
            href={appUrl}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
          >
            {t.hero.cta}
          </a>
          <a
            href="#demo"
            className="px-8 py-4 border border-slate-600 hover:border-slate-500 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-slate-800/50"
          >
            {t.hero.ctaSecondary}
          </a>
        </div>

        {/* Scroll hint */}
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <span className="text-sm">{t.hero.scrollHint}</span>
          <div className="animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
