import { IsString } from 'class-validator';

export class GetPostDto {
  @IsString()
  slug: string;
}

