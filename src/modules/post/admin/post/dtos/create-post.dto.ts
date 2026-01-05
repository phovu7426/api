import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsEnum, IsDateString, IsInt, Min, MaxLength, ValidateIf } from 'class-validator';
import { PostStatus, PostType } from '@/shared/enums';

export class CreatePostDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsInt()
  primary_postcategory_id?: number;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsEnum(PostType)
  post_type?: PostType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ValidateIf((o) => o.post_type === PostType.video)
  video_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ValidateIf((o) => o.post_type === PostType.audio)
  audio_url?: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  is_pinned?: boolean;

  @IsOptional()
  @IsDateString()
  published_at?: string;

  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsString()
  canonical_url?: string;

  @IsOptional()
  @IsString()
  og_title?: string;

  @IsOptional()
  @IsString()
  og_description?: string;

  @IsOptional()
  @IsString()
  og_image?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tag_ids?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  category_ids?: number[];
}

