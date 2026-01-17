import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface CreateUserDto {
  email: string;
  name: string;
  avatarUrl?: string;
  googleId?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async deductCredits(userId: string, amount: number): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }
    user.credits -= amount;
    return this.usersRepository.save(user);
  }

  async refundCredits(userId: string, amount: number): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    user.credits += amount;
    return this.usersRepository.save(user);
  }
}
