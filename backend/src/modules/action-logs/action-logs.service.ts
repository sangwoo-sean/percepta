import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActionLog, ActionType } from './entities/user-action-log.entity';
import { CreateActionLogDto } from './dto/create-action-log.dto';

export interface ActionLogContext {
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class ActionLogsService {
  private readonly logger = new Logger(ActionLogsService.name);

  constructor(
    @InjectRepository(UserActionLog)
    private readonly actionLogRepository: Repository<UserActionLog>,
  ) {}

  async log(dto: CreateActionLogDto, context: ActionLogContext): Promise<void> {
    try {
      const actionLog = this.actionLogRepository.create({
        userId: context.userId ?? null,
        sessionId: dto.sessionId,
        action: dto.action,
        page: dto.page ?? null,
        metadata: dto.metadata ?? {},
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      });

      await this.actionLogRepository.save(actionLog);
    } catch (error) {
      this.logger.error('Failed to save action log', error);
      // fire-and-forget: 에러를 전파하지 않음
    }
  }
}
