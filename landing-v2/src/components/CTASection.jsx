export function CTASection({ t, appUrl }) {
  return (
    <section className="py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          {t.cta.title}
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          {t.cta.subtitle}
        </p>

        {/* CTA Button */}
        <a
          href={appUrl}
          className="inline-block px-10 py-5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105"
        >
          {t.cta.button}
        </a>

        {/* Note */}
        <p className="mt-6 text-slate-400 text-sm">
          {t.cta.note}
        </p>
      </div>
    </section>
  );
}
