import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@/shared/entities/post.entity';
import { PostCategory } from '@/shared/entities/post-category.entity';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { PostController } from '@/modules/post/admin/post/controllers/post.controller';
import { PostService } from '@/modules/post/admin/post/services/post.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostCategory, PostTag]),
    RbacModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class AdminPostModule { }

