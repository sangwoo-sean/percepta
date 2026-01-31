import { Injectable } from '@nestjs/common';
import { AIProvider, AIFeedbackResponse, AICallContext } from './ai-provider.interface';
import { Persona, PersonaData, AgeGroup } from '../personas/entities/persona.entity';
import { FeedbackResult } from '../feedback/entities/feedback-result.entity';

@Injectable()
export class MockAIService implements AIProvider {
  async generateFeedback(
    content: string,
    persona: Persona,
    context?: AICallContext,
  ): Promise<AIFeedbackResponse> {
    const imageUrls = context?.imageUrls || [];
    const hasImages = imageUrls.length > 0;
    const locale = context?.locale || 'ko';

    if (locale === 'en') {
      const imageAnalysis = hasImages
        ? ` After analyzing the ${imageUrls.length} attached image(s), the visual elements are well-composed and the overall design quality is good.`
        : '';

      return {
        feedbackText: `[Feedback from ${persona.name}] Evaluating this content from the perspective of a ${persona.ageGroup} ${persona.occupation}, it's an interesting idea overall. Considering the ${persona.personalityTraits.join(', ')} tendencies, there seems to be room for improvement in practicality and accessibility.${imageAnalysis}`,
        sentiment: 'neutral',
        purchaseIntent: 'medium',
        keyPoints: hasImages
          ? ['Interesting idea', 'Good visual design', 'Needs practicality improvement', 'Target audience needs clarification']
          : ['Interesting idea', 'Needs practicality improvement', 'Target audience needs clarification'],
        score: 3.5,
      };
    }

    const imageAnalysis = hasImages
      ? ` 첨부된 ${imageUrls.length}개의 이미지를 분석한 결과, 시각적 요소들이 잘 구성되어 있으며 전반적인 디자인 품질이 양호합니다.`
      : '';

    return {
      feedbackText: `[${persona.name}의 피드백] 이 콘텐츠에 대해 ${persona.ageGroup} ${persona.occupation}의 관점에서 평가하자면, 전반적으로 흥미로운 아이디어입니다. ${persona.personalityTraits.join(', ')}한 성향을 고려했을 때, 실용성과 접근성 측면에서 개선의 여지가 있어 보입니다.${imageAnalysis}`,
      sentiment: 'neutral',
      purchaseIntent: 'medium',
      keyPoints: hasImages
        ? ['흥미로운 아이디어', '시각적 디자인 양호', '실용성 개선 필요', '타겟 고객 명확화 필요']
        : ['흥미로운 아이디어', '실용성 개선 필요', '타겟 고객 명확화 필요'],
      score: 3.5,
    };
  }

  async generateSummary(
    content: string,
    results: FeedbackResult[],
    context?: AICallContext,
  ): Promise<string> {
    const avgScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + Number(r.score), 0) / results.length
        : 0;
    const sentiments = results.map((r) => r.sentiment);
    const positiveCount = sentiments.filter((s) => s === 'positive').length;
    const locale = context?.locale || 'ko';

    if (locale === 'en') {
      return `## Summary Analysis

### Overall Evaluation
Feedback was collected from ${results.length} personas. The average score is ${avgScore.toFixed(1)} points, with ${positiveCount} showing positive reactions.

### Positive Aspects
- Innovative idea
- Understanding of market needs

### Areas for Improvement
- Target audience clarification needed
- Pricing strategy review recommended

### Recommended Target Audience
Early adopters in their 20s-30s

### Suggested Next Steps
We recommend creating a prototype and collecting feedback from a small test group.`;
    }

    return `## 종합 분석 요약

### 전반적인 평가
총 ${results.length}명의 페르소나로부터 피드백을 수집했습니다. 평균 점수는 ${avgScore.toFixed(1)}점이며, ${positiveCount}명이 긍정적인 반응을 보였습니다.

### 긍정적 요소
- 혁신적인 아이디어
- 시장 니즈에 대한 이해

### 개선 필요 사항
- 타겟 고객 명확화
- 가격 정책 재검토

### 추천 타겟 고객층
20-30대 얼리어답터

### 다음 단계 제안
프로토타입 제작 및 소규모 테스트 그룹 피드백 수집을 권장합니다.`;
  }

  async generatePersonas(ageGroups: AgeGroup[], count: number, context?: AICallContext): Promise<PersonaData[]> {
    const locale = context?.locale || 'ko';

    const mockNamesKo = {
      male: ['김민준', '이서준', '박도윤', '최예준', '정시우', '강하준', '조주원', '윤지호'],
      female: ['김서연', '이서윤', '박지우', '최서현', '정민서', '강하은', '조하윤', '윤윤서'],
    };

    const mockNamesEn = {
      male: ['James Smith', 'Michael Johnson', 'David Williams', 'Robert Brown', 'William Jones', 'Richard Davis', 'Thomas Miller', 'Christopher Wilson'],
      female: ['Emma Smith', 'Olivia Johnson', 'Sophia Williams', 'Isabella Brown', 'Mia Jones', 'Charlotte Davis', 'Amelia Miller', 'Harper Wilson'],
    };

    const mockOccupationsKo: Record<AgeGroup, string[]> = {
      '10s': ['고등학생', '대학생', '수험생'],
      '20s': ['대학생', '취업준비생', '사무직', '개발자', '디자이너'],
      '30s': ['회사원', '프리랜서', '스타트업 대표', '전문직'],
      '40s': ['중간관리자', '자영업자', '전문직', '주부'],
      '50s': ['임원', '자영업자', '공무원', '전문직'],
      '60+': ['은퇴자', '자영업자', '시간제 근로자'],
    };

    const mockOccupationsEn: Record<AgeGroup, string[]> = {
      '10s': ['High school student', 'College student', 'Test prep student'],
      '20s': ['College student', 'Job seeker', 'Office worker', 'Developer', 'Designer'],
      '30s': ['Corporate employee', 'Freelancer', 'Startup founder', 'Professional'],
      '40s': ['Middle manager', 'Business owner', 'Professional', 'Homemaker'],
      '50s': ['Executive', 'Business owner', 'Government employee', 'Professional'],
      '60+': ['Retiree', 'Business owner', 'Part-time worker'],
    };

    const mockTraitsKo = ['분석적', '창의적', '사교적', '실용적', '트렌디한', '꼼꼼한', '검소한'];
    const mockTraitsEn = ['Analytical', 'Creative', 'Sociable', 'Practical', 'Trendy', 'Detail-oriented', 'Frugal'];

    const mockLocationsKo = ['서울시 강남구', '서울시 마포구', '부산시 해운대구', '경기도 성남시'];
    const mockLocationsEn = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'San Francisco, CA'];

    const mockEducationsKo = ['고등학교 졸업', '대학교 재학', '대학교 졸업', '대학원 졸업'];
    const mockEducationsEn = ['High school graduate', 'College student', 'Bachelor\'s degree', 'Master\'s degree'];

    const mockIncomeLevelsKo = ['하', '중하', '중', '중상', '상'];
    const mockIncomeLevelsEn = ['low', 'lower-middle', 'middle', 'upper-middle', 'high'];

    const mockNames = locale === 'en' ? mockNamesEn : mockNamesKo;
    const mockOccupations = locale === 'en' ? mockOccupationsEn : mockOccupationsKo;
    const mockTraits = locale === 'en' ? mockTraitsEn : mockTraitsKo;
    const mockLocations = locale === 'en' ? mockLocationsEn : mockLocationsKo;
    const mockEducations = locale === 'en' ? mockEducationsEn : mockEducationsKo;
    const mockIncomeLevels = locale === 'en' ? mockIncomeLevelsEn : mockIncomeLevelsKo;

    const dailyPattern = locale === 'en'
      ? 'Focuses on work during weekdays and enjoys hobbies on weekends. Frequently shops online.'
      : '평일에는 업무에 집중하고, 주말에는 취미 활동을 즐깁니다. 온라인 쇼핑을 자주 이용합니다.';

    const strengths = locale === 'en'
      ? ['Quick adaptability', 'Logical thinking', 'Communication skills']
      : ['빠른 적응력', '논리적 사고', '커뮤니케이션 능력'];

    const weaknesses = locale === 'en'
      ? ['Impulse buying tendency', 'Difficulty managing stress']
      : ['충동구매 경향', '스트레스 관리 어려움'];

    const description = locale === 'en'
      ? 'Interested in quality products and follows trends through social media. Seeks balance between value and quality.'
      : '품질 좋은 제품에 관심이 많으며, SNS를 통해 트렌드를 파악합니다. 가성비와 품질 사이에서 균형을 찾으려 합니다.';

    return Array.from({ length: count }, (_, i) => {
      const gender = i % 2 === 0 ? 'male' : 'female';
      const names = mockNames[gender];
      const ageGroup = ageGroups[i % ageGroups.length];
      return {
        name: names[i % names.length],
        ageGroup,
        gender,
        occupation: mockOccupations[ageGroup][i % mockOccupations[ageGroup].length],
        location: mockLocations[i % mockLocations.length],
        education: mockEducations[i % mockEducations.length],
        incomeLevel: mockIncomeLevels[i % mockIncomeLevels.length],
        personalityTraits: mockTraits.slice(0, 3 + (i % 2)),
        dailyPattern,
        strengths,
        weaknesses,
        description,
      };
    });
  }
}
