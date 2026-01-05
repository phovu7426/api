import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from '@/shared/entities/chapter.entity';
import { ChapterPage } from '@/shared/entities/chapter-page.entity';
import { ComicView } from '@/shared/entities/comic-view.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { PublicChaptersController } from '@/modules/comics/public/chapters/controllers/chapters.controller';
import { PublicChaptersService } from '@/modules/comics/public/chapters/services/chapters.service';
import { ViewTrackingService } from '@/modules/comics/core/services/view-tracking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter, ChapterPage, ComicView, ComicStats]),
  ],
  controllers: [PublicChaptersController],
  providers: [PublicChaptersService, ViewTrackingService],
  exports: [PublicChaptersService, ViewTrackingService],
})
export class PublicChaptersModule {}

