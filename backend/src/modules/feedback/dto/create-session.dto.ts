import { IsString, IsEnum, IsArray, IsOptional, IsUUID } from 'class-validator';
import { InputType } from '../entities/feedback-session.entity';

export class CreateSessionDto {
  @IsEnum(['file', 'url', 'text'])
  inputType: InputType;

  @IsString()
  inputContent: string;

  @IsString()
  @IsOptional()
  inputUrl?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  personaIds: string[];
}

export class GenerateFeedbackDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  personaIds?: string[];
}
