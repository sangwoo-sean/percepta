import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { Persona } from '../personas/entities/persona.entity';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeminiService', () => {
  let service: GeminiService;

  const mockPersona: Partial<Persona> = {
    id: 'persona-uuid',
    name: '민준',
    ageGroup: '20s',
    occupation: '대학생',
    personalityTraits: ['호기심이 많은', '분석적인'],
    description: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
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
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      feedbackText: '좋은 아이디어입니다',
                      sentiment: 'positive',
                      purchaseIntent: 'high',
                      keyPoints: ['혁신적', '실용적'],
                      score: 4.5,
                    }),
                  },
                ],
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.generateFeedback(
        '새로운 앱 아이디어입니다',
        mockPersona as Persona,
      );

      expect(result.feedbackText).toBe('좋은 아이디어입니다');
      expect(result.sentiment).toBe('positive');
      expect(result.purchaseIntent).toBe('high');
      expect(result.score).toBe(4.5);
    });

    it('should return mock response on API error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      const result = await service.generateFeedback(
        '새로운 앱 아이디어입니다',
        mockPersona as Persona,
      );

      expect(result.feedbackText).toContain(mockPersona.name);
      expect(result.sentiment).toBe('neutral');
    });
  });

  describe('generateSummary', () => {
    it('should generate summary from Gemini API', async () => {
      const mockResponse = {
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: '종합 분석 결과입니다.' }],
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

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

    it('should return mock summary on API error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

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

      expect(result).toContain('종합 분석 요약');
    });
  });
});
