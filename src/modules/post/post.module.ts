import { Module } from '@nestjs/common';

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
    // Admin modules
    AdminPostModule,
    AdminPostCategoryModule,
    AdminPostTagModule,
    // Public modules
    PublicPostModule,
    PublicPostCategoryModule,
    PublicPostTagModule,
  ],
  exports: [],
})
export class PostModule { }