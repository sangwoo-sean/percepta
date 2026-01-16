import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeedbackSession } from './feedback-session.entity';
import { Persona } from '../../personas/entities/persona.entity';

export type Sentiment = 'positive' | 'neutral' | 'negative';
export type PurchaseIntent = 'high' | 'medium' | 'low' | 'none';

@Entity('feedback_results')
export class FeedbackResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => FeedbackSession, (session) => session.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: FeedbackSession;

  @Column({ name: 'persona_id' })
  personaId: string;

  @ManyToOne(() => Persona, (persona) => persona.feedbackResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ name: 'feedback_text', type: 'text' })
  feedbackText: string;

  @Column()
  sentiment: Sentiment;

  @Column({ name: 'purchase_intent' })
  purchaseIntent: PurchaseIntent;

  @Column({ type: 'jsonb', name: 'key_points', default: [] })
  keyPoints: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
