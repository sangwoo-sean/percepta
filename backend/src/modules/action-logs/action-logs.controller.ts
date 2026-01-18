import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ActionLogsService } from './action-logs.service';
import { CreateActionLogDto } from './dto/create-action-log.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('action-logs')
export class ActionLogsController {
  constructor(private readonly actionLogsService: ActionLogsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async create(
    @Body() dto: CreateActionLogDto,
    @CurrentUser() user: User | null,
    @Req() req: Request,
  ): Promise<void> {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] ?? null;

    await this.actionLogsService.log(dto, {
      userId: user?.id ?? null,
      ipAddress,
      userAgent,
    });
  }

  private extractIpAddress(req: Request): string | null {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips.trim();
    }
    return req.ip ?? null;
  }
}
