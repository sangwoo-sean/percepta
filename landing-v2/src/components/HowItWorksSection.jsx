const icons = {
  upload: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  users: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  sparkles: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

export function HowItWorksSection({ t }) {
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.howItWorks.title}
          </h2>
          <p className="text-slate-400 text-lg">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {t.howItWorks.steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < t.howItWorks.steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-violet-500 to-transparent" />
              )}

              <div className="relative text-center">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
                  {icons[step.icon]}
                </div>

                {/* Number Badge */}
                <div className="absolute top-0 right-1/2 translate-x-14 -translate-y-2 w-8 h-8 bg-slate-800 border-2 border-violet-500 rounded-full flex items-center justify-center text-violet-400 font-bold text-sm">
                  {step.number}
                </div>

                {/* Text */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Time Badge */}
        <div className="text-center mt-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.howItWorks.time}
          </span>
        </div>
      </div>
    </section>
  );
}
