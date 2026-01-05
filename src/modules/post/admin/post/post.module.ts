import { Module } from '@nestjs/common';
import { PostController } from '@/modules/post/admin/post/controllers/post.controller';
import { PostService } from '@/modules/post/admin/post/services/post.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class AdminPostModule { }

