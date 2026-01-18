import { IsIn, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  @IsIn(['basic', 'large', 'premium'])
  packageName: 'basic' | 'large' | 'premium';
}
