import { Persona, PersonaData, AgeGroup } from '../personas/entities/persona.entity';
import { FeedbackResult, Sentiment, PurchaseIntent } from '../feedback/entities/feedback-result.entity';

export interface AIFeedbackResponse {
  feedbackText: string;
  sentiment: Sentiment;
  purchaseIntent: PurchaseIntent;
  keyPoints: string[];
  score: number;
}

export interface AICallContext {
  userId?: string;
  sessionId?: string;
  imageUrls?: string[];
}

export interface AIProvider {
  generateFeedback(content: string, persona: Persona, context?: AICallContext): Promise<AIFeedbackResponse>;
  generateSummary(content: string, results: FeedbackResult[], context?: AICallContext): Promise<string>;
  generatePersonas(ageGroups: AgeGroup[], count: number, context?: AICallContext): Promise<PersonaData[]>;
}

export const AI_PROVIDER = 'AI_PROVIDER';
