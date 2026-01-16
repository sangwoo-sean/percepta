import { Persona } from '../personas/entities/persona.entity';
import { FeedbackResult, Sentiment, PurchaseIntent } from '../feedback/entities/feedback-result.entity';

export interface AIFeedbackResponse {
  feedbackText: string;
  sentiment: Sentiment;
  purchaseIntent: PurchaseIntent;
  keyPoints: string[];
  score: number;
}

export interface AIProvider {
  generateFeedback(content: string, persona: Persona): Promise<AIFeedbackResponse>;
  generateSummary(content: string, results: FeedbackResult[]): Promise<string>;
}

export const AI_PROVIDER = 'AI_PROVIDER';
