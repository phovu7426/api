import { IsString, IsOptional, IsEmail, IsInt, IsBoolean, MaxLength, MinLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEmailConfigDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  smtp_host?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  smtp_port?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  smtp_secure?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  smtp_username?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(500)
  smtp_password?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  from_email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  from_name?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  reply_to_email?: string;
}
