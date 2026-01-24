import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentRecord, PackageName } from './entities/payment-record.entity';
import { User } from '../users/entities/user.entity';
import { CreditTransaction } from '../users/entities/credit-transaction.entity';

interface PackageConfig {
  variantId: string;
  checkoutId: string;
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
    private readonly dataSource: DataSource,
  ) {
    this.packageConfigs = {
      basic: {
        variantId: this.configService.get<string>('LS_BASIC_VARIANT_ID', ''),
        checkoutId: this.configService.get<string>('LS_BASIC_CHECKOUT_ID', ''),
        credits: 200,
        price: 2000,
      },
      large: {
        variantId: this.configService.get<string>('LS_LARGE_VARIANT_ID', ''),
        checkoutId: this.configService.get<string>('LS_LARGE_CHECKOUT_ID', ''),
        credits: 500,
        price: 4500,
      },
      premium: {
        variantId: this.configService.get<string>('LS_PREMIUM_VARIANT_ID', ''),
        checkoutId: this.configService.get<string>('LS_PREMIUM_CHECKOUT_ID', ''),
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
    if (!packageConfig || !packageConfig.checkoutId) {
      throw new BadRequestException(`Invalid package: ${packageName}`);
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    const checkoutUrl = new URL(`https://percepta.lemonsqueezy.com/checkout/buy/${packageConfig.checkoutId}`);
    checkoutUrl.searchParams.set('checkout[custom][user_id]', userId);
    checkoutUrl.searchParams.set('checkout[success_url]', `${frontendUrl}/payment/success`);
    checkoutUrl.searchParams.set('checkout[cancel_url]', `${frontendUrl}/payment/cancel`);

    this.logger.log(`Created checkout URL for user ${userId}, package ${packageName}`);

    return checkoutUrl.toString();
  }

  async handleOrderCreated(event: LemonSqueezyWebhookEvent): Promise<void> {
    const orderId = event.data.id;
    const userId = event.meta.custom_data?.user_id;
    const orderStatus = event.data.attributes.status;

    if (!userId) {
      this.logger.error(`Order ${orderId} missing user_id in custom_data`);
      throw new BadRequestException('Missing user_id in webhook custom_data');
    }

    if (orderStatus !== 'paid') {
      this.logger.log(`Order ${orderId} status is '${orderStatus}', skipping (only 'paid' orders are processed)`);
      return;
    }

    const variantId = String(event.data.attributes.first_order_item.variant_id);
    const packageName = this.variantToPackage.get(variantId);

    if (!packageName) {
      this.logger.error(`Unknown variant ID: ${variantId}`);
      throw new BadRequestException(`Unknown variant ID: ${variantId}`);
    }

    const packageConfig = this.packageConfigs[packageName];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingRecord = await queryRunner.manager.findOne(PaymentRecord, {
        where: { lemonSqueezyOrderId: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (existingRecord) {
        await queryRunner.rollbackTransaction();
        this.logger.warn(`Duplicate webhook for order ${orderId}, skipping`);
        return;
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        this.logger.error(`Order ${orderId} has invalid user_id: ${userId}`);
        throw new BadRequestException('Invalid user_id in webhook custom_data');
      }

      const paymentRecord = queryRunner.manager.create(PaymentRecord, {
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

      await queryRunner.manager.save(paymentRecord);
      this.logger.log(`Payment record created for order ${orderId}`);

      const balanceBefore = user.credits;
      user.credits += packageConfig.credits;
      await queryRunner.manager.save(user);

      await this.recordCreditTransaction(queryRunner.manager, {
        userId,
        transactionType: 'purchase_credits',
        amount: packageConfig.credits,
        balanceBefore,
        balanceAfter: user.credits,
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

      await queryRunner.commitTransaction();
      this.logger.log(`Added ${packageConfig.credits} credits to user ${userId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to process order ${orderId}: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleOrderRefunded(event: LemonSqueezyWebhookEvent): Promise<void> {
    const orderId = event.data.id;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const paymentRecord = await queryRunner.manager.findOne(PaymentRecord, {
        where: { lemonSqueezyOrderId: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!paymentRecord) {
        await queryRunner.rollbackTransaction();
        this.logger.warn(`Refund webhook for unknown order ${orderId}, skipping`);
        return;
      }

      if (paymentRecord.status === 'refunded') {
        await queryRunner.rollbackTransaction();
        this.logger.warn(`Order ${orderId} already refunded at ${paymentRecord.metadata?.refundedAt}, skipping`);
        return;
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: paymentRecord.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        this.logger.error(`Refund for order ${orderId}: user ${paymentRecord.userId} not found`);
        throw new BadRequestException('User not found for refund');
      }

      const creditsToDeduct = Math.min(paymentRecord.creditsAmount, user.credits);
      if (creditsToDeduct < paymentRecord.creditsAmount) {
        this.logger.warn(
          `User ${paymentRecord.userId} has ${user.credits} credits but refund is for ${paymentRecord.creditsAmount}. Deducting available credits only.`
        );
      }

      paymentRecord.status = 'refunded';
      paymentRecord.metadata = {
        ...paymentRecord.metadata,
        refundEvent: event as unknown as Record<string, unknown>,
        refundedAt: new Date().toISOString(),
        originalCreditsAmount: paymentRecord.creditsAmount,
        actualCreditsDeducted: creditsToDeduct,
      };

      await queryRunner.manager.save(paymentRecord);
      this.logger.log(`Payment record ${orderId} marked as refunded`);

      const balanceBefore = user.credits;
      user.credits -= creditsToDeduct;
      await queryRunner.manager.save(user);

      await this.recordCreditTransaction(queryRunner.manager, {
        userId: paymentRecord.userId,
        transactionType: 'refund_purchase',
        amount: -creditsToDeduct,
        balanceBefore,
        balanceAfter: user.credits,
        referenceId: paymentRecord.id,
        referenceType: 'payment_record',
        description: `Refund for ${paymentRecord.packageName} package (${creditsToDeduct} credits deducted)`,
        metadata: {
          packageName: paymentRecord.packageName,
          lemonSqueezyOrderId: orderId,
          originalCreditsAmount: paymentRecord.creditsAmount,
          actualCreditsDeducted: creditsToDeduct,
        },
      });

      await queryRunner.commitTransaction();
      this.logger.log(`Deducted ${creditsToDeduct} credits from user ${paymentRecord.userId} due to refund`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to process refund for order ${orderId}: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPaymentHistory(userId: string): Promise<PaymentRecord[]> {
    return this.paymentRecordRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  private async recordCreditTransaction(
    manager: EntityManager,
    params: {
      userId: string;
      transactionType: 'purchase_credits' | 'refund_purchase';
      amount: number;
      balanceBefore: number;
      balanceAfter: number;
      referenceId: string;
      referenceType: 'payment_record';
      description: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<CreditTransaction> {
    const transaction = manager.create(CreditTransaction, {
      userId: params.userId,
      transactionType: params.transactionType,
      amount: params.amount,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      referenceId: params.referenceId,
      referenceType: params.referenceType,
      description: params.description,
      metadata: params.metadata,
    });

    return manager.save(transaction);
  }
}
