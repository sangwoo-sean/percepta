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

export type ActionType =
  | 'page_view'
  | 'auth_login_start'
  | 'auth_login_success'
  | 'auth_login_failed'
  | 'auth_logout'
  | 'nav_language_change';

@Entity('user_action_logs')
@Index(['userId', 'createdAt'])
@Index(['sessionId', 'createdAt'])
@Index(['action', 'createdAt'])
export class UserActionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_id', type: 'varchar', length: 64 })
  sessionId: string;

  @Column({ type: 'varchar', length: 50 })
  action: ActionType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  page: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
