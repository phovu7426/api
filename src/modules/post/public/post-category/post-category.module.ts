import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCategoryController } from './controllers/post-category.controller';
import { PostCategoryService } from './services/post-category.service';
import { PostCategory } from '@/shared/entities/post-category.entity';
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
export class PublicPostCategoryModule { }

