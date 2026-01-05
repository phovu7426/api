import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  MaxLength,
  IsDate,
  IsEnum,
  IsNotEmpty,
  ValidateIf
} from 'class-validator';
import { Gender } from '@/shared/enums/gender.enum';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  image?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : null)
  birthday?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  about?: string;
}

