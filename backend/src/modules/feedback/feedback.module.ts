import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackSession } from './entities/feedback-session.entity';
import { FeedbackResult } from './entities/feedback-result.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { PersonasModule } from '../personas/personas.module';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedbackSession, FeedbackResult]),
    PersonasModule,
    AiModule,
    UsersModule,
  ],
  providers: [FeedbackService],
  controllers: [FeedbackController],
  exports: [FeedbackService],
})
export class FeedbackModule {}
