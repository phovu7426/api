import { IsString, IsOptional, IsNumber, IsInt, IsEnum, MaxLength, Min } from 'class-validator';
import { ChapterStatus } from '@/shared/enums';

export class UpdateChapterDto {
  @IsOptional()
  @IsInt()
  team_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  chapter_index?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  chapter_label?: string;

  @IsOptional()
  @IsEnum(ChapterStatus)
  status?: ChapterStatus;
}



