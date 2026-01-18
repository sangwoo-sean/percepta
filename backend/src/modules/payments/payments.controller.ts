import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LemonSqueezyWebhookGuard } from './guards/lemon-squeezy-webhook.guard';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

interface JwtPayload {
  sub: string;
  email: string;
}

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Req() req: Request,
    @Body() dto: CreateCheckoutDto,
  ): Promise<{ checkoutUrl: string }> {
    const user = req.user as JwtPayload;
    const checkoutUrl = await this.paymentsService.createCheckoutUrl(
      user.sub,
      dto.packageName,
    );
    return { checkoutUrl };
  }

  @Post('webhook')
  @UseGuards(LemonSqueezyWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() event: unknown): Promise<{ received: boolean }> {
    this.logger.log(`Received webhook: ${JSON.stringify(event)}`);

    const webhookEvent = event as {
      meta: { event_name: string; custom_data?: { user_id?: string } };
      data: { id: string; attributes: { first_order_item: { variant_id: number }; total: number; currency: string; status: string } };
    };

    if (webhookEvent.meta.event_name === 'order_created') {
      await this.paymentsService.handleOrderCreated(webhookEvent);
    } else {
      this.logger.log(`Ignoring event: ${webhookEvent.meta.event_name}`);
    }

    return { received: true };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.paymentsService.getPaymentHistory(user.sub);
  }
}
