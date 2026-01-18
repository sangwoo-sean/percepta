import {
  Injectable,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentRecord, PackageName } from './entities/payment-record.entity';
import { UsersService } from '../users/users.service';

interface PackageConfig {
  variantId: string;
  credits: number;
  price: number;
}

interface LemonSqueezyOrderData {
  id: string;
  attributes: {
    first_order_item: {
      variant_id: number;
    };
    total: number;
    currency: string;
    status: string;
  };
}

interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: LemonSqueezyOrderData;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly packageConfigs: Record<PackageName, PackageConfig>;
  private readonly variantToPackage: Map<string, PackageName>;

  constructor(
    @InjectRepository(PaymentRecord)
    private readonly paymentRecordRepository: Repository<PaymentRecord>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.packageConfigs = {
      basic: {
        variantId: this.configService.get<string>('LS_BASIC_VARIANT_ID', ''),
        credits: 200,
        price: 2000,
      },
      large: {
        variantId: this.configService.get<string>('LS_LARGE_VARIANT_ID', ''),
        credits: 500,
        price: 4500,
      },
      premium: {
        variantId: this.configService.get<string>('LS_PREMIUM_VARIANT_ID', ''),
        credits: 1000,
        price: 8000,
      },
    };

    this.variantToPackage = new Map();
    for (const [packageName, config] of Object.entries(this.packageConfigs)) {
      if (config.variantId) {
        this.variantToPackage.set(config.variantId, packageName as PackageName);
      }
    }
  }

  async createCheckoutUrl(userId: string, packageName: PackageName): Promise<string> {
    const packageConfig = this.packageConfigs[packageName];
    if (!packageConfig || !packageConfig.variantId) {
      throw new BadRequestException(`Invalid package: ${packageName}`);
    }

    const storeId = this.configService.get<string>('LEMON_SQUEEZY_STORE_ID');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    const checkoutUrl = new URL(`https://percepta.lemonsqueezy.com/buy/${packageConfig.variantId}`);
    checkoutUrl.searchParams.set('checkout[custom][user_id]', userId);
    checkoutUrl.searchParams.set('checkout[success_url]', `${frontendUrl}/payment/success`);
    checkoutUrl.searchParams.set('checkout[cancel_url]', `${frontendUrl}/payment/cancel`);

    this.logger.log(`Created checkout URL for user ${userId}, package ${packageName}`);

    return checkoutUrl.toString();
  }

  async handleOrderCreated(event: LemonSqueezyWebhookEvent): Promise<void> {
    const orderId = event.data.id;
    const userId = event.meta.custom_data?.user_id;

    if (!userId) {
      this.logger.error(`Order ${orderId} missing user_id in custom_data`);
      throw new BadRequestException('Missing user_id in webhook custom_data');
    }

    const existingRecord = await this.paymentRecordRepository.findOne({
      where: { lemonSqueezyOrderId: orderId },
    });

    if (existingRecord) {
      this.logger.warn(`Duplicate webhook for order ${orderId}, skipping`);
      return;
    }

    const variantId = String(event.data.attributes.first_order_item.variant_id);
    const packageName = this.variantToPackage.get(variantId);

    if (!packageName) {
      this.logger.error(`Unknown variant ID: ${variantId}`);
      throw new BadRequestException(`Unknown variant ID: ${variantId}`);
    }

    const packageConfig = this.packageConfigs[packageName];

    const paymentRecord = this.paymentRecordRepository.create({
      userId,
      lemonSqueezyOrderId: orderId,
      variantId,
      packageName,
      creditsAmount: packageConfig.credits,
      amountPaid: event.data.attributes.total,
      currency: event.data.attributes.currency,
      status: 'completed',
      metadata: event as unknown as Record<string, unknown>,
    });

    await this.paymentRecordRepository.save(paymentRecord);
    this.logger.log(`Payment record created for order ${orderId}`);

    await this.usersService.addCredits(userId, packageConfig.credits, {
      transactionType: 'purchase_credits',
      referenceId: paymentRecord.id,
      referenceType: 'payment_record',
      description: `Purchased ${packageName} package (${packageConfig.credits} credits)`,
      metadata: {
        packageName,
        lemonSqueezyOrderId: orderId,
        amountPaid: event.data.attributes.total,
        currency: event.data.attributes.currency,
      },
    });

    this.logger.log(`Added ${packageConfig.credits} credits to user ${userId}`);
  }

  async getPaymentHistory(userId: string): Promise<PaymentRecord[]> {
    return this.paymentRecordRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
