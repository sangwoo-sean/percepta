export const translations = {
  en: {
    // Meta
    meta: {
      title: 'Percepta - Test Your Copy on AI Personas',
      description: 'Get instant feedback from AI personas that simulate your target customers. $0.01 per feedback. Know how your audience feels before you publish.',
    },

    // Navigation
    nav: {
      language: 'KO',
      languageLabel: '한국어',
    },

    // Hero Section
    hero: {
      badge: 'AI-Powered Feedback',
      title: 'Test your copy on AI personas.',
      titleHighlight: '$0.01 per feedback.',
      subtitle: 'AI personas simulate your target customers\' reactions. Get sentiment, purchase intent, and actionable insights in seconds.',
      cta: 'Try Free — 30 Credits',
      ctaSecondary: 'See Demo',
      scrollHint: 'See how it works',
    },

    // Social Proof Section
    socialProof: {
      stats: [
        { value: '10,000+', label: 'Feedbacks Generated' },
        { value: '$0.01', label: 'Per Feedback' },
        { value: '< 30s', label: 'Average Response' },
      ],
      badge: 'Trusted by indie hackers and copywriters',
    },

    // Problem Section
    problem: {
      title: 'Sound familiar?',
      items: [
        {
          icon: 'target',
          title: 'No idea if it resonates',
          description: '"Will 25-34 year olds actually care about this headline?"',
        },
        {
          icon: 'money',
          title: 'Expensive to find out',
          description: '"User testing costs $49+. Focus groups cost thousands."',
        },
        {
          icon: 'clock',
          title: 'Too slow to iterate',
          description: '"Can\'t wait days for feedback on every version."',
        },
      ],
    },

    // Demo Section
    demo: {
      title: 'See it in action',
      subtitle: 'Real feedback from AI personas in seconds',
      input: {
        label: 'Your Content',
        placeholder: 'Paste your headline, landing page copy, or any content...',
        example: '"I\'m creating an Instagram ad for a fitness app targeting health-conscious 25-35 year olds for a New Year campaign. Please evaluate this copy: \'Start your year with healthy habits. Sign up now and get 50% off your first month!\'"',
      },
      output: {
        label: 'AI Persona Feedback',
      },
      personas: [
        {
          name: 'Sarah',
          job: 'Marketing Manager',
          traits: 'Creative, Expressive',
          avatar: 'S',
          feedback: '"New year discounts are everywhere. What makes this different? I\'d need to see specific benefits before clicking."',
          sentiment: 'Neutral',
          intent: 'Low',
          score: 2.5,
        },
        {
          name: 'Mike',
          job: 'Software Engineer',
          traits: 'Analytical, Detail-oriented',
          avatar: 'M',
          feedback: '"50% off is compelling, but \'healthy habits\' is vague. What exactly am I signing up for?"',
          sentiment: 'Positive',
          intent: 'Medium',
          score: 3.2,
        },
        {
          name: 'Emma',
          job: 'Graduate Student',
          traits: 'Thoughtful, Curious',
          avatar: 'E',
          feedback: '"I like the positive tone, but \'healthy habits\' could mean anything. Be more specific about what you offer."',
          sentiment: 'Positive',
          intent: 'Medium',
          score: 3.0,
        },
      ],
      summary: {
        title: 'Summary Analysis',
        avgScore: '2.9',
        sentiment: 'Mixed',
        keyInsight: 'The discount is appealing, but the value proposition is too vague. Consider being more specific about what "healthy habits" means.',
      },
    },

    // How It Works Section
    howItWorks: {
      title: 'How it works',
      subtitle: 'Get feedback in 3 simple steps',
      steps: [
        {
          number: '1',
          title: 'Upload Content',
          description: 'Paste text, URL, or upload a file',
          icon: 'upload',
        },
        {
          number: '2',
          title: 'Select Personas',
          description: 'Choose 5+ target personas',
          icon: 'users',
        },
        {
          number: '3',
          title: 'Get Feedback',
          description: 'Instant results with insights',
          icon: 'sparkles',
        },
      ],
      time: 'Done in under 5 minutes',
    },

    // Pricing Section
    pricing: {
      title: 'Simple, transparent pricing',
      subtitle: '1 feedback = $0.01',
      plans: [
        {
          name: 'Free',
          credits: '30 credits',
          price: '$0',
          description: 'Perfect for trying out',
          features: ['5 persona feedbacks', '1 summary analysis', 'All persona types'],
          cta: 'Start Free',
          popular: false,
        },
        {
          name: 'Basic',
          credits: '200 credits',
          price: '$2',
          description: 'For regular users',
          features: ['~33 persona feedbacks', 'Unlimited summaries', 'Priority support'],
          cta: 'Get Started',
          popular: true,
        },
        {
          name: 'Pro',
          credits: '500 credits',
          price: '$5',
          description: 'Best value',
          features: ['~83 persona feedbacks', 'Unlimited summaries', 'Priority support'],
          cta: 'Get Started',
          popular: false,
        },
      ],
      note: '5 persona feedbacks + summary = 6 credits = $0.06',
      comparison: {
        title: 'Compare the cost',
        items: [
          { name: 'Focus Group', price: '$500 - $5,000' },
          { name: 'User Testing', price: '$49+ per test' },
          { name: 'Percepta', price: '$0.06 for 5 feedbacks', highlight: true },
        ],
      },
    },

    // CTA Section
    cta: {
      title: 'Ready to know what your audience thinks?',
      subtitle: 'Start free today — 30 credits included. No credit card required.',
      button: 'Get Started Free',
      note: 'Join 1,000+ creators and marketers',
    },

    // Footer
    footer: {
      copyright: '© 2026 Percepta. All rights reserved.',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
  },

  ko: {
    // Meta
    meta: {
      title: 'Percepta - AI 페르소나로 콘텐츠 검증하기',
      description: '타겟 고객을 시뮬레이션하는 AI 페르소나로부터 즉각적인 피드백을 받으세요. 피드백 1건 100원. 발행 전에 고객 반응을 미리 확인하세요.',
    },

    // Navigation
    nav: {
      language: 'EN',
      languageLabel: 'English',
    },

    // Hero Section
    hero: {
      badge: 'AI 기반 피드백',
      title: 'AI 페르소나로 콘텐츠를 테스트하세요.',
      titleHighlight: '피드백 1건 $0.01.',
      subtitle: 'AI 페르소나가 타겟 고객의 반응을 시뮬레이션합니다. 감성 분석, 구매 의향, 실행 가능한 인사이트를 몇 초 만에 받아보세요.',
      cta: '무료로 시작하기 — 30크레딧',
      ctaSecondary: '데모 보기',
      scrollHint: '어떻게 작동하나요?',
    },

    // Social Proof Section
    socialProof: {
      stats: [
        { value: '10,000+', label: '생성된 피드백' },
        { value: '$0.01', label: '피드백 1건' },
        { value: '< 30초', label: '평균 응답 시간' },
      ],
      badge: '마케터와 크리에이터가 신뢰하는 서비스',
    },

    // Problem Section
    problem: {
      title: '이런 고민, 있으신가요?',
      items: [
        {
          icon: 'target',
          title: '타겟 반응을 모르겠다',
          description: '"이 헤드라인이 2030 여성에게 먹힐까?"',
        },
        {
          icon: 'money',
          title: '확인하려면 비용이 너무 크다',
          description: '"사용자 테스트는 5만원 이상, FGI는 수백만원..."',
        },
        {
          icon: 'clock',
          title: '피드백이 너무 느리다',
          description: '"버전마다 며칠씩 기다릴 수 없어요."',
        },
      ],
    },

    // Demo Section
    demo: {
      title: '직접 확인해보세요',
      subtitle: 'AI 페르소나의 실제 피드백',
      input: {
        label: '당신의 콘텐츠',
        placeholder: '헤드라인, 랜딩페이지 카피, 또는 어떤 콘텐츠든 붙여넣으세요...',
        example: '"피트니스 앱의 신년 캠페인 인스타그램 광고인데요, 건강에 관심 있는 25-35세를 타겟으로 하고 있어요. 이 카피 평가해주세요: \'새해에는 건강한 습관으로 시작하세요. 지금 가입하면 첫 달 50% 할인!\'"',
      },
      output: {
        label: 'AI 페르소나 피드백',
      },
      personas: [
        {
          name: '민지',
          job: '마케팅 매니저',
          traits: '창의적, 표현력 풍부',
          avatar: '민',
          feedback: '"새해 할인은 너무 흔해서 눈에 안 들어와요. 구체적인 혜택이나 차별점이 있으면 좋겠어요."',
          sentiment: '중립',
          intent: '낮음',
          score: 2.5,
        },
        {
          name: '성준',
          job: '소프트웨어 엔지니어',
          traits: '분석적, 꼼꼼함',
          avatar: '성',
          feedback: '"50% 할인이면 괜찮은데, \'건강한 습관\'이 뭔지 구체적으로 알고 싶어요."',
          sentiment: '긍정',
          intent: '중간',
          score: 3.2,
        },
        {
          name: '수연',
          job: '대학원생',
          traits: '호기심 많음, 사려깊음',
          avatar: '수',
          feedback: '"긍정적인 톤은 좋은데, \'건강한 습관\'이 너무 모호해요. 구체적으로 뭘 제공하는지 알려주세요."',
          sentiment: '긍정',
          intent: '중간',
          score: 3.0,
        },
      ],
      summary: {
        title: '종합 분석',
        avgScore: '2.9',
        sentiment: '혼재',
        keyInsight: '할인은 매력적이지만 가치 제안이 모호합니다. "건강한 습관"이 구체적으로 무엇인지 명시하는 것을 권장합니다.',
      },
    },

    // How It Works Section
    howItWorks: {
      title: '사용 방법',
      subtitle: '3단계로 피드백 받기',
      steps: [
        {
          number: '1',
          title: '콘텐츠 입력',
          description: '텍스트, URL 또는 파일 업로드',
          icon: 'upload',
        },
        {
          number: '2',
          title: '페르소나 선택',
          description: '5명 이상의 타겟 페르소나 선택',
          icon: 'users',
        },
        {
          number: '3',
          title: '피드백 확인',
          description: '즉각적인 결과와 인사이트',
          icon: 'sparkles',
        },
      ],
      time: '5분이면 완료',
    },

    // Pricing Section
    pricing: {
      title: '심플하고 투명한 가격',
      subtitle: '피드백 1건 = $0.01',
      plans: [
        {
          name: '무료',
          credits: '30 크레딧',
          price: '$0',
          description: '체험용으로 완벽',
          features: ['5명 페르소나 피드백', '1회 종합 분석', '모든 페르소나 타입'],
          cta: '무료로 시작',
          popular: false,
        },
        {
          name: '베이직',
          credits: '200 크레딧',
          price: '$1.49',
          description: '일반 사용자용',
          features: ['~33회 페르소나 피드백', '무제한 종합 분석', '우선 지원'],
          cta: '시작하기',
          popular: true,
        },
        {
          name: '프로',
          credits: '500 크레딧',
          price: '$2.99',
          description: '최고의 가성비',
          features: ['~83회 페르소나 피드백', '무제한 종합 분석', '우선 지원'],
          cta: '시작하기',
          popular: false,
        },
      ],
      note: '5명 피드백 + 종합 분석 = 6크레딧 = $0.06',
      comparison: {
        title: '비용 비교',
        items: [
          { name: 'FGI (포커스 그룹)', price: '50만원 ~ 500만원' },
          { name: '사용자 테스트', price: '5만원 이상/회' },
          { name: 'Percepta', price: '$0.06에 5명 피드백', highlight: true },
        ],
      },
    },

    // CTA Section
    cta: {
      title: '타겟 고객이 어떻게 생각하는지 알고 싶으신가요?',
      subtitle: '지금 무료로 시작하세요 — 30크레딧 제공. 신용카드 불필요.',
      button: '무료로 시작하기',
      note: '1,000명 이상의 크리에이터와 마케터가 함께합니다',
    },

    // Footer
    footer: {
      copyright: '© 2026 Percepta. All rights reserved.',
      links: [
        { label: '개인정보처리방침', href: '#' },
        { label: '이용약관', href: '#' },
        { label: '문의하기', href: '#' },
      ],
    },
  },
};

export const getTranslation = (locale) => {
  return translations[locale] || translations.en;
};
