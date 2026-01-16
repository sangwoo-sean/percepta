import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona, AgeGroup } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';

const KOREAN_NAMES = {
  male: ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서'],
  female: ['서연', '서윤', '지우', '서현', '민서', '하은', '하윤', '윤서', '지민', '채원'],
};

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

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personasRepository: Repository<Persona>,
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
    const name = dto.name || this.generateRandomName();
    const avatarUrl = this.generateAvatarUrl(name + Date.now());

    const persona = this.personasRepository.create({
      userId,
      name,
      avatarUrl,
      ageGroup: dto.ageGroup,
      occupation: dto.occupation,
      personalityTraits: dto.personalityTraits || [],
      description: dto.description,
    });

    return this.personasRepository.save(persona);
  }

  async batchCreate(userId: string, dtos: CreatePersonaDto[]): Promise<Persona[]> {
    const personas = await Promise.all(
      dtos.map((dto) => this.create(userId, dto)),
    );
    return personas;
  }

  async delete(id: string, userId: string): Promise<void> {
    const persona = await this.findByIdOrFail(id);
    if (persona.userId !== userId) {
      throw new NotFoundException(`Persona with ID ${id} not found`);
    }
    await this.personasRepository.remove(persona);
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
