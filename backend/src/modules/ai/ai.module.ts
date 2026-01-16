import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { MockAIService } from './mock-ai.service';
import { AI_PROVIDER } from './ai-provider.interface';

const aiProviderFactory = {
  provide: AI_PROVIDER,
  useFactory: (configService: ConfigService) => {
    const mockAI = configService.get<string>('MOCK_AI') === 'true';
    const geminiApiKey = configService.get<string>('GEMINI_API_KEY');

    // Use MockAIService if MOCK_AI=true or no Gemini API key is set
    if (mockAI || !geminiApiKey) {
      return new MockAIService();
    }
    return new GeminiService(configService);
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [aiProviderFactory, GeminiService, MockAIService],
  exports: [AI_PROVIDER, GeminiService],
})
export class AiModule {}
