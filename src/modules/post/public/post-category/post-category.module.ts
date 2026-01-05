import { Module } from '@nestjs/common';
import { PostCategoryController } from './controllers/post-category.controller';
import { PostCategoryService } from './services/post-category.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [PostCategoryController],
  providers: [PostCategoryService],
  exports: [PostCategoryService],
})
export class PublicPostCategoryModule { }

