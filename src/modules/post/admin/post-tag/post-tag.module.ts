import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { PostTagController } from '@/modules/post/admin/post-tag/controllers/post-tag.controller';
import { PostTagService } from '@/modules/post/admin/post-tag/services/post-tag.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostTag]),
    RbacModule,
  ],
  controllers: [PostTagController],
  providers: [PostTagService],
  exports: [PostTagService],
})
export class AdminPostTagModule { }

