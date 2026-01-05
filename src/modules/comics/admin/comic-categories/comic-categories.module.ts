import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicCategory } from '@/shared/entities/comic-category.entity';
import { ComicCategoriesController } from '@/modules/comics/admin/comic-categories/controllers/comic-categories.controller';
import { ComicCategoriesService } from '@/modules/comics/admin/comic-categories/services/comic-categories.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComicCategory]),
    RbacModule,
  ],
  controllers: [ComicCategoriesController],
  providers: [ComicCategoriesService],
  exports: [ComicCategoriesService],
})
export class AdminComicCategoriesModule {}



