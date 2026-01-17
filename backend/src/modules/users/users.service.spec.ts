import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService, CreateUserDto } from './users.service';
import { User } from './entities/user.entity';
import { CreditTransaction } from './entities/credit-transaction.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;
  let creditTransactionRepository: jest.Mocked<Repository<CreditTransaction>>;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    googleId: 'google-123',
    credits: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    personas: [],
    feedbackSessions: [],
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockCreditTransactionRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CreditTransaction),
          useValue: mockCreditTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    creditTransactionRepository = module.get(getRepositoryToken(CreditTransaction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('test-uuid');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid' },
      });
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should return a user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByIdOrFail('test-uuid');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found by email', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByGoogleId', () => {
    it('should return a user when found by googleId', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByGoogleId('google-123');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { googleId: 'google-123' },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        googleId: 'google-456',
      };

      const newUser = { ...mockUser, ...createUserDto, id: 'new-uuid' };
      repository.create.mockReturnValue(newUser);
      repository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        credits: 30,
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(newUser);
    });
  });

  describe('updateCredits', () => {
    it('should update user credits', async () => {
      const updatedUser = { ...mockUser, credits: 20 };
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.updateCredits('test-uuid', 20);

      expect(result.credits).toBe(20);
    });
  });

  describe('deductCredits', () => {
    it('should deduct credits from user', async () => {
      const updatedUser = { ...mockUser, credits: 5 };
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.deductCredits('test-uuid', 5);

      expect(result.credits).toBe(5);
    });

    it('should throw error when insufficient credits', async () => {
      const userWithLowCredits = { ...mockUser, credits: 5 };
      repository.findOne.mockResolvedValue(userWithLowCredits);

      await expect(service.deductCredits('test-uuid', 15)).rejects.toThrow(
        'Insufficient credits',
      );
    });
  });

  describe('refundCredits', () => {
    it('should add credits to user', async () => {
      const updatedUser = { ...mockUser, credits: 15 };
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.refundCredits('test-uuid', 5);

      expect(result.credits).toBe(15);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.refundCredits('non-existent', 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addCredits', () => {
    it('should add credits to user (alias for refundCredits)', async () => {
      const updatedUser = { ...mockUser, credits: 15 };
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.addCredits('test-uuid', 5);

      expect(result.credits).toBe(15);
    });
  });
});
