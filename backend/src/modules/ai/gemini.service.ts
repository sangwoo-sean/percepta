import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Persona, PersonaData, AgeGroup } from '../personas/entities/persona.entity';
import { FeedbackResult, Sentiment, PurchaseIntent } from '../feedback/entities/feedback-result.entity';
import { AIProvider, AIFeedbackResponse, AICallContext } from './ai-provider.interface';
import { AiLogService } from './ai-log.service';

@Injectable()
export class GeminiService implements AIProvider {
  private ai: GoogleGenAI;
  private modelName = 'gemini-3-flash-preview';

  constructor(
    private configService: ConfigService,
    private aiLogService: AiLogService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    this.ai = new GoogleGenAI({ apiKey });
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

  async generateFeedback(content: string, persona: Persona, context?: AICallContext): Promise<AIFeedbackResponse> {
    const startTime = Date.now();
    const personaPrompt = this.buildPersonaPrompt(persona);
    let responseText: string | undefined;

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
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const text = response.text;
      responseText = text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Invalid JSON response from Gemini API: ${text.substring(0, 500)}`);
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const result: AIFeedbackResponse = {
        feedbackText: parsed.feedbackText || '',
        sentiment: this.validateSentiment(parsed.sentiment),
        purchaseIntent: this.validatePurchaseIntent(parsed.purchaseIntent),
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        score: Math.min(5, Math.max(1, Number(parsed.score) || 3)),
      };

      await this.aiLogService.log({
        userId: context?.userId,
        operationType: 'feedback',
        model: this.modelName,
        inputPrompt: prompt,
        outputResponse: text,
        parsedResult: result as unknown as Record<string, unknown>,
        metadata: {
          sessionId: context?.sessionId,
          personaId: persona.id,
          personaName: persona.name,
          contentPreview: content.substring(0, 200),
        },
        status: 'success',
        responseTimeMs: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.aiLogService.log({
        userId: context?.userId,
        operationType: 'feedback',
        model: this.modelName,
        inputPrompt: prompt,
        outputResponse: responseText,
        metadata: {
          sessionId: context?.sessionId,
          personaId: persona.id,
          personaName: persona.name,
          contentPreview: content.substring(0, 200),
        },
        status: 'error',
        errorMessage,
        responseTimeMs,
      });

      console.error('Gemini API error:', error);
      throw new Error('AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  async generateSummary(content: string, results: FeedbackResult[], context?: AICallContext): Promise<string> {
    const startTime = Date.now();
    let responseText: string | undefined;
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
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const text = response.text;
      responseText = text;
      const summary = text || '요약을 생성할 수 없습니다.';

      await this.aiLogService.log({
        userId: context?.userId,
        operationType: 'summary',
        model: this.modelName,
        inputPrompt: prompt,
        outputResponse: text,
        metadata: {
          sessionId: context?.sessionId,
          resultCount: results.length,
          contentPreview: content.substring(0, 200),
        },
        status: 'success',
        responseTimeMs: Date.now() - startTime,
      });

      return summary;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.aiLogService.log({
        userId: context?.userId,
        operationType: 'summary',
        model: this.modelName,
        inputPrompt: prompt,
        outputResponse: responseText,
        metadata: {
          sessionId: context?.sessionId,
          resultCount: results.length,
          contentPreview: content.substring(0, 200),
        },
        status: 'error',
        errorMessage,
        responseTimeMs,
      });

      console.error('Gemini API error:', error);
      throw new Error('AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  async generatePersonas(ageGroups: AgeGroup[], count: number, context?: AICallContext): Promise<PersonaData[]> {
    const startTime = Date.now();
    let responseText: string | undefined;
    const ageGroupKorean: Record<AgeGroup, string> = {
      '10s': '10대',
      '20s': '20대',
      '30s': '30대',
      '40s': '40대',
      '50s': '50대',
      '60+': '60대 이상',
    };

    const ageGroupsKorean = ageGroups.map((ag) => ageGroupKorean[ag]).join(', ');

    const prompt = `당신은 한국의 다양한 소비자 페르소나를 생성하는 전문가입니다.

다음 조건에 맞는 ${count}명의 페르소나를 생성해주세요:
- 연령대: ${ageGroupsKorean} (이 연령대들 중에서 골고루 분배해서 생성해주세요)

각 페르소나에 대해 다음 정보를 생성해주세요:
1. name: 한국식 이름 (성 + 이름)
2. ageGroup: 연령대 ("10s", "20s", "30s", "40s", "50s", "60+" 중 하나)
3. gender: 성별 ("male" 또는 "female")
4. occupation: 해당 연령대에 적합한 현실적인 직업
5. location: 거주지역 (시/구 단위, 예: "서울시 강남구")
6. education: 학력
7. incomeLevel: 소득수준 ("하", "중하", "중", "중상", "상")
8. personalityTraits: 3-5개의 성격 특성
9. dailyPattern: 일상 패턴 2-3문장
10. strengths: 3-4개의 강점
11. weaknesses: 2-3개의 약점
12. description: 소비 성향, 관심사 2-3문장

JSON 배열 형식으로만 응답해주세요.
예시:
[
  {
    "name": "김민준",
    "ageGroup": "20s",
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
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      });

      const text = response.text;
      responseText = text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error(`Invalid JSON array response from Gemini API: ${text.substring(0, 500)}`);
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const validAgeGroups: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];
      const result = parsed.map((item: Record<string, unknown>, index: number) => ({
        name: (item.name as string) || '무명',
        ageGroup: validAgeGroups.includes(item.ageGroup as AgeGroup) ? (item.ageGroup as AgeGroup) : ageGroups[index % ageGroups.length],
        gender: item.gender === 'male' || item.gender === 'female' ? item.gender : undefined,
        occupation: (item.occupation as string) || '직장인',
        location: item.location as string,
        education: item.education as string,
        incomeLevel: item.incomeLevel as string,
        personalityTraits: Array.isArray(item.personalityTraits) ? item.personalityTraits : [],
        dailyPattern: item.dailyPattern as string,
        strengths: Array.isArray(item.strengths) ? item.strengths : [],
        weaknesses: Array.isArray(item.weaknesses) ? item.weaknesses : [],
        description: item.description as string,
      }));

      await this.aiLogService.log({
        userId: context?.userId,
        operationType: 'persona_generation',
        model: this.modelName,
        inputPrompt: prompt,
        outputResponse: text,
        parsedResult: { personas: result },
        metadata: {
          ageGroups,
          requestedCount: count,
          generatedCount: result.length,
        },
        status: 'success',
        responseTimeMs: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.aiLogService.log({
        userId: context?.userId,
        operationType: 'persona_generation',
        model: this.modelName,
        inputPrompt: prompt,
        outputResponse: responseText,
        metadata: {
          ageGroups,
          requestedCount: count,
        },
        status: 'error',
        errorMessage,
        responseTimeMs,
      });

      console.error('Gemini API error:', error);
      throw new Error('AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  private validateSentiment(value: string): Sentiment {
    const valid: Sentiment[] = ['positive', 'neutral', 'negative'];
    return valid.includes(value as Sentiment) ? (value as Sentiment) : 'neutral';
  }

  private validatePurchaseIntent(value: string): PurchaseIntent {
    const valid: PurchaseIntent[] = ['high', 'medium', 'low', 'none'];
    return valid.includes(value as PurchaseIntent) ? (value as PurchaseIntent) : 'medium';
  }
}
