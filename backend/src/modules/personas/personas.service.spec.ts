import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { Persona } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';

describe('PersonasService', () => {
  let service: PersonasService;
  let repository: jest.Mocked<Repository<Persona>>;

  const mockPersona: Persona = {
    id: 'persona-uuid',
    userId: 'user-uuid',
    name: '민준',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    ageGroup: '20s',
    occupation: '대학생',
    personalityTraits: ['호기심이 많은', '분석적인'],
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {} as any,
    feedbackResults: [],
  };

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonasService,
        {
          provide: getRepositoryToken(Persona),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PersonasService>(PersonasService);
    repository = module.get(getRepositoryToken(Persona));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUserId', () => {
    it('should return personas for a user', async () => {
      repository.find.mockResolvedValue([mockPersona]);

      const result = await service.findByUserId('user-uuid');

      expect(result).toEqual([mockPersona]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findByIdOrFail', () => {
    it('should return persona when found', async () => {
      repository.findOne.mockResolvedValue(mockPersona);

      const result = await service.findByIdOrFail('persona-uuid');

      expect(result).toEqual(mockPersona);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a persona with auto-generated name and avatar', async () => {
      const dto: CreatePersonaDto = {
        ageGroup: '20s',
        occupation: '대학생',
        personalityTraits: ['호기심이 많은'],
      };

      repository.create.mockReturnValue(mockPersona);
      repository.save.mockResolvedValue(mockPersona);

      const result = await service.create('user-uuid', dto);

      expect(result).toEqual(mockPersona);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should use provided name if given', async () => {
      const dto: CreatePersonaDto = {
        name: '커스텀이름',
        ageGroup: '30s',
        occupation: '회사원',
      };

      const customPersona = { ...mockPersona, name: '커스텀이름' };
      repository.create.mockReturnValue(customPersona);
      repository.save.mockResolvedValue(customPersona);

      const result = await service.create('user-uuid', dto);

      expect(result.name).toBe('커스텀이름');
    });
  });

  describe('batchCreate', () => {
    it('should create multiple personas', async () => {
      const dtos: CreatePersonaDto[] = [
        { ageGroup: '20s', occupation: '대학생' },
        { ageGroup: '30s', occupation: '회사원' },
      ];

      repository.create.mockReturnValue(mockPersona);
      repository.save.mockResolvedValue(mockPersona);

      const result = await service.batchCreate('user-uuid', dtos);

      expect(result).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('should delete persona when owned by user', async () => {
      repository.findOne.mockResolvedValue(mockPersona);

      await service.delete('persona-uuid', 'user-uuid');

      expect(repository.remove).toHaveBeenCalledWith(mockPersona);
    });

    it('should throw NotFoundException when persona not owned by user', async () => {
      repository.findOne.mockResolvedValue(mockPersona);

      await expect(
        service.delete('persona-uuid', 'other-user-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return stats for user personas', async () => {
      repository.find.mockResolvedValue([
        { ...mockPersona, ageGroup: '20s', occupation: '대학생' },
        { ...mockPersona, ageGroup: '20s', occupation: '회사원' },
        { ...mockPersona, ageGroup: '30s', occupation: '회사원' },
      ] as Persona[]);

      const result = await service.getStats('user-uuid');

      expect(result.total).toBe(3);
      expect(result.byAgeGroup['20s']).toBe(2);
      expect(result.byAgeGroup['30s']).toBe(1);
      expect(result.byOccupation['대학생']).toBe(1);
      expect(result.byOccupation['회사원']).toBe(2);
    });
  });
});
