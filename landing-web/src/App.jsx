import './App.css'

const PERSONAS = [
  { name: '이서연', age: '20대', job: '대학생', avatar: 'bg-blue-400' },
  { name: '박미영', age: '40대', job: '주부', avatar: 'bg-pink-400' },
  { name: '김동현', age: '30대', job: '회사원', avatar: 'bg-slate-400' },
]

const FEEDBACK_EXAMPLES = [
  {
    persona: PERSONAS[0],
    text: '"오 이거 진짜 유용할 것 같아요! 과제로 앱 기획서 만들 때 친구들한테 피드백 받기 애매했는데, 이거 쓰면 다양한 의견을 바로 받을 수 있겠네요."',
  },
  {
    persona: PERSONAS[1],
    text: '"첫 화면은 예쁜데 뭘 하는 건지 바로 이해가 안 됐어요. 저처럼 IT에 익숙하지 않은 사람도 쉽게 알 수 있게 설명이 더 쉬웠으면 좋겠어요."',
  },
  {
    persona: PERSONAS[2],
    text: '"회사에서 신규 서비스 기획할 때 매번 설문조사하기 번거로웠는데, 이걸로 빠르게 초기 반응 확인하면 딱 좋겠네요. 바로 써보고 싶어요."',
  },
]

function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-medium backdrop-blur-sm">
            AI 페르소나 피드백 서비스
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          출시 전에 미리 만나는<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            100명의 고객 피드백
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          다양한 연령대와 직업군의 AI 페르소나가<br className="hidden md:block" />
          당신의 제품을 실제 고객처럼 평가해드립니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-violet-500 hover:bg-violet-600 rounded-xl font-semibold text-lg transition-all hover:scale-105">
            무료로 시작하기
          </button>
          <button className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm">
            데모 보기
          </button>
        </div>
      </div>
      <div className="absolute bottom-10 animate-bounce">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            출시 후에야 알게 되는<br />치명적인 문제들
          </h2>
          <p className="text-slate-600 text-lg">
            이미 시간과 비용을 쏟아부은 후에 발견하면 늦습니다.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '😰', title: '메시지가 불명확', desc: '뭘 하는 서비스인지 고객이 이해를 못함' },
            { icon: '😤', title: 'UX 문제점', desc: '중요한 정보를 놓치거나 이탈하는 고객' },
            { icon: '😢', title: '타겟 불일치', desc: '정작 구매할 고객층에게 어필 안 됨' },
          ].map((item, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-slate-50">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionSection() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Percepta로 미리 검증하세요
          </h2>
          <p className="text-slate-600 text-lg">
            다양한 관점의 AI 페르소나가 솔직한 피드백을 제공합니다.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: '자료 업로드', desc: '랜딩페이지 URL, 스크린샷, 기획서 등' },
            { step: '02', title: '페르소나 선택', desc: '연령대, 직업군별로 원하는 만큼 생성' },
            { step: '03', title: '피드백 확인', desc: '개별 의견 + 종합 분석 리포트 제공' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-violet-500 font-bold text-sm mb-4">{item.step}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeedbackExampleSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            이런 피드백을 받게 됩니다
          </h2>
          <p className="text-slate-600 text-lg">
            각 페르소나의 관점에서 솔직하고 구체적인 의견을 제공해요.
          </p>
        </div>
        <div className="space-y-6">
          {FEEDBACK_EXAMPLES.map((example, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 ${example.persona.avatar} rounded-full flex items-center justify-center text-white font-bold`}>
                  {example.persona.name[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{example.persona.name}</div>
                  <div className="text-sm text-slate-500">{example.persona.age} · {example.persona.job}</div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{example.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-6 bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl border border-violet-100">
          <h3 className="font-bold text-slate-900 mb-4">종합 분석 리포트</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded-xl">
              <span className="text-green-500 font-semibold">긍정적 반응</span>
              <p className="text-slate-600 mt-1">UI가 깔끔하고 서비스 이해가 쉬움</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <span className="text-red-500 font-semibold">우려 사항</span>
              <p className="text-slate-600 mt-1">가격 정보 위치, 차별점 불명확</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <span className="text-blue-500 font-semibold">개선 제안</span>
              <p className="text-slate-600 mt-1">가격 섹션 상단 이동, 경쟁사 비교 추가</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <span className="text-purple-500 font-semibold">구매 의향</span>
              <p className="text-slate-600 mt-1">3명 중 2명 긍정적</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PersonaShowcase() {
  const personas = [
    { age: '10대', job: '고등학생', color: 'bg-sky-100 text-sky-700' },
    { age: '20대', job: '대학생', color: 'bg-blue-100 text-blue-700' },
    { age: '20대', job: '취준생', color: 'bg-indigo-100 text-indigo-700' },
    { age: '30대', job: '직장인', color: 'bg-green-100 text-green-700' },
    { age: '30대', job: '주부', color: 'bg-pink-100 text-pink-700' },
    { age: '40대', job: '자영업자', color: 'bg-amber-100 text-amber-700' },
    { age: '50대', job: '회사원', color: 'bg-slate-100 text-slate-700' },
    { age: '60대', job: '은퇴자', color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <section className="py-24 px-6 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          다양한 관점의 페르소나
        </h2>
        <p className="text-slate-400 text-lg mb-12">
          연령대와 직업군을 조합해 원하는 타겟층을 구성하세요.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {personas.map((p, i) => (
            <span key={i} className={`px-4 py-2 rounded-full text-sm font-medium ${p.color}`}>
              {p.age} {p.job}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-r from-violet-600 to-pink-500 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          출시 전 피드백으로<br />시행착오를 줄이세요
        </h2>
        <p className="text-white/80 text-lg mb-10">
          지금 바로 무료로 시작하고, AI 페르소나의 솔직한 피드백을 받아보세요.
        </p>
        <button className="px-10 py-4 bg-white text-violet-600 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105">
          무료로 시작하기
        </button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-8 px-6 bg-slate-900 text-slate-400">
      <div className="max-w-4xl mx-auto text-center text-sm">
        <p>&copy; 2025 Percepta. All rights reserved.</p>
      </div>
    </footer>
  )
}

function App() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeedbackExampleSection />
      <PersonaShowcase />
      <CTASection />
      <Footer />
    </div>
  )
}

export default App
