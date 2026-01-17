import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import {
  CreditTransaction,
  TransactionType,
  ReferenceType,
} from './entities/credit-transaction.entity';

export interface CreateUserDto {
  email: string;
  name: string;
  avatarUrl?: string;
  googleId?: string;
}

export interface CreditTransactionOptions {
  transactionType: TransactionType;
  referenceId?: string;
  referenceType?: ReferenceType;
  description?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(CreditTransaction)
    private readonly creditTransactionRepository: Repository<CreditTransaction>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
      credits: 30,
    });
    return this.usersRepository.save(user);
  }

  async updateCredits(userId: string, credits: number): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    user.credits = credits;
    return this.usersRepository.save(user);
  }

  async deductCredits(
    userId: string,
    amount: number,
    options?: CreditTransactionOptions,
  ): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }
    const balanceBefore = user.credits;
    user.credits -= amount;
    const savedUser = await this.usersRepository.save(user);

    if (options) {
      await this.recordTransaction(userId, -amount, balanceBefore, savedUser.credits, options);
    }

    return savedUser;
  }

  async refundCredits(
    userId: string,
    amount: number,
    options?: CreditTransactionOptions,
  ): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    const balanceBefore = user.credits;
    user.credits += amount;
    const savedUser = await this.usersRepository.save(user);

    if (options) {
      await this.recordTransaction(userId, amount, balanceBefore, savedUser.credits, options);
    }

    return savedUser;
  }

  async addCredits(
    userId: string,
    amount: number,
    options?: CreditTransactionOptions,
  ): Promise<User> {
    return this.refundCredits(userId, amount, options);
  }

  private async recordTransaction(
    userId: string,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    options: CreditTransactionOptions,
  ): Promise<CreditTransaction> {
    const transaction = this.creditTransactionRepository.create({
      userId,
      transactionType: options.transactionType,
      amount,
      balanceBefore,
      balanceAfter,
      referenceId: options.referenceId ?? null,
      referenceType: options.referenceType ?? null,
      description: options.description ?? null,
      metadata: options.metadata ?? {},
    });

    return this.creditTransactionRepository.save(transaction);
  }
}
