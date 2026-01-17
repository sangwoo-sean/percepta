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

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.personas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb' })
  data: PersonaData;

  @Column({ name: 'storage_url', type: 'varchar', nullable: true })
  storageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => FeedbackResult, (result) => result.persona)
  feedbackResults: FeedbackResult[];

  // Helper getters for backward compatibility and convenience
  get name(): string {
    return this.data?.name ?? '';
  }

  get avatarUrl(): string | null {
    return this.data?.avatarUrl ?? null;
  }

  get ageGroup(): AgeGroup {
    return this.data?.ageGroup ?? '20s';
  }

  get occupation(): string {
    return this.data?.occupation ?? '';
  }

  get personalityTraits(): string[] {
    return this.data?.personalityTraits ?? [];
  }

  get description(): string | null {
    return this.data?.description ?? null;
  }
}
