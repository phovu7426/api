import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho metadata của một enum value
 */
export class EnumValueMetadataDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}

/**
 * DTO cho metadata của một enum
 */
export class EnumResponseDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnumValueMetadataDto)
  values: EnumValueMetadataDto[];
}

/**
 * DTO cho tất cả enums response
 */
export class AllEnumsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnumResponseDto)
  enums: EnumResponseDto[];
}