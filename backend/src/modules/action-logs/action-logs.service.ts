import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as geoip from 'geoip-lite';
import { UserActionLog } from './entities/user-action-log.entity';
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

  private getCountryFromIp(ip: string | null): string | null {
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return null;
    }
    const geo = geoip.lookup(ip);
    return geo?.country ?? null;
  }

  async log(dto: CreateActionLogDto, context: ActionLogContext): Promise<void> {
    try {
      const ipAddress = context.ipAddress ?? null;
      const country = this.getCountryFromIp(ipAddress);

      const actionLog = this.actionLogRepository.create({
        userId: context.userId ?? null,
        sessionId: dto.sessionId,
        action: dto.action,
        page: dto.page ?? null,
        metadata: dto.metadata ?? {},
        ipAddress,
        country,
        userAgent: context.userAgent ?? null,
      });

      await this.actionLogRepository.save(actionLog);
    } catch (error) {
      this.logger.error('Failed to save action log', error);
      // fire-and-forget: 에러를 전파하지 않음
    }
  }
}
