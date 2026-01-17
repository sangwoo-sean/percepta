import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AgeGroup, Gender } from '../entities/persona.entity';

export class PersonaDataDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(['10s', '20s', '30s', '40s', '50s', '60+'])
  ageGroup: AgeGroup;

  @IsEnum(['male', 'female'])
  @IsOptional()
  gender?: Gender;

  @IsString()
  occupation: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  education?: string;

  @IsString()
  @IsOptional()
  incomeLevel?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  personalityTraits?: string[];

  @IsString()
  @IsOptional()
  dailyPattern?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  strengths?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  weaknesses?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreatePersonaDto {
  @ValidateNested()
  @Type(() => PersonaDataDto)
  data: PersonaDataDto;
}

export class BatchCreatePersonaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonaDto)
  personas: CreatePersonaDto[];
}

export class GeneratePersonasDto {
  @IsEnum(['10s', '20s', '30s', '40s', '50s', '60+'])
  ageGroup: AgeGroup;

  @IsInt()
  @Min(1)
  @Max(10)
  count: number;
}
