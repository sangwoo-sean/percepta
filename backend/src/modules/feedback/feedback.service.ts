import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackSession } from './entities/feedback-session.entity';
import { FeedbackResult } from './entities/feedback-result.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { PersonasService } from '../personas/personas.service';
import { AIProvider, AI_PROVIDER } from '../ai/ai-provider.interface';
import { UsersService } from '../users/users.service';

const CREDITS_PER_PERSONA = 1;
const DEFAULT_CONCURRENCY = 4;

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  private readonly concurrency: number;

  constructor(
    @InjectRepository(FeedbackSession)
    private readonly sessionsRepository: Repository<FeedbackSession>,
    @InjectRepository(FeedbackResult)
    private readonly resultsRepository: Repository<FeedbackResult>,
    private readonly personasService: PersonasService,
    @Inject(AI_PROVIDER)
    private readonly aiProvider: AIProvider,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.concurrency = this.configService.get<number>('FEEDBACK_CONCURRENCY', DEFAULT_CONCURRENCY);
    this.logger.log(`Feedback concurrency set to ${this.concurrency}`);
  }

  /**
   * 동시성 제한을 적용하여 태스크들을 병렬 실행
   */
  private async runWithConcurrency<T>(
    tasks: (() => Promise<T>)[],
    concurrency: number,
  ): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = new Array(tasks.length);
    let currentIndex = 0;

    const worker = async (): Promise<void> => {
      while (currentIndex < tasks.length) {
        const index = currentIndex++;
        try {
          const value = await tasks[index]();
          results[index] = { status: 'fulfilled', value };
        } catch (reason) {
          results[index] = { status: 'rejected', reason };
        }
      }
    };

    const workers = Array(Math.min(concurrency, tasks.length))
      .fill(null)
      .map(() => worker());

    await Promise.all(workers);
    return results;
  }

  async findSessionsByUserId(userId: string): Promise<FeedbackSession[]> {
    return this.sessionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['results', 'results.persona'],
    });
  }

  async findSessionById(id: string): Promise<FeedbackSession | null> {
    return this.sessionsRepository.findOne({
      where: { id },
      relations: ['results', 'results.persona'],
    });
  }

  async findSessionByIdOrFail(id: string): Promise<FeedbackSession> {
    const session = await this.findSessionById(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  async createSession(userId: string, dto: CreateSessionDto): Promise<FeedbackSession> {
    const user = await this.usersService.findByIdOrFail(userId);
    const creditsNeeded = dto.personaIds.length * CREDITS_PER_PERSONA;

    if (user.credits < creditsNeeded) {
      throw new BadRequestException(
        `Insufficient credits. Need ${creditsNeeded}, have ${user.credits}`,
      );
    }

    // Validate all personas exist and belong to user
    const personas = await Promise.all(
      dto.personaIds.map((id) => this.personasService.findByIdOrFail(id)),
    );

    for (const persona of personas) {
      if (persona.userId !== userId) {
        throw new NotFoundException(`Persona with ID ${persona.id} not found`);
      }
    }

    const session = this.sessionsRepository.create({
      userId,
      inputType: dto.inputType,
      inputContent: dto.inputContent,
      inputUrl: dto.inputUrl,
      inputImageUrls: dto.inputImageUrls || [],
      status: 'pending',
      creditsUsed: creditsNeeded,
    });

    await this.sessionsRepository.save(session);

    // Deduct credits
    await this.usersService.deductCredits(userId, creditsNeeded, {
      transactionType: 'deduct_feedback_session',
      referenceId: session.id,
      referenceType: 'feedback_session',
      description: `피드백 세션 생성 (페르소나 ${dto.personaIds.length}개)`,
      metadata: { personaIds: dto.personaIds },
    });

    return session;
  }

  async generateFeedback(
    sessionId: string,
    userId: string,
    personaIds?: string[],
    locale?: string,
  ): Promise<FeedbackResult[]> {
    const session = await this.findSessionByIdOrFail(sessionId);

    if (session.userId !== userId) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    await this.sessionsRepository.update(sessionId, { status: 'processing' });

    const targetPersonaIds = personaIds || [];

    this.logger.log(
      `Generating feedback for ${targetPersonaIds.length} personas with concurrency ${this.concurrency}`,
    );

    // 각 페르소나에 대한 피드백 생성 태스크 정의
    const tasks = targetPersonaIds.map((personaId) => async (): Promise<FeedbackResult> => {
      const persona = await this.personasService.findByIdOrFail(personaId);

      const aiResponse = await this.aiProvider.generateFeedback(
        session.inputContent,
        persona,
        { userId, sessionId, imageUrls: session.inputImageUrls || [], locale: locale || 'ko' },
      );

      const result = this.resultsRepository.create({
        session,
        persona,
        feedbackText: aiResponse.feedbackText,
        sentiment: aiResponse.sentiment,
        purchaseIntent: aiResponse.purchaseIntent,
        keyPoints: aiResponse.keyPoints,
        score: aiResponse.score,
      });

      await this.resultsRepository.save(result);
      return result;
    });

    // 병렬 실행 (concurrency 제한 적용)
    const settledResults = await this.runWithConcurrency(tasks, this.concurrency);

    // 결과 분류
    const results: FeedbackResult[] = [];
    let failedCount = 0;

    settledResults.forEach((settled, index) => {
      if (settled.status === 'fulfilled') {
        results.push(settled.value);
      } else {
        failedCount++;
        this.logger.error(
          `Failed to generate feedback for persona ${targetPersonaIds[index]}: ${
            settled.reason instanceof Error ? settled.reason.message : 'Unknown error'
          }`,
        );
      }
    });

    // Refund credits for failed personas
    if (failedCount > 0) {
      const refundAmount = failedCount * CREDITS_PER_PERSONA;
      await this.usersService.refundCredits(userId, refundAmount, {
        transactionType: 'refund_feedback_partial',
        referenceId: sessionId,
        referenceType: 'feedback_session',
        description: `피드백 생성 실패 환불 (페르소나 ${failedCount}개)`,
        metadata: { failedCount, totalPersonas: targetPersonaIds.length },
      });
      await this.sessionsRepository.update(sessionId, {
        creditsUsed: session.creditsUsed - refundAmount,
      });
      this.logger.log(`Refunded ${refundAmount} credits for ${failedCount} failed persona(s)`);
    }

    const finalStatus = results.length > 0 ? 'completed' : 'failed';
    await this.sessionsRepository.update(sessionId, { status: finalStatus });

    return results;
  }

  async generateSummary(sessionId: string, userId: string, locale?: string): Promise<string> {
    const session = await this.findSessionByIdOrFail(sessionId);

    if (session.userId !== userId) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (!session.results || session.results.length === 0) {
      throw new BadRequestException('No feedback results to summarize');
    }

    const summary = await this.aiProvider.generateSummary(
      session.inputContent,
      session.results,
      { userId, sessionId, locale: locale || 'ko' },
    );

    await this.sessionsRepository.update(sessionId, { summary });

    return summary;
  }
}
