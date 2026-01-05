import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { Chapter } from '@/shared/entities/chapter.entity';
import { PublicComicsController } from '@/modules/comics/public/comics/controllers/comics.controller';
import { PublicComicsService } from '@/modules/comics/public/comics/services/comics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comic, ComicStats, Chapter]),
  ],
  controllers: [PublicComicsController],
  providers: [PublicComicsService],
  exports: [PublicComicsService],
})
export class PublicComicsModule {}

