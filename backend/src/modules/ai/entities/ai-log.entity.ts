import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type OperationType = 'feedback' | 'summary' | 'persona_generation';
export type LogStatus = 'success' | 'error';

@Entity('ai_logs')
export class AiLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'operation_type' })
  operationType: OperationType;

  @Column()
  model: string;

  @Column({ name: 'input_prompt', type: 'text' })
  inputPrompt: string;

  @Column({ name: 'output_response', type: 'text', nullable: true })
  outputResponse: string | null;

  @Column({ name: 'parsed_result', type: 'jsonb', nullable: true })
  parsedResult: Record<string, unknown> | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @Column({ default: 'success' })
  status: LogStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'response_time_ms' })
  responseTimeMs: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
