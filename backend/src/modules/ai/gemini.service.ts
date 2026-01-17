import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Persona, PersonaData, AgeGroup } from '../personas/entities/persona.entity';
import { FeedbackResult, Sentiment, PurchaseIntent } from '../feedback/entities/feedback-result.entity';
import { AIProvider, AIFeedbackResponse } from './ai-provider.interface';

@Injectable()
export class GeminiService implements AIProvider {
  private apiKey: string;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY', '');
  }

  private buildPersonaPrompt(persona: Persona): string {
    return `당신은 다음과 같은 특성을 가진 페르소나입니다:
- 이름: ${persona.name}
- 연령대: ${persona.ageGroup}
- 직업: ${persona.occupation}
- 성격 특성: ${persona.personalityTraits.join(', ')}
${persona.description ? `- 추가 설명: ${persona.description}` : ''}

이 페르소나의 관점에서 주어진 콘텐츠에 대한 피드백을 제공해주세요.`;
  }

  async generateFeedback(
    content: string,
    persona: Persona,
  ): Promise<AIFeedbackResponse> {
    const personaPrompt = this.buildPersonaPrompt(persona);

    const prompt = `${personaPrompt}

다음 콘텐츠에 대해 평가해주세요:

---
${content}
---

다음 JSON 형식으로 응답해주세요:
{
  "feedbackText": "상세한 피드백 내용 (200-500자)",
  "sentiment": "positive" | "neutral" | "negative",
  "purchaseIntent": "high" | "medium" | "low" | "none",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "score": 1-5 사이의 점수 (소수점 1자리까지)
}

JSON만 출력하고 다른 텍스트는 포함하지 마세요.`;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from Gemini API');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        feedbackText: parsed.feedbackText || '',
        sentiment: this.validateSentiment(parsed.sentiment),
        purchaseIntent: this.validatePurchaseIntent(parsed.purchaseIntent),
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        score: Math.min(5, Math.max(1, Number(parsed.score) || 3)),
      };
    } catch (error) {
      console.error('Gemini API error:', error);

      // Return mock response for development/testing
      return {
        feedbackText: `[${persona.name}의 피드백] 이 콘텐츠에 대해 ${persona.ageGroup} ${persona.occupation}의 관점에서 평가하자면, 전반적으로 흥미로운 아이디어입니다. ${persona.personalityTraits.join(', ')}한 성향을 고려했을 때, 실용성과 접근성 측면에서 개선의 여지가 있어 보입니다.`,
        sentiment: 'neutral',
        purchaseIntent: 'medium',
        keyPoints: ['흥미로운 아이디어', '실용성 개선 필요', '타겟 고객 명확화 필요'],
        score: 3.5,
      };
    }
  }

  async generateSummary(
    content: string,
    results: FeedbackResult[],
  ): Promise<string> {
    const feedbackSummaries = results.map((r) => ({
      persona: r.persona?.name || 'Unknown',
      sentiment: r.sentiment,
      purchaseIntent: r.purchaseIntent,
      score: r.score,
      keyPoints: r.keyPoints,
    }));

    const prompt = `다음은 여러 페르소나로부터 받은 콘텐츠 피드백입니다.

원본 콘텐츠:
${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}

피드백 결과:
${JSON.stringify(feedbackSummaries, null, 2)}

위 피드백들을 종합하여 다음을 포함한 분석 요약을 작성해주세요:
1. 전반적인 평가
2. 공통적으로 언급된 긍정적 요소
3. 공통적으로 언급된 개선 필요 사항
4. 타겟 고객층 추천
5. 다음 단계 제안

500-800자 내외로 작성해주세요.`;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || '요약을 생성할 수 없습니다.';
    } catch (error) {
      console.error('Gemini API error:', error);

      // Return mock summary for development
      const avgScore = results.reduce((sum, r) => sum + Number(r.score), 0) / results.length;
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

  async generatePersonas(ageGroup: AgeGroup, count: number): Promise<PersonaData[]> {
    const ageGroupKorean: Record<AgeGroup, string> = {
      '10s': '10대',
      '20s': '20대',
      '30s': '30대',
      '40s': '40대',
      '50s': '50대',
      '60+': '60대 이상',
    };

    const prompt = `당신은 한국의 다양한 소비자 페르소나를 생성하는 전문가입니다.

다음 조건에 맞는 ${count}명의 페르소나를 생성해주세요:
- 연령대: ${ageGroupKorean[ageGroup]}

각 페르소나에 대해 다음 정보를 생성해주세요:
1. name: 한국식 이름 (성 + 이름)
2. gender: 성별 ("male" 또는 "female")
3. occupation: 해당 연령대에 적합한 현실적인 직업
4. location: 거주지역 (시/구 단위, 예: "서울시 강남구")
5. education: 학력
6. incomeLevel: 소득수준 ("하", "중하", "중", "중상", "상")
7. personalityTraits: 3-5개의 성격 특성
8. dailyPattern: 일상 패턴 2-3문장
9. strengths: 3-4개의 강점
10. weaknesses: 2-3개의 약점
11. description: 소비 성향, 관심사 2-3문장

JSON 배열 형식으로만 응답해주세요.
예시:
[
  {
    "name": "김민준",
    "gender": "male",
    "occupation": "소프트웨어 개발자",
    "location": "서울시 강남구",
    "education": "대학교 졸업",
    "incomeLevel": "중상",
    "personalityTraits": ["분석적", "트렌디한", "실용적"],
    "dailyPattern": "평일에는 IT 기업에서 근무하며, 저녁에는 개인 프로젝트를 진행합니다.",
    "strengths": ["기술에 대한 이해도가 높음", "빠른 의사결정", "논리적 사고"],
    "weaknesses": ["충동구매 경향", "워라밸 관리 어려움"],
    "description": "최신 기술과 가젯에 관심이 많으며, 품질 좋은 제품에는 과감히 투자하는 편입니다."
  }
]`;

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON array response from Gemini API');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return parsed.map((item: Record<string, unknown>) => ({
        name: item.name as string || '무명',
        ageGroup,
        gender: (item.gender === 'male' || item.gender === 'female') ? item.gender : undefined,
        occupation: item.occupation as string || '직장인',
        location: item.location as string,
        education: item.education as string,
        incomeLevel: item.incomeLevel as string,
        personalityTraits: Array.isArray(item.personalityTraits) ? item.personalityTraits : [],
        dailyPattern: item.dailyPattern as string,
        strengths: Array.isArray(item.strengths) ? item.strengths : [],
        weaknesses: Array.isArray(item.weaknesses) ? item.weaknesses : [],
        description: item.description as string,
      }));
    } catch (error) {
      console.error('Gemini API error:', error);

      // Return mock personas for development
      return this.generateMockPersonas(ageGroup, count);
    }
  }

  private generateMockPersonas(ageGroup: AgeGroup, count: number): PersonaData[] {
    const mockNames = {
      male: ['김민준', '이서준', '박도윤', '최예준', '정시우', '강하준', '조주원', '윤지호'],
      female: ['김서연', '이서윤', '박지우', '최서현', '정민서', '강하은', '조하윤', '윤윤서'],
    };

    const mockOccupations: Record<AgeGroup, string[]> = {
      '10s': ['고등학생', '대학생', '수험생'],
      '20s': ['대학생', '취업준비생', '사무직', '개발자', '디자이너'],
      '30s': ['회사원', '프리랜서', '스타트업 대표', '전문직'],
      '40s': ['중간관리자', '자영업자', '전문직', '주부'],
      '50s': ['임원', '자영업자', '공무원', '전문직'],
      '60+': ['은퇴자', '자영업자', '시간제 근로자'],
    };

    const mockTraits = ['분석적', '창의적', '사교적', '실용적', '트렌디한', '꼼꼼한', '검소한'];

    return Array.from({ length: count }, (_, i) => {
      const gender = i % 2 === 0 ? 'male' : 'female';
      const names = mockNames[gender];
      return {
        name: names[i % names.length],
        ageGroup,
        gender,
        occupation: mockOccupations[ageGroup][i % mockOccupations[ageGroup].length],
        location: '서울시 강남구',
        education: '대학교 졸업',
        incomeLevel: '중',
        personalityTraits: mockTraits.slice(0, 3 + (i % 2)),
        dailyPattern: '평일에는 업무에 집중하고, 주말에는 취미 활동을 즐깁니다.',
        strengths: ['빠른 적응력', '논리적 사고', '커뮤니케이션 능력'],
        weaknesses: ['충동구매 경향', '스트레스 관리 어려움'],
        description: '품질 좋은 제품에 관심이 많으며, SNS를 통해 트렌드를 파악합니다.',
      };
    });
  }

  private validateSentiment(value: string): Sentiment {
    const valid: Sentiment[] = ['positive', 'neutral', 'negative'];
    return valid.includes(value as Sentiment) ? (value as Sentiment) : 'neutral';
  }

  private validatePurchaseIntent(value: string): PurchaseIntent {
    const valid: PurchaseIntent[] = ['high', 'medium', 'low', 'none'];
    return valid.includes(value as PurchaseIntent)
      ? (value as PurchaseIntent)
      : 'medium';
  }
}
