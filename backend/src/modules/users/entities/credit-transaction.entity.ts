import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type TransactionType =
  | 'deduct_persona_generation'
  | 'refund_persona_generation'
  | 'deduct_feedback_session'
  | 'refund_feedback_partial'
  | 'admin_add'
  | 'admin_deduct'
  | 'purchase_credits';

export type ReferenceType = 'feedback_session' | 'persona' | 'payment_record';

@Entity('credit_transactions')
export class CreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'transaction_type', type: 'varchar' })
  transactionType: TransactionType;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ name: 'balance_before', type: 'integer' })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'integer' })
  balanceAfter: number;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({ name: 'reference_type', type: 'varchar', nullable: true })
  referenceType: ReferenceType | null;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
