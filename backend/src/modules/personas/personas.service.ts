import {
  Injectable,
  NotFoundException,
  Inject,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona, AgeGroup, PersonaData } from './entities/persona.entity';
import { CreatePersonaDto, GeneratePersonasDto, UpdatePersonaDto } from './dto/create-persona.dto';
import { AIProvider, AI_PROVIDER } from '../ai/ai-provider.interface';
import { UsersService } from '../users/users.service';

const CREDITS_PER_PERSONA = 1;

const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'big-ears',
  'big-smile',
  'bottts',
  'croodles',
  'fun-emoji',
  'icons',
  'identicon',
  'initials',
  'lorelei',
  'micah',
  'miniavs',
  'notionists',
  'open-peeps',
  'personas',
  'pixel-art',
];

const KOREAN_NAMES = {
  male: ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서'],
  female: ['서연', '서윤', '지우', '서현', '민서', '하은', '하윤', '윤서', '지민', '채원'],
};

@Injectable()
export class PersonasService {
  private readonly logger = new Logger(PersonasService.name);

  constructor(
    @InjectRepository(Persona)
    private readonly personasRepository: Repository<Persona>,
    @Inject(AI_PROVIDER)
    private readonly aiProvider: AIProvider,
    private readonly usersService: UsersService,
  ) {}

  private generateRandomName(): string {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const names = KOREAN_NAMES[gender];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateAvatarUrl(seed: string): string {
    const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  }

  async findByUserId(userId: string): Promise<Persona[]> {
    return this.personasRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Persona | null> {
    return this.personasRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<Persona> {
    const persona = await this.findById(id);
    if (!persona) {
      throw new NotFoundException(`Persona with ID ${id} not found`);
    }
    return persona;
  }

  async create(userId: string, dto: CreatePersonaDto): Promise<Persona> {
    const name = dto.data.name || this.generateRandomName();
    const avatarUrl = this.generateAvatarUrl(name + Date.now());

    const data: PersonaData = {
      ...dto.data,
      name,
      avatarUrl,
      personalityTraits: dto.data.personalityTraits || [],
    };

    const persona = this.personasRepository.create({
      userId,
      data,
      storageUrl: null,
    });

    return this.personasRepository.save(persona);
  }

  async batchCreate(userId: string, dtos: CreatePersonaDto[]): Promise<Persona[]> {
    const personas = await Promise.all(
      dtos.map((dto) => this.create(userId, dto)),
    );
    return personas;
  }

  async generateAndCreate(userId: string, dto: GeneratePersonasDto): Promise<Persona[]> {
    const requiredCredits = dto.count * CREDITS_PER_PERSONA;

    const user = await this.usersService.findByIdOrFail(userId);
    if (user.credits < requiredCredits) {
      throw new BadRequestException(
        `크레딧이 부족합니다. 필요: ${requiredCredits}, 보유: ${user.credits}`,
      );
    }

    await this.usersService.deductCredits(userId, requiredCredits);

    let generatedData: PersonaData[];
    try {
      generatedData = await this.aiProvider.generatePersonas(dto.ageGroups, dto.count, { userId });
    } catch (error) {
      await this.usersService.addCredits(userId, requiredCredits);
      this.logger.error('Failed to generate personas from AI provider', error);
      throw new InternalServerErrorException(
        'AI 페르소나 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    try {
      const personas = generatedData.map((data) => {
        const avatarUrl = this.generateAvatarUrl(data.name + Date.now() + Math.random());
        return this.personasRepository.create({
          userId,
          data: {
            ...data,
            avatarUrl,
          },
          storageUrl: null,
        });
      });

      return await this.personasRepository.save(personas);
    } catch (error) {
      await this.usersService.addCredits(userId, requiredCredits);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const persona = await this.findByIdOrFail(id);
    if (persona.userId !== userId) {
      throw new NotFoundException(`Persona with ID ${id} not found`);
    }
    await this.personasRepository.remove(persona);
  }

  async update(id: string, userId: string, dto: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.findByIdOrFail(id);
    if (persona.userId !== userId) {
      throw new NotFoundException(`Persona with ID ${id} not found`);
    }

    const updatedData: PersonaData = {
      ...persona.data,
      ...dto.data,
      personalityTraits: dto.data.personalityTraits ?? persona.data.personalityTraits,
      strengths: dto.data.strengths ?? persona.data.strengths,
      weaknesses: dto.data.weaknesses ?? persona.data.weaknesses,
    };

    persona.data = updatedData;
    return this.personasRepository.save(persona);
  }

  async getStats(userId: string): Promise<{
    total: number;
    byAgeGroup: Record<AgeGroup, number>;
    byOccupation: Record<string, number>;
  }> {
    const personas = await this.findByUserId(userId);

    const byAgeGroup: Record<AgeGroup, number> = {
      '10s': 0,
      '20s': 0,
      '30s': 0,
      '40s': 0,
      '50s': 0,
      '60+': 0,
    };

    const byOccupation: Record<string, number> = {};

    personas.forEach((persona) => {
      byAgeGroup[persona.ageGroup]++;
      byOccupation[persona.occupation] = (byOccupation[persona.occupation] || 0) + 1;
    });

    return {
      total: personas.length,
      byAgeGroup,
      byOccupation,
    };
  }
}
