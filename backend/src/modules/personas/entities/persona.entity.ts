import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FeedbackResult } from '../../feedback/entities/feedback-result.entity';

export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60+';

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.personas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'age_group' })
  ageGroup: AgeGroup;

  @Column()
  occupation: string;

  @Column({ type: 'jsonb', name: 'personality_traits', default: [] })
  personalityTraits: string[];

  @Column({ nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => FeedbackResult, (result) => result.persona)
  feedbackResults: FeedbackResult[];
}
