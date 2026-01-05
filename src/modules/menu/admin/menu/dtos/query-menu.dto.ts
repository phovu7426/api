import { IsOptional, IsInt, IsString, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class QueryMenuDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  q?: string; // Search query

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_id?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  show_in_menu?: boolean;

  @IsOptional()
  @IsString()
  sort?: string = 'sort_order:ASC';
}

