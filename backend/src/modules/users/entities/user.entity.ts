import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Persona } from '../../personas/entities/persona.entity';
import { FeedbackSession } from '../../feedback/entities/feedback-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'google_id', nullable: true })
  googleId: string | null;

  @Column({ default: 10 })
  credits: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Persona, (persona) => persona.user)
  personas: Persona[];

  @OneToMany(() => FeedbackSession, (session) => session.user)
  feedbackSessions: FeedbackSession[];
}
