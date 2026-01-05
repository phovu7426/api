import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { ComicCategory } from '@/shared/entities/comic-category.entity';
import { ComicsController } from '@/modules/comics/admin/comics/controllers/comics.controller';
import { ComicsService } from '@/modules/comics/admin/comics/services/comics.service';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { FileUploadModule } from '@/modules/file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comic, ComicStats, ComicCategory]),
    RbacModule,
    FileUploadModule,
  ],
  controllers: [ComicsController],
  providers: [ComicsService],
  exports: [ComicsService],
})
export class AdminComicsModule {}

