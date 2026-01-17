import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiLog, OperationType, LogStatus } from './entities/ai-log.entity';

export interface AiLogData {
  userId?: string | null;
  operationType: OperationType;
  model: string;
  inputPrompt: string;
  outputResponse?: string | null;
  parsedResult?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  status: LogStatus;
  errorMessage?: string | null;
  responseTimeMs: number;
}

@Injectable()
export class AiLogService {
  private readonly logger = new Logger(AiLogService.name);

  constructor(
    @InjectRepository(AiLog)
    private readonly aiLogRepository: Repository<AiLog>,
  ) {}

  async log(data: AiLogData): Promise<AiLog> {
    try {
      const aiLog = this.aiLogRepository.create({
        userId: data.userId ?? null,
        operationType: data.operationType,
        model: data.model,
        inputPrompt: data.inputPrompt,
        outputResponse: data.outputResponse ?? null,
        parsedResult: data.parsedResult ?? null,
        metadata: data.metadata ?? {},
        status: data.status,
        errorMessage: data.errorMessage ?? null,
        responseTimeMs: data.responseTimeMs,
      });

      return await this.aiLogRepository.save(aiLog);
    } catch (error) {
      this.logger.error('Failed to save AI log', error);
      throw error;
    }
  }
}
