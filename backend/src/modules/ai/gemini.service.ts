import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Schema, Type, Part } from '@google/genai';
import axios from 'axios';
import { Persona, PersonaData, AgeGroup } from '../personas/entities/persona.entity';
import { FeedbackResult, Sentiment, PurchaseIntent } from '../feedback/entities/feedback-result.entity';
import { AIProvider, AIFeedbackResponse, AICallContext } from './ai-provider.interface';
import { AiLogService } from './ai-log.service';

const FEEDBACK_SCHEMA_KO: Schema = {
  type: Type.OBJECT,
  properties: {
    feedbackText: { type: Type.STRING, description: '상세한 피드백 내용 (200-500자)' },
    sentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] },
    purchaseIntent: { type: Type.STRING, enum: ['high', 'medium', 'low', 'none'] },
    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: '핵심 포인트 3개' },
    score: { type: Type.NUMBER, description: '1-5 사이의 점수 (소수점 1자리까지)' },
  },
  required: ['feedbackText', 'sentiment', 'purchaseIntent', 'keyPoints', 'score'],
};

const FEEDBACK_SCHEMA_EN: Schema = {
  type: Type.OBJECT,
  properties: {
    feedbackText: { type: Type.STRING, description: 'Detailed feedback content (200-500 characters)' },
    sentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] },
    purchaseIntent: { type: Type.STRING, enum: ['high', 'medium', 'low', 'none'] },
    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 key points' },
    score: { type: Type.NUMBER, description: 'Score between 1-5 (up to 1 decimal place)' },
  },
  required: ['feedbackText', 'sentiment', 'purchaseIntent', 'keyPoints', 'score'],
};

const PERSONA_SCHEMA_KO: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: '한국식 이름 (성 + 이름)' },
      ageGroup: { type: Type.STRING, enum: ['10s', '20s', '30s', '40s', '50s', '60+'] },
      gender: { type: Type.STRING, enum: ['male', 'female'] },
      occupation: { type: Type.STRING, description: '직업' },
      location: { type: Type.STRING, description: '거주지역 (시/구 단위)' },
      education: { type: Type.STRING, description: '학력' },
      incomeLevel: { type: Type.STRING, enum: ['하', '중하', '중', '중상', '상'] },
      personalityTraits: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5개의 성격 특성' },
      dailyPattern: { type: Type.STRING, description: '일상 패턴 2-3문장' },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4개의 강점' },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3개의 약점' },
      description: { type: Type.STRING, description: '소비 성향, 관심사 2-3문장' },
    },
    required: ['name', 'ageGroup', 'gender', 'occupation', 'personalityTraits', 'description'],
  },
};

const PERSONA_SCHEMA_EN: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Western-style name (first name + last name)' },
      ageGroup: { type: Type.STRING, enum: ['10s', '20s', '30s', '40s', '50s', '60+'] },
      gender: { type: Type.STRING, enum: ['male', 'female'] },
      occupation: { type: Type.STRING, description: 'Occupation' },
      location: { type: Type.STRING, description: 'Location (city/state level)' },
      education: { type: Type.STRING, description: 'Education level' },
      incomeLevel: { type: Type.STRING, enum: ['low', 'lower-middle', 'middle', 'upper-middle', 'high'] },
      personalityTraits: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5 personality traits' },
      dailyPattern: { type: Type.STRING, description: 'Daily routine in 2-3 sentences' },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 strengths' },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3 weaknesses' },
      description: { type: Type.STRING, description: 'Consumption habits and interests in 2-3 sentences' },
    },
    required: ['name', 'ageGroup', 'gender', 'occupation', 'personalityTraits', 'description'],
  },
};

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

  private buildPersonaPrompt(persona: Persona, locale: string = 'ko'): string {
    if (locale === 'en') {
      return `You are a persona with the following characteristics:
- Name: ${persona.name}
- Age group: ${persona.ageGroup}
- Occupation: ${persona.occupation}
- Personality traits: ${persona.personalityTraits.join(', ')}
${persona.description ? `- Additional description: ${persona.description}` : ''}

Please provide feedback on the given content from this persona's perspective.`;
    }

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
    const locale = context?.locale || 'ko';
    const personaPrompt = this.buildPersonaPrompt(persona, locale);
    let responseText: string | undefined;
    const imageUrls = context?.imageUrls || [];
    const hasImages = imageUrls.length > 0;

    const imageInstruction = hasImages
      ? locale === 'en'
        ? `\n\nPlease also analyze the ${imageUrls.length} attached image(s). Evaluate the design, content, and usability comprehensively.`
        : `\n\n첨부된 ${imageUrls.length}개의 이미지도 함께 분석해주세요. 이미지의 디자인, 내용, 사용성 등을 종합적으로 평가해주세요.`
      : '';

    const feedbackInstruction = locale === 'en'
      ? `Please evaluate the following content:

---
${content}
---${imageInstruction}

Provide detailed feedback (200-500 characters) along with sentiment (positive/neutral/negative), purchase intent, 3 key points, and a score from 1-5.`
      : `다음 콘텐츠에 대해 평가해주세요:

---
${content}
---${imageInstruction}

200-500자 분량의 상세한 피드백과 함께 감정(긍정/중립/부정), 구매 의향, 핵심 포인트 3개, 1-5점 점수를 제공해주세요.`;

    const prompt = `${personaPrompt}

${feedbackInstruction}`;
    const feedbackSchema = locale === 'en' ? FEEDBACK_SCHEMA_EN : FEEDBACK_SCHEMA_KO;

    try {
      // Build content parts for multimodal request
      const contentParts: Part[] = [{ text: prompt }];

      if (hasImages) {
        for (const imageUrl of imageUrls) {
          try {
            const imageData = await this.fetchImageAsBase64(imageUrl);
            contentParts.push({
              inlineData: {
                data: imageData.data,
                mimeType: imageData.mimeType,
              },
            });
          } catch (error) {
            console.warn(`Skipping image ${imageUrl} due to fetch error`);
          }
        }
      }

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: contentParts,
        config: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          responseSchema: feedbackSchema,
        },
      });

      const text = response.text;
      responseText = text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      const parsed = JSON.parse(text);

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
          imageCount: imageUrls.length,
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
          imageCount: imageUrls.length,
        },
        status: 'error',
        errorMessage,
        responseTimeMs,
      });

      console.error('Gemini API error:', error);
      const userErrorMessage = locale === 'en'
        ? 'The AI service is temporarily unavailable. Please try again later.'
        : 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      throw new Error(userErrorMessage);
    }
  }

  async generateSummary(content: string, results: FeedbackResult[], context?: AICallContext): Promise<string> {
    const startTime = Date.now();
    const locale = context?.locale || 'ko';
    let responseText: string | undefined;
    const feedbackSummaries = results.map((r) => ({
      persona: r.persona?.name || 'Unknown',
      sentiment: r.sentiment,
      purchaseIntent: r.purchaseIntent,
      score: r.score,
      keyPoints: r.keyPoints,
    }));

    const prompt = locale === 'en'
      ? `The following is feedback from multiple personas on the content.

Original content:
${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}

Feedback results:
${JSON.stringify(feedbackSummaries, null, 2)}

Please compile the feedback above into an analysis summary that includes:
1. Overall evaluation
2. Commonly mentioned positive aspects
3. Commonly mentioned areas for improvement
4. Recommended target audience
5. Suggested next steps

Please write approximately 500-800 characters.`
      : `다음은 여러 페르소나로부터 받은 콘텐츠 피드백입니다.

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
          maxOutputTokens: 8192,
        },
      });

      const text = response.text;
      responseText = text;
      const fallbackMessage = locale === 'en' ? 'Unable to generate summary.' : '요약을 생성할 수 없습니다.';
      const summary = text || fallbackMessage;

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
      const summaryError = locale === 'en'
        ? 'The AI service is temporarily unavailable. Please try again later.'
        : 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      throw new Error(summaryError);
    }
  }

  async generatePersonas(ageGroups: AgeGroup[], count: number, context?: AICallContext): Promise<PersonaData[]> {
    const startTime = Date.now();
    const locale = context?.locale || 'ko';
    let responseText: string | undefined;

    const ageGroupKorean: Record<AgeGroup, string> = {
      '10s': '10대',
      '20s': '20대',
      '30s': '30대',
      '40s': '40대',
      '50s': '50대',
      '60+': '60대 이상',
    };

    const ageGroupEnglish: Record<AgeGroup, string> = {
      '10s': 'teens',
      '20s': '20s',
      '30s': '30s',
      '40s': '40s',
      '50s': '50s',
      '60+': '60+',
    };

    const prompt = locale === 'en'
      ? `You are an expert at creating diverse consumer personas.

Please create ${count} personas that meet the following criteria:
- Age groups: ${ageGroups.map((ag) => ageGroupEnglish[ag]).join(', ')} (distribute evenly among these age groups)
- Each persona should be a realistic and specific consumer.`
      : `당신은 한국의 다양한 소비자 페르소나를 생성하는 전문가입니다.

다음 조건에 맞는 ${count}명의 페르소나를 생성해주세요:
- 연령대: ${ageGroups.map((ag) => ageGroupKorean[ag]).join(', ')} (이 연령대들 중에서 골고루 분배)
- 각 페르소나는 현실적이고 구체적인 한국인 소비자여야 합니다.`;

    const personaSchema = locale === 'en' ? PERSONA_SCHEMA_EN : PERSONA_SCHEMA_KO;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          responseSchema: personaSchema,
        },
      });

      const text = response.text;
      responseText = text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      const parsed = JSON.parse(text);

      const validAgeGroups: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];
      const defaultName = locale === 'en' ? 'Unknown' : '무명';
      const defaultOccupation = locale === 'en' ? 'Professional' : '직장인';
      const result = parsed.map((item: Record<string, unknown>, index: number) => ({
        name: (item.name as string) || defaultName,
        ageGroup: validAgeGroups.includes(item.ageGroup as AgeGroup) ? (item.ageGroup as AgeGroup) : ageGroups[index % ageGroups.length],
        gender: item.gender === 'male' || item.gender === 'female' ? item.gender : undefined,
        occupation: (item.occupation as string) || defaultOccupation,
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
      const personaError = locale === 'en'
        ? 'The AI service is temporarily unavailable. Please try again later.'
        : 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      throw new Error(personaError);
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

  private async fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');
      const contentType = response.headers['content-type'] || this.getMimeTypeFromUrl(url);

      return {
        data: base64,
        mimeType: contentType,
      };
    } catch (error) {
      console.error(`Failed to fetch image from ${url}:`, error);
      throw new Error(`Failed to fetch image: ${url}`);
    }
  }

  private getMimeTypeFromUrl(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[ext || ''] || 'image/jpeg';
  }
}
