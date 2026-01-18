import { IsString, IsEnum, IsArray, IsOptional, IsUUID, IsUrl, ArrayMaxSize } from 'class-validator';
import { InputType } from '../entities/feedback-session.entity';

export class CreateSessionDto {
  @IsEnum(['file', 'url', 'text', 'image'])
  inputType: InputType;

  @IsString()
  inputContent: string;

  @IsString()
  @IsOptional()
  inputUrl?: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @ArrayMaxSize(3)
  @IsOptional()
  inputImageUrls?: string[];

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
