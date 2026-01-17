import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from './gemini.service';
import { MockAIService } from './mock-ai.service';
import { AI_PROVIDER } from './ai-provider.interface';
import { AiLog } from './entities/ai-log.entity';
import { AiLogService } from './ai-log.service';

const aiProviderFactory = {
  provide: AI_PROVIDER,
  useFactory: (configService: ConfigService, aiLogService: AiLogService) => {
    const mockAI = configService.get<string>('MOCK_AI') === 'true';
    const geminiApiKey = configService.get<string>('GEMINI_API_KEY');

    // Use MockAIService if MOCK_AI=true or no Gemini API key is set
    if (mockAI || !geminiApiKey) {
      return new MockAIService();
    }
    return new GeminiService(configService, aiLogService);
  },
  inject: [ConfigService, AiLogService],
};

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AiLog])],
  providers: [aiProviderFactory, GeminiService, MockAIService, AiLogService],
  exports: [AI_PROVIDER, GeminiService, AiLogService],
})
export class AiModule {}
