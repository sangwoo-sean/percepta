import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FeedbackResult } from './feedback-result.entity';

export type InputType = 'file' | 'url' | 'text';
export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity('feedback_sessions')
export class FeedbackSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.feedbackSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'input_type' })
  inputType: InputType;

  @Column({ name: 'input_content', type: 'text' })
  inputContent: string;

  @Column({ name: 'input_url', nullable: true })
  inputUrl: string | null;

  @Column({ default: 'pending' })
  status: SessionStatus;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ name: 'credits_used', default: 0 })
  creditsUsed: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => FeedbackResult, (result) => result.session)
  results: FeedbackResult[];
}
