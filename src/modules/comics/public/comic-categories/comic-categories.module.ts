import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicCategory } from '@/shared/entities/comic-category.entity';
import { PublicComicCategoriesController } from '@/modules/comics/public/comic-categories/controllers/comic-categories.controller';
import { PublicComicCategoriesService } from '@/modules/comics/public/comic-categories/services/comic-categories.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComicCategory]),
    RbacModule,
  ],
  controllers: [PublicComicCategoriesController],
  providers: [PublicComicCategoriesService],
  exports: [PublicComicCategoriesService],
})
export class PublicComicCategoriesModule { }

