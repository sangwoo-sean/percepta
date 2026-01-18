import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class LemonSqueezyWebhookGuard implements CanActivate {
  private readonly logger = new Logger(LemonSqueezyWebhookGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-signature'] as string;

    if (!signature) {
      this.logger.warn('Missing x-signature header');
      throw new UnauthorizedException('Missing signature');
    }

    const webhookSecret = this.configService.get<string>('LEMON_SQUEEZY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.error('LEMON_SQUEEZY_WEBHOOK_SECRET not configured');
      throw new UnauthorizedException('Webhook secret not configured');
    }

    const rawBody = (request as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      this.logger.error('Raw body not available for signature verification');
      throw new UnauthorizedException('Raw body not available');
    }

    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(rawBody).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      this.logger.warn('Invalid webhook signature');
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
