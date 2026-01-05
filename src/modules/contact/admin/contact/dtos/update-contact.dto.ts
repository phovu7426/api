import { IsString, IsOptional, IsEmail, MaxLength, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ContactStatus } from '@/shared/enums/contact-status.enum';

export class UpdateContactDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  subject?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsString()
  @IsOptional()
  reply?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  replied_at?: Date;

  @IsOptional()
  @Type(() => Number)
  replied_by?: number;
}

