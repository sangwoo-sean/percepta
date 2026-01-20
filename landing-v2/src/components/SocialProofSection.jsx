export function SocialProofSection({ t }) {
  return (
    <section className="py-12 bg-slate-800 border-y border-slate-700">
      <div className="max-w-6xl mx-auto px-6">
        {/* Stats */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          {t.socialProof.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="text-center mt-8">
          <span className="inline-flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t.socialProof.badge}
          </span>
        </div>
      </div>
    </section>
  );
}
