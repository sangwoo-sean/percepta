import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackSession } from './entities/feedback-session.entity';
import { FeedbackResult } from './entities/feedback-result.entity';
import { PersonasService } from '../personas/personas.service';
import { AIProvider, AI_PROVIDER } from '../ai/ai-provider.interface';
import { UsersService } from '../users/users.service';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let sessionsRepository: jest.Mocked<Repository<FeedbackSession>>;
  let resultsRepository: jest.Mocked<Repository<FeedbackResult>>;
  let personasService: jest.Mocked<PersonasService>;
  let aiProvider: jest.Mocked<AIProvider>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    name: 'Test User',
    credits: 10,
  };

  const mockPersona = {
    id: 'persona-uuid',
    userId: 'user-uuid',
    name: '민준',
    ageGroup: '20s' as const,
    occupation: '대학생',
    personalityTraits: ['호기심이 많은'],
  };

  const mockSession: FeedbackSession = {
    id: 'session-uuid',
    userId: 'user-uuid',
    inputType: 'text',
    inputContent: '새로운 모바일 앱 아이디어입니다',
    inputUrl: null,
    inputImageUrls: [],
    status: 'pending',
    summary: null,
    creditsUsed: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {} as any,
    results: [],
  };

  const mockFeedbackResult: FeedbackResult = {
    id: 'result-uuid',
    sessionId: 'session-uuid',
    personaId: 'persona-uuid',
    feedbackText: '흥미로운 아이디어입니다',
    sentiment: 'positive',
    purchaseIntent: 'high',
    keyPoints: ['편리함', '혁신적'],
    score: 4.5,
    createdAt: new Date(),
    session: {} as any,
    persona: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(FeedbackSession),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(FeedbackResult),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PersonasService,
          useValue: {
            findByIdOrFail: jest.fn(),
          },
        },
        {
          provide: AI_PROVIDER,
          useValue: {
            generateFeedback: jest.fn(),
            generateSummary: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByIdOrFail: jest.fn(),
            deductCredits: jest.fn(),
            refundCredits: jest.fn(),
            addCredits: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    sessionsRepository = module.get(getRepositoryToken(FeedbackSession));
    resultsRepository = module.get(getRepositoryToken(FeedbackResult));
    personasService = module.get(PersonasService);
    aiProvider = module.get(AI_PROVIDER);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findSessionsByUserId', () => {
    it('should return sessions for a user', async () => {
      sessionsRepository.find.mockResolvedValue([mockSession]);

      const result = await service.findSessionsByUserId('user-uuid');

      expect(result).toEqual([mockSession]);
    });
  });

  describe('createSession', () => {
    it('should create a session and deduct credits', async () => {
      usersService.findByIdOrFail.mockResolvedValue(mockUser as any);
      personasService.findByIdOrFail.mockResolvedValue(mockPersona as any);
      sessionsRepository.create.mockReturnValue(mockSession);
      sessionsRepository.save.mockResolvedValue(mockSession);

      const dto = {
        inputType: 'text' as const,
        inputContent: '새로운 아이디어',
        personaIds: ['persona-uuid'],
      };

      const result = await service.createSession('user-uuid', dto);

      expect(result).toEqual(mockSession);
      expect(usersService.deductCredits).toHaveBeenCalledWith('user-uuid', 1, expect.objectContaining({
        transactionType: 'deduct_feedback_session',
        referenceType: 'feedback_session',
      }));
    });

    it('should throw BadRequestException when insufficient credits', async () => {
      usersService.findByIdOrFail.mockResolvedValue({ ...mockUser, credits: 0 } as any);

      const dto = {
        inputType: 'text' as const,
        inputContent: '새로운 아이디어',
        personaIds: ['persona-uuid'],
      };

      await expect(service.createSession('user-uuid', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('generateFeedback', () => {
    it('should generate feedback for personas', async () => {
      sessionsRepository.findOne.mockResolvedValue(mockSession);
      sessionsRepository.save.mockResolvedValue(mockSession);
      personasService.findByIdOrFail.mockResolvedValue(mockPersona as any);
      aiProvider.generateFeedback.mockResolvedValue({
        feedbackText: '좋은 아이디어입니다',
        sentiment: 'positive',
        purchaseIntent: 'high',
        keyPoints: ['편리함'],
        score: 4.5,
      });
      resultsRepository.create.mockReturnValue(mockFeedbackResult);
      resultsRepository.save.mockResolvedValue(mockFeedbackResult);

      const result = await service.generateFeedback(
        'session-uuid',
        'user-uuid',
        ['persona-uuid'],
      );

      expect(result).toHaveLength(1);
      expect(aiProvider.generateFeedback).toHaveBeenCalled();
    });

    it('should throw NotFoundException when session not owned by user', async () => {
      sessionsRepository.findOne.mockResolvedValue({
        ...mockSession,
        userId: 'other-user',
      });

      await expect(
        service.generateFeedback('session-uuid', 'user-uuid', ['persona-uuid']),
      ).rejects.toThrow(NotFoundException);
    });

    it('should continue and return successful results when some personas fail', async () => {
      const sessionWithCredits = { ...mockSession, creditsUsed: 3 };
      sessionsRepository.findOne.mockResolvedValue(sessionWithCredits);
      personasService.findByIdOrFail
        .mockResolvedValueOnce(mockPersona as any)
        .mockRejectedValueOnce(new Error('Persona not found'))
        .mockResolvedValueOnce({ ...mockPersona, id: 'persona-3' } as any);
      aiProvider.generateFeedback
        .mockResolvedValueOnce({
          feedbackText: '첫 번째 피드백',
          sentiment: 'positive',
          purchaseIntent: 'high',
          keyPoints: ['좋음'],
          score: 4.0,
        })
        .mockResolvedValueOnce({
          feedbackText: '세 번째 피드백',
          sentiment: 'neutral',
          purchaseIntent: 'medium',
          keyPoints: ['보통'],
          score: 3.0,
        });
      resultsRepository.create.mockReturnValue(mockFeedbackResult);
      resultsRepository.save.mockResolvedValue(mockFeedbackResult);

      const result = await service.generateFeedback(
        'session-uuid',
        'user-uuid',
        ['persona-1', 'persona-2', 'persona-3'],
      );

      expect(result).toHaveLength(2);
      expect(usersService.refundCredits).toHaveBeenCalledWith('user-uuid', 1, expect.objectContaining({
        transactionType: 'refund_feedback_partial',
        referenceType: 'feedback_session',
      }));
      expect(sessionsRepository.update).toHaveBeenCalledWith('session-uuid', {
        creditsUsed: 2,
      });
    });

    it('should set status to failed and refund all credits when all personas fail', async () => {
      const sessionWithCredits = { ...mockSession, creditsUsed: 2 };
      sessionsRepository.findOne.mockResolvedValue(sessionWithCredits);
      personasService.findByIdOrFail.mockRejectedValue(new Error('Persona not found'));

      const result = await service.generateFeedback(
        'session-uuid',
        'user-uuid',
        ['persona-1', 'persona-2'],
      );

      expect(result).toHaveLength(0);
      expect(usersService.refundCredits).toHaveBeenCalledWith('user-uuid', 2, expect.objectContaining({
        transactionType: 'refund_feedback_partial',
        referenceType: 'feedback_session',
      }));
      expect(sessionsRepository.update).toHaveBeenCalledWith('session-uuid', {
        creditsUsed: 0,
      });
      expect(sessionsRepository.update).toHaveBeenLastCalledWith('session-uuid', {
        status: 'failed',
      });
    });
  });

  describe('generateSummary', () => {
    it('should generate summary for session', async () => {
      const sessionWithResults = {
        ...mockSession,
        results: [mockFeedbackResult],
      };
      sessionsRepository.findOne.mockResolvedValue(sessionWithResults);
      sessionsRepository.save.mockResolvedValue(sessionWithResults);
      aiProvider.generateSummary.mockResolvedValue('종합 분석 결과입니다');

      const result = await service.generateSummary('session-uuid', 'user-uuid');

      expect(result).toBe('종합 분석 결과입니다');
    });

    it('should throw BadRequestException when no results', async () => {
      sessionsRepository.findOne.mockResolvedValue(mockSession);

      await expect(
        service.generateSummary('session-uuid', 'user-uuid'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
