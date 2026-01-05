import { Module } from '@nestjs/common';
import { PostTagController } from '@/modules/post/public/post-tag/controllers/post-tag.controller';
import { PostTagService } from '@/modules/post/public/post-tag/services/post-tag.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [PostTagController],
  providers: [PostTagService],
  exports: [PostTagService],
})
export class PublicPostTagModule { }

