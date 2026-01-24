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

interface AuthenticatedUser {
  id: string;
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
    const user = req.user as AuthenticatedUser;
    const checkoutUrl = await this.paymentsService.createCheckoutUrl(
      user.id,
      dto.packageName,
    );
    return { checkoutUrl };
  }

  @Post('webhook')
  @UseGuards(LemonSqueezyWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() event: unknown): Promise<{ received: boolean }> {
    const webhookEvent = event as {
      meta: { event_name: string; custom_data?: { user_id?: string } };
      data: { id: string; attributes: { first_order_item: { variant_id: number }; total: number; currency: string; status: string } };
    };

    const safeLogPayload = {
      eventName: webhookEvent.meta?.event_name,
      orderId: webhookEvent.data?.id,
      status: webhookEvent.data?.attributes?.status,
    };
    this.logger.log(`Received webhook: ${JSON.stringify(safeLogPayload)}`);

    const eventName = webhookEvent.meta.event_name;

    switch (eventName) {
      case 'order_created':
        await this.paymentsService.handleOrderCreated(webhookEvent);
        break;
      case 'order_refunded':
        await this.paymentsService.handleOrderRefunded(webhookEvent);
        break;
      default:
        this.logger.log(`Ignoring event: ${eventName}`);
    }

    return { received: true };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.paymentsService.getPaymentHistory(user.id);
  }
}
