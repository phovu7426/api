import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingHistory } from '@/shared/entities/reading-history.entity';
import { ComicFollow } from '@/shared/entities/comic-follow.entity';
import { Bookmark } from '@/shared/entities/bookmark.entity';
import { DashboardController } from '@/modules/comics/user/dashboard/controllers/dashboard.controller';
import { DashboardService } from '@/modules/comics/user/dashboard/services/dashboard.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReadingHistory, ComicFollow, Bookmark]),
    RbacModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}



