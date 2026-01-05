import { IsString } from 'class-validator';

export class GetCategoryDto {
  @IsString()
  slug: string;
}

