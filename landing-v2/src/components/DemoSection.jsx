function SentimentBadge({ sentiment, locale }) {
  const colors = {
    'Positive': 'bg-green-500/20 text-green-400',
    'Neutral': 'bg-yellow-500/20 text-yellow-400',
    'Negative': 'bg-red-500/20 text-red-400',
    'Mixed': 'bg-purple-500/20 text-purple-400',
    '긍정': 'bg-green-500/20 text-green-400',
    '중립': 'bg-yellow-500/20 text-yellow-400',
    '부정': 'bg-red-500/20 text-red-400',
    '혼재': 'bg-purple-500/20 text-purple-400',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[sentiment] || 'bg-slate-500/20 text-slate-400'}`}>
      {sentiment}
    </span>
  );
}

function IntentBadge({ intent, locale }) {
  const colors = {
    'High': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Low': 'text-red-400',
    '높음': 'text-green-400',
    '중간': 'text-yellow-400',
    '낮음': 'text-red-400',
  };

  return (
    <span className={`text-xs font-medium ${colors[intent] || 'text-slate-400'}`}>
      {intent}
    </span>
  );
}

function ScoreBadge({ score }) {
  const getColor = (s) => {
    if (s >= 4) return 'text-green-400';
    if (s >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <span className={`text-sm font-bold ${getColor(score)}`}>
      {score.toFixed(1)}
    </span>
  );
}

export function DemoSection({ t, locale }) {
  const sentimentLabel = locale === 'ko' ? '감성' : 'Sentiment';
  const intentLabel = locale === 'ko' ? '구매의향' : 'Intent';
  const scoreLabel = locale === 'ko' ? '점수' : 'Score';

  return (
    <section id="demo" className="py-20 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.demo.title}
          </h2>
          <p className="text-slate-400 text-lg">
            {t.demo.subtitle}
          </p>
        </div>

        {/* Demo Container */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t.demo.input.label}
            </div>
            <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl">
              <p className="text-white text-lg leading-relaxed">
                {t.demo.input.example}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-4 lg:hidden">
              <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Output Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              {t.demo.output.label}
            </div>

            {/* Persona Feedback Cards */}
            <div className="space-y-3">
              {t.demo.personas.map((persona, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-violet-500/50 transition-all duration-300"
                >
                  {/* Persona Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {persona.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {persona.name}
                        <span className="text-slate-400 font-normal ml-2 text-sm">
                          {persona.job}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{persona.traits}</div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <p className="text-slate-300 text-sm mb-3 italic">
                    {persona.feedback}
                  </p>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">{sentimentLabel}:</span>
                      <SentimentBadge sentiment={persona.sentiment} locale={locale} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">{intentLabel}:</span>
                      <IntentBadge intent={persona.intent} locale={locale} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">{scoreLabel}:</span>
                      <ScoreBadge score={persona.score} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-8 p-6 bg-gradient-to-r from-violet-900/50 to-pink-900/50 border border-violet-500/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-semibold text-white">{t.demo.summary.title}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{t.demo.summary.avgScore}</div>
              <div className="text-xs text-slate-400">{locale === 'ko' ? '평균 점수' : 'Avg Score'}</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <SentimentBadge sentiment={t.demo.summary.sentiment} locale={locale} />
              <div className="text-xs text-slate-400 mt-1">{locale === 'ko' ? '전체 감성' : 'Overall Sentiment'}</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-xs text-slate-400">{locale === 'ko' ? '페르소나' : 'Personas'}</div>
            </div>
          </div>
          <p className="text-slate-300 text-sm">
            <span className="font-semibold text-violet-400">{locale === 'ko' ? '핵심 인사이트:' : 'Key Insight:'}</span> {t.demo.summary.keyInsight}
          </p>
        </div>
      </div>
    </section>
  );
}
