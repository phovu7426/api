import { IsString } from 'class-validator';

export class GetComicCategoryDto {
  @IsString()
  slug: string;
}

