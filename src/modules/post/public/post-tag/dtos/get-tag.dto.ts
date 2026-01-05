import { IsString } from 'class-validator';

export class GetTagDto {
  @IsString()
  slug: string;
}

