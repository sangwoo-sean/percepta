import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type PaymentStatus = 'completed' | 'refunded';
export type PackageName = 'basic' | 'large' | 'premium';

@Entity('payment_records')
export class PaymentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index({ unique: true })
  @Column({ name: 'lemon_squeezy_order_id', type: 'varchar' })
  lemonSqueezyOrderId: string;

  @Column({ name: 'variant_id', type: 'varchar' })
  variantId: string;

  @Column({ name: 'package_name', type: 'varchar' })
  packageName: PackageName;

  @Column({ name: 'credits_amount', type: 'integer' })
  creditsAmount: number;

  @Column({ name: 'amount_paid', type: 'integer' })
  amountPaid: number;

  @Column({ type: 'varchar', default: 'KRW' })
  currency: string;

  @Column({ type: 'varchar', default: 'completed' })
  status: PaymentStatus;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
