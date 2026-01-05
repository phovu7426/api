import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCommentsByComicDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  comicId: number;
}

export class GetCommentsByChapterDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  chapterId: number;
}

