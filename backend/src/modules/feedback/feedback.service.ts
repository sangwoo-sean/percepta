import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackSession } from './entities/feedback-session.entity';
import { FeedbackResult } from './entities/feedback-result.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { PersonasService } from '../personas/personas.service';
import { AIProvider, AI_PROVIDER } from '../ai/ai-provider.interface';
import { UsersService } from '../users/users.service';

const CREDITS_PER_PERSONA = 1;

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackSession)
    private readonly sessionsRepository: Repository<FeedbackSession>,
    @InjectRepository(FeedbackResult)
    private readonly resultsRepository: Repository<FeedbackResult>,
    private readonly personasService: PersonasService,
    @Inject(AI_PROVIDER)
    private readonly aiProvider: AIProvider,
    private readonly usersService: UsersService,
  ) {}

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
      status: 'pending',
      creditsUsed: creditsNeeded,
    });

    await this.sessionsRepository.save(session);

    // Deduct credits
    await this.usersService.deductCredits(userId, creditsNeeded);

    return session;
  }

  async generateFeedback(
    sessionId: string,
    userId: string,
    personaIds?: string[],
  ): Promise<FeedbackResult[]> {
    const session = await this.findSessionByIdOrFail(sessionId);

    if (session.userId !== userId) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    await this.sessionsRepository.update(sessionId, { status: 'processing' });

    try {
      const targetPersonaIds = personaIds || [];
      const results: FeedbackResult[] = [];

      for (const personaId of targetPersonaIds) {
        const persona = await this.personasService.findByIdOrFail(personaId);

        const aiResponse = await this.aiProvider.generateFeedback(
          session.inputContent,
          persona,
          { userId, sessionId },
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
        results.push(result);
      }

      await this.sessionsRepository.update(sessionId, { status: 'completed' });

      return results;
    } catch (error) {
      await this.sessionsRepository.update(sessionId, { status: 'failed' });
      throw error;
    }
  }

  async generateSummary(sessionId: string, userId: string): Promise<string> {
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
      { userId, sessionId },
    );

    await this.sessionsRepository.update(sessionId, { summary });

    return summary;
  }
}
