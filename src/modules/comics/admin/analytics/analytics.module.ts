import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { ComicView } from '@/shared/entities/comic-view.entity';
import { AnalyticsController } from '@/modules/comics/admin/analytics/controllers/analytics.controller';
import { AnalyticsService } from '@/modules/comics/admin/analytics/services/analytics.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comic, ComicStats, ComicView]),
    RbacModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}



