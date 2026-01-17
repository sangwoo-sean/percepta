import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreditTransaction } from './entities/credit-transaction.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, CreditTransaction])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
