export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  credits: number;
  createdAt: string;
}

export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60+';
export type Gender = 'male' | 'female';

export interface PersonaData {
  name: string;
  avatarUrl?: string;
  ageGroup: AgeGroup;
  gender?: Gender;
  occupation: string;
  location?: string;
  education?: string;
  incomeLevel?: string;
  personalityTraits: string[];
  dailyPattern?: string;
  strengths?: string[];
  weaknesses?: string[];
  description?: string;
}

export interface Persona {
  id: string;
  userId: string;
  data: PersonaData;
  storageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonaDto {
  data: {
    name?: string;
    ageGroup: AgeGroup;
    gender?: Gender;
    occupation: string;
    location?: string;
    education?: string;
    incomeLevel?: string;
    personalityTraits?: string[];
    dailyPattern?: string;
    strengths?: string[];
    weaknesses?: string[];
    description?: string;
  };
}

export interface GeneratePersonasDto {
  ageGroups: AgeGroup[];
  count: number;
}

export interface UpdatePersonaDto {
  data: {
    name?: string;
    ageGroup?: AgeGroup;
    gender?: Gender;
    occupation?: string;
    location?: string;
    education?: string;
    incomeLevel?: string;
    personalityTraits?: string[];
    dailyPattern?: string;
    strengths?: string[];
    weaknesses?: string[];
    description?: string;
  };
}

export type InputType = 'file' | 'url' | 'text' | 'image';
export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type PurchaseIntent = 'high' | 'medium' | 'low' | 'none';

export interface FeedbackSession {
  id: string;
  userId: string;
  inputType: InputType;
  inputContent: string;
  inputUrl: string | null;
  inputImageUrls: string[];
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
  inputImageUrls?: string[];
  personaIds: string[];
}

export interface PersonaStats {
  total: number;
  byAgeGroup: Record<AgeGroup, number>;
  byGender: Record<'male' | 'female' | 'unknown', number>;
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

export type TransactionType =
  | 'deduct_persona_generation'
  | 'refund_persona_generation'
  | 'deduct_feedback_session'
  | 'refund_feedback_partial'
  | 'admin_add'
  | 'admin_deduct'
  | 'purchase_credits';

export type ReferenceType = 'feedback_session' | 'persona' | 'payment_record';

export interface CreditTransaction {
  id: string;
  userId: string;
  transactionType: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string | null;
  referenceType: ReferenceType | null;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PersonaFilterState {
  ageGroups: AgeGroup[];
  genders: Gender[];
}

export type PaymentStatus = 'completed' | 'refunded';
export type PackageName = 'basic' | 'large' | 'premium';

export interface PaymentRecord {
  id: string;
  userId: string;
  lemonSqueezyOrderId: string;
  variantId: string;
  packageName: PackageName;
  creditsAmount: number;
  amountPaid: number;
  currency: string;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
}
