import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import shared entities
import { Post } from '@/shared/entities/post.entity';
import { PostCategory } from '@/shared/entities/post-category.entity';
import { PostTag } from '@/shared/entities/post-tag.entity';

// Import shared services
import { PostService } from '@/modules/post/admin/post/services/post.service';
import { PostCategoryService } from '@/modules/post/admin/post-category/services/post-category.service';
import { PostTagService } from '@/modules/post/admin/post-tag/services/post-tag.service';

// Import admin modules
import { AdminPostModule } from '@/modules/post/admin/post/post.module';
import { AdminPostCategoryModule } from '@/modules/post/admin/post-category/post-category.module';
import { AdminPostTagModule } from '@/modules/post/admin/post-tag/post-tag.module';

// Import public modules
import { PublicPostModule } from '@/modules/post/public/post/post.module';
import { PublicPostCategoryModule } from '@/modules/post/public/post-category/post-category.module';
import { PublicPostTagModule } from '@/modules/post/public/post-tag/post-tag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostCategory,
      PostTag,
    ]),
    // Admin modules
    AdminPostModule,
    AdminPostCategoryModule,
    AdminPostTagModule,
    // Public modules
    PublicPostModule,
    PublicPostCategoryModule,
    PublicPostTagModule,
  ],
  providers: [
    // Shared services
    PostService,
    PostCategoryService,
    PostTagService,
  ],
  exports: [
    // Export shared services for other modules to use
    PostService,
    PostCategoryService,
    PostTagService,
    TypeOrmModule,
  ],
})
export class PostModule { }