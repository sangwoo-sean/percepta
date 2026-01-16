import { Injectable } from '@nestjs/common';
import { AIProvider, AIFeedbackResponse } from './ai-provider.interface';
import { Persona } from '../personas/entities/persona.entity';
import { FeedbackResult } from '../feedback/entities/feedback-result.entity';

@Injectable()
export class MockAIService implements AIProvider {
  async generateFeedback(
    content: string,
    persona: Persona,
  ): Promise<AIFeedbackResponse> {
    // Fixed mock response for local development
    return {
      feedbackText: `[${persona.name}의 피드백] 이 콘텐츠에 대해 ${persona.ageGroup} ${persona.occupation}의 관점에서 평가하자면, 전반적으로 흥미로운 아이디어입니다. ${persona.personalityTraits.join(', ')}한 성향을 고려했을 때, 실용성과 접근성 측면에서 개선의 여지가 있어 보입니다.`,
      sentiment: 'neutral',
      purchaseIntent: 'medium',
      keyPoints: ['흥미로운 아이디어', '실용성 개선 필요', '타겟 고객 명확화 필요'],
      score: 3.5,
    };
  }

  async generateSummary(
    content: string,
    results: FeedbackResult[],
  ): Promise<string> {
    const avgScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + Number(r.score), 0) / results.length
        : 0;
    const sentiments = results.map((r) => r.sentiment);
    const positiveCount = sentiments.filter((s) => s === 'positive').length;

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
}
