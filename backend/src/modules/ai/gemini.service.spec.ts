import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { AiLogService } from './ai-log.service';
import { Persona } from '../personas/entities/persona.entity';

// Mock @google/genai
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    ARRAY: 'ARRAY',
  },
}));

describe('GeminiService', () => {
  let service: GeminiService;
  let mockAiLogService: jest.Mocked<AiLogService>;

  const mockPersona: Partial<Persona> = {
    id: 'persona-uuid',
    name: '민준',
    ageGroup: '20s',
    occupation: '대학생',
    personalityTraits: ['호기심이 많은', '분석적인'],
    description: null,
  };

  beforeEach(async () => {
    mockGenerateContent.mockClear();
    mockAiLogService = {
      log: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<AiLogService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
        {
          provide: AiLogService,
          useValue: mockAiLogService,
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateFeedback', () => {
    it('should generate feedback from Gemini API', async () => {
      const mockResponse = {
        text: JSON.stringify({
          feedbackText: '좋은 아이디어입니다',
          sentiment: 'positive',
          purchaseIntent: 'high',
          keyPoints: ['혁신적', '실용적'],
          score: 4.5,
        }),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateFeedback(
        '새로운 앱 아이디어입니다',
        mockPersona as Persona,
      );

      expect(result.feedbackText).toBe('좋은 아이디어입니다');
      expect(result.sentiment).toBe('positive');
      expect(result.purchaseIntent).toBe('high');
      expect(result.score).toBe(4.5);
    });

    it('should throw error and log on API failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(
        service.generateFeedback('새로운 앱 아이디어입니다', mockPersona as Persona),
      ).rejects.toThrow('AI 서비스에 일시적인 문제가 발생했습니다');

      expect(mockAiLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          operationType: 'feedback',
          status: 'error',
        }),
      );
    });

    it('should log successful feedback generation', async () => {
      const mockResponse = {
        text: JSON.stringify({
          feedbackText: '좋은 아이디어입니다',
          sentiment: 'positive',
          purchaseIntent: 'high',
          keyPoints: ['혁신적', '실용적'],
          score: 4.5,
        }),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      await service.generateFeedback('새로운 앱 아이디어입니다', mockPersona as Persona);

      expect(mockAiLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          operationType: 'feedback',
          status: 'success',
        }),
      );
    });
  });

  describe('generateSummary', () => {
    it('should generate summary from Gemini API', async () => {
      const mockResponse = {
        text: '종합 분석 결과입니다.',
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const mockResults = [
        {
          persona: { name: '민준' },
          sentiment: 'positive' as const,
          purchaseIntent: 'high' as const,
          score: 4.5,
          keyPoints: ['좋아요'],
        },
      ];

      const result = await service.generateSummary(
        '콘텐츠 내용',
        mockResults as any,
      );

      expect(result).toBe('종합 분석 결과입니다.');
    });

    it('should throw error and log on API failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const mockResults = [
        {
          persona: { name: '민준' },
          sentiment: 'positive' as const,
          purchaseIntent: 'high' as const,
          score: 4.5,
          keyPoints: ['좋아요'],
        },
      ];

      await expect(service.generateSummary('콘텐츠 내용', mockResults as any)).rejects.toThrow(
        'AI 서비스에 일시적인 문제가 발생했습니다',
      );

      expect(mockAiLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          operationType: 'summary',
          status: 'error',
        }),
      );
    });
  });

  describe('generatePersonas', () => {
    it('should generate personas from Gemini API', async () => {
      const mockResponse = {
        text: JSON.stringify([
          {
            name: '김민준',
            ageGroup: '20s',
            gender: 'male',
            occupation: '소프트웨어 개발자',
            location: '서울시 강남구',
            education: '대학교 졸업',
            incomeLevel: '중상',
            personalityTraits: ['분석적', '트렌디한', '실용적'],
            dailyPattern: '평일에는 IT 기업에서 근무합니다.',
            strengths: ['기술에 대한 이해도가 높음'],
            weaknesses: ['충동구매 경향'],
            description: '최신 기술에 관심이 많습니다.',
          },
        ]),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generatePersonas(['20s', '30s'], 1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('김민준');
      expect(result[0].ageGroup).toBe('20s');
      expect(result[0].occupation).toBe('소프트웨어 개발자');
    });

    it('should throw error and log on API failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(service.generatePersonas(['20s'], 1)).rejects.toThrow(
        'AI 서비스에 일시적인 문제가 발생했습니다',
      );

      expect(mockAiLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          operationType: 'persona_generation',
          status: 'error',
        }),
      );
    });

    it('should log successful persona generation', async () => {
      const mockResponse = {
        text: JSON.stringify([
          {
            name: '김민준',
            ageGroup: '20s',
            gender: 'male',
            occupation: '소프트웨어 개발자',
            personalityTraits: ['분석적'],
            description: '테스트 페르소나',
          },
        ]),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      await service.generatePersonas(['20s'], 1);

      expect(mockAiLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          operationType: 'persona_generation',
          status: 'success',
        }),
      );
    });
  });
});
