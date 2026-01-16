import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: 'test-key',
                SUPABASE_BUCKET: 'uploads',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scrapeUrl', () => {
    it('should scrape content from URL', async () => {
      const mockHtml = `
        <html>
          <head><title>Test Page</title></head>
          <body>
            <script>console.log('test');</script>
            <style>.test { color: red; }</style>
            <p>Hello World</p>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({ data: mockHtml });

      const result = await service.scrapeUrl('https://example.com');

      expect(result.title).toBe('Test Page');
      expect(result.content).toContain('Hello World');
      expect(result.content).not.toContain('console.log');
      expect(result.url).toBe('https://example.com');
    });

    it('should throw BadRequestException on network error', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
      };
      mockedAxios.get.mockRejectedValue(mockError);
      (mockedAxios as any).isAxiosError = () => true;

      await expect(service.scrapeUrl('https://invalid.url')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
