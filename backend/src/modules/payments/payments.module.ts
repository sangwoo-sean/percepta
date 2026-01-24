import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRecord } from './entities/payment-record.entity';
import { User } from '../users/entities/user.entity';
import { CreditTransaction } from '../users/entities/credit-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentRecord, User, CreditTransaction]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
