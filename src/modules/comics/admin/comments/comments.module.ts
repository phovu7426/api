import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '@/shared/entities/comment.entity';
import { CommentsController } from '@/modules/comics/admin/comments/controllers/comments.controller';
import { CommentsService } from '@/modules/comics/admin/comments/services/comments.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    RbacModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class AdminCommentsModule {}



