export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  credits: number;
  createdAt: string;
}

export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60+';

export interface Persona {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  ageGroup: AgeGroup;
  occupation: string;
  personalityTraits: string[];
  description: string | null;
  createdAt: string;
}

export interface CreatePersonaDto {
  name?: string;
  ageGroup: AgeGroup;
  occupation: string;
  personalityTraits?: string[];
  description?: string;
}

export type InputType = 'file' | 'url' | 'text';
export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type PurchaseIntent = 'high' | 'medium' | 'low' | 'none';

export interface FeedbackSession {
  id: string;
  userId: string;
  inputType: InputType;
  inputContent: string;
  inputUrl: string | null;
  status: SessionStatus;
  summary: string | null;
  creditsUsed: number;
  createdAt: string;
  results: FeedbackResult[];
}

export interface FeedbackResult {
  id: string;
  sessionId: string;
  personaId: string;
  feedbackText: string;
  sentiment: Sentiment;
  purchaseIntent: PurchaseIntent;
  keyPoints: string[];
  score: number;
  createdAt: string;
  persona?: Persona;
}

export interface CreateSessionDto {
  inputType: InputType;
  inputContent: string;
  inputUrl?: string;
  personaIds: string[];
}

export interface PersonaStats {
  total: number;
  byAgeGroup: Record<AgeGroup, number>;
  byOccupation: Record<string, number>;
}

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
}
