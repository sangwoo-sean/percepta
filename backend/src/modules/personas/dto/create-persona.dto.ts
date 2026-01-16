import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { AgeGroup } from '../entities/persona.entity';

export class CreatePersonaDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(['10s', '20s', '30s', '40s', '50s', '60+'])
  ageGroup: AgeGroup;

  @IsString()
  occupation: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  personalityTraits?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class BatchCreatePersonaDto {
  @IsArray()
  personas: CreatePersonaDto[];
}
