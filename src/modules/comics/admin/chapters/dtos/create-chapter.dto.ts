import { IsString, IsOptional, IsNumber, IsArray, IsEnum, MaxLength, IsInt, Min } from 'class-validator';
import { ChapterStatus } from '@/shared/enums';

export class CreateChapterPageDto {
  @IsString()
  @MaxLength(500)
  image_url: string;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsInt()
  file_size?: number;
}

export class CreateChapterDto {
  @IsInt()
  comic_id: number;

  @IsOptional()
  @IsInt()
  team_id?: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsInt()
  @Min(1)
  chapter_index: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  chapter_label?: string;

  @IsOptional()
  @IsEnum(ChapterStatus)
  status?: ChapterStatus;

  @IsOptional()
  @IsArray()
  pages?: CreateChapterPageDto[];
}



