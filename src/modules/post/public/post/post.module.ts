import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from '@/modules/post/public/post/controllers/post.controller';
import { PostService } from '@/modules/post/public/post/services/post.service';
import { Post } from '@/shared/entities/post.entity';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    RbacModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PublicPostModule { }

