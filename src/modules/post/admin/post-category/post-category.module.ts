import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCategory } from '@/shared/entities/post-category.entity';
import { PostCategoryController } from '@/modules/post/admin/post-category/controllers/post-category.controller';
import { PostCategoryService } from '@/modules/post/admin/post-category/services/post-category.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostCategory]),
    RbacModule,
  ],
  controllers: [PostCategoryController],
  providers: [PostCategoryService],
  exports: [PostCategoryService],
})
export class AdminPostCategoryModule { }

