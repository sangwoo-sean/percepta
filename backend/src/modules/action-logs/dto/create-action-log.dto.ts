import { IsString, IsEnum, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ActionType } from '../entities/user-action-log.entity';

export class CreateActionLogDto {
  @IsString()
  @MaxLength(64)
  sessionId: string;

  @IsEnum([
    'page_view',
    'auth_login_start',
    'auth_login_success',
    'auth_login_failed',
    'auth_logout',
    'nav_language_change',
  ])
  action: ActionType;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  page?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
