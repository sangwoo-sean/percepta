import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { Persona, PersonaData } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { AI_PROVIDER, AIProvider } from '../ai/ai-provider.interface';

describe('PersonasService', () => {
  let service: PersonasService;
  let repository: jest.Mocked<Repository<Persona>>;
  let aiProvider: jest.Mocked<AIProvider>;

  const mockPersonaData: PersonaData = {
    name: '민준',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    ageGroup: '20s',
    occupation: '대학생',
    personalityTraits: ['호기심이 많은', '분석적인'],
    description: undefined,
  };

  const mockPersona = {
    id: 'persona-uuid',
    userId: 'user-uuid',
    data: mockPersonaData,
    storageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {} as any,
    feedbackResults: [],
    get name() { return this.data?.name ?? ''; },
    get avatarUrl() { return this.data?.avatarUrl ?? null; },
    get ageGroup() { return this.data?.ageGroup ?? '20s'; },
    get occupation() { return this.data?.occupation ?? ''; },
    get personalityTraits() { return this.data?.personalityTraits ?? []; },
    get description() { return this.data?.description ?? null; },
  } as Persona;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const mockAIProvider = {
      generateFeedback: jest.fn(),
      generateSummary: jest.fn(),
      generatePersonas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonasService,
        {
          provide: getRepositoryToken(Persona),
          useValue: mockRepository,
        },
        {
          provide: AI_PROVIDER,
          useValue: mockAIProvider,
        },
      ],
    }).compile();

    service = module.get<PersonasService>(PersonasService);
    repository = module.get(getRepositoryToken(Persona));
    aiProvider = module.get(AI_PROVIDER);
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
        data: {
          ageGroup: '20s',
          occupation: '대학생',
          personalityTraits: ['호기심이 많은'],
        },
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
        data: {
          name: '커스텀이름',
          ageGroup: '30s',
          occupation: '회사원',
        },
      };

      const customPersonaData: PersonaData = {
        ...mockPersonaData,
        name: '커스텀이름',
        ageGroup: '30s',
        occupation: '회사원',
      };
      const customPersona = {
        ...mockPersona,
        data: customPersonaData,
        get name() { return this.data?.name ?? ''; },
      } as Persona;

      repository.create.mockReturnValue(customPersona);
      repository.save.mockResolvedValue(customPersona);

      const result = await service.create('user-uuid', dto);

      expect(result.name).toBe('커스텀이름');
    });
  });

  describe('batchCreate', () => {
    it('should create multiple personas', async () => {
      const dtos: CreatePersonaDto[] = [
        { data: { ageGroup: '20s', occupation: '대학생', personalityTraits: [] } },
        { data: { ageGroup: '30s', occupation: '회사원', personalityTraits: [] } },
      ];

      repository.create.mockReturnValue(mockPersona);
      repository.save.mockResolvedValue(mockPersona);

      const result = await service.batchCreate('user-uuid', dtos);

      expect(result).toHaveLength(2);
    });
  });

  describe('generateAndCreate', () => {
    it('should generate personas using AI and save them', async () => {
      const generatedData: PersonaData[] = [
        { name: '김민준', ageGroup: '20s', occupation: '개발자', personalityTraits: ['분석적'] },
        { name: '이서연', ageGroup: '20s', occupation: '디자이너', personalityTraits: ['창의적'] },
      ];

      aiProvider.generatePersonas.mockResolvedValue(generatedData);
      repository.create.mockImplementation((data) => ({ ...mockPersona, ...data }) as Persona);
      repository.save.mockImplementation((entities) => Promise.resolve(entities as any));

      const result = await service.generateAndCreate('user-uuid', { ageGroup: '20s', count: 2 });

      expect(aiProvider.generatePersonas).toHaveBeenCalledWith('20s', 2);
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
      const personasWithData = [
        { ...mockPersona, data: { ...mockPersonaData, ageGroup: '20s' as const, occupation: '대학생' } },
        { ...mockPersona, data: { ...mockPersonaData, ageGroup: '20s' as const, occupation: '회사원' } },
        { ...mockPersona, data: { ...mockPersonaData, ageGroup: '30s' as const, occupation: '회사원' } },
      ] as Persona[];

      repository.find.mockResolvedValue(personasWithData);

      const result = await service.getStats('user-uuid');

      expect(result.total).toBe(3);
      expect(result.byAgeGroup['20s']).toBe(2);
      expect(result.byAgeGroup['30s']).toBe(1);
      expect(result.byOccupation['대학생']).toBe(1);
      expect(result.byOccupation['회사원']).toBe(2);
    });
  });
});
