import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { Comic } from '@/shared/entities/comic.entity';
import { StatsController } from '@/modules/comics/public/stats/controllers/stats.controller';
import { StatsService } from '@/modules/comics/public/stats/services/stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComicStats, Comic]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}



