import './App.css'
import { translations } from './i18n/translations'

const PERSONA_COLORS = [
  'bg-sky-100 text-sky-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
  'bg-amber-100 text-amber-700',
  'bg-slate-100 text-slate-700',
  'bg-purple-100 text-purple-700',
]

function LanguageToggle({ locale, t }) {
  const targetPath = locale === 'ko' ? '/' : '/ko/'
  return (
    <a
      href={targetPath}
      className="fixed top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white transition-colors"
    >
      {t.languageToggle}
    </a>
  )
}

function HeroSection({ t }) {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-medium backdrop-blur-sm">
            {t.hero.badge}
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {t.hero.title1}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            {t.hero.title2}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          {t.hero.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://perceptaai.vercel.app/"
            className="px-8 py-4 bg-violet-500 hover:bg-violet-600 rounded-xl font-semibold text-lg transition-all hover:scale-105"
          >
            {t.hero.cta}
          </a>
        </div>
      </div>
      <div className="absolute bottom-10 animate-bounce">
        <svg
          className="w-6 h-6 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}

function ProblemSection({ t }) {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t.problem.title1}
            <br />
            {t.problem.title2}
          </h2>
          <p className="text-slate-600 text-lg">{t.problem.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {t.problem.items.map((item, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-slate-50">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionSection({ t }) {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t.solution.title}
          </h2>
          <p className="text-slate-600 text-lg">{t.solution.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.solution.steps.map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="text-violet-500 font-bold text-sm mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeedbackExampleSection({ t }) {
  const feedbackExamples = t.feedback.personas.map((persona, i) => ({
    persona,
    text: t.feedback.examples[i],
  }))

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t.feedback.title}
          </h2>
          <p className="text-slate-600 text-lg">{t.feedback.subtitle}</p>
        </div>
        <div className="space-y-6">
          {feedbackExamples.map((example, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 ${example.persona.avatar} rounded-full flex items-center justify-center text-white font-bold`}
                >
                  {example.persona.name[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    {example.persona.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {example.persona.age} · {example.persona.job}
                  </div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{example.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-6 bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl border border-violet-100">
          <h3 className="font-bold text-slate-900 mb-4">
            {t.feedback.report.title}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded-xl">
              <span className="text-green-500 font-semibold">
                {t.feedback.report.positive.label}
              </span>
              <p className="text-slate-600 mt-1">
                {t.feedback.report.positive.text}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <span className="text-red-500 font-semibold">
                {t.feedback.report.concerns.label}
              </span>
              <p className="text-slate-600 mt-1">
                {t.feedback.report.concerns.text}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <span className="text-blue-500 font-semibold">
                {t.feedback.report.suggestions.label}
              </span>
              <p className="text-slate-600 mt-1">
                {t.feedback.report.suggestions.text}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <span className="text-purple-500 font-semibold">
                {t.feedback.report.intent.label}
              </span>
              <p className="text-slate-600 mt-1">
                {t.feedback.report.intent.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PersonaShowcase({ t }) {
  return (
    <section className="py-24 px-6 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t.personas.title}
        </h2>
        <p className="text-slate-400 text-lg mb-12">{t.personas.subtitle}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {t.personas.list.map((p, i) => (
            <span
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-medium ${PERSONA_COLORS[i]}`}
            >
              {p.age} {p.job}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ t }) {
  return (
    <section className="py-24 px-6 bg-gradient-to-r from-violet-600 to-pink-500 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {t.cta.title1}
          <br />
          {t.cta.title2}
        </h2>
        <p className="text-white/80 text-lg mb-10">{t.cta.subtitle}</p>
        <a
          href="https://perceptaai.vercel.app/"
          className="inline-block px-10 py-4 bg-white text-violet-600 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105"
        >
          {t.cta.button}
        </a>
      </div>
    </section>
  )
}

function Footer({ t }) {
  return (
    <footer className="py-8 px-6 bg-slate-900 text-slate-400">
      <div className="max-w-4xl mx-auto text-center text-sm">
        <p>{t.footer.copyright}</p>
      </div>
    </footer>
  )
}

function App({ locale = 'en' }) {
  const t = translations[locale]

  return (
    <div className="min-h-screen">
      <LanguageToggle locale={locale} t={t} />
      <HeroSection t={t} />
      <ProblemSection t={t} />
      <SolutionSection t={t} />
      <FeedbackExampleSection t={t} />
      <PersonaShowcase t={t} />
      <CTASection t={t} />
      <Footer t={t} />
    </div>
  )
}

export default App
