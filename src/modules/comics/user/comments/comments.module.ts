import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '@/shared/entities/comment.entity';
import { UserCommentsController } from '@/modules/comics/user/comments/controllers/comments.controller';
import { UserCommentsService } from '@/modules/comics/user/comments/services/comments.service';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';
import { Notification } from '@/shared/entities/notification.entity';
import { ComicFollow } from '@/shared/entities/comic-follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Notification, ComicFollow]),
    RbacModule,
  ],
  controllers: [UserCommentsController],
  providers: [UserCommentsService, ComicNotificationService],
  exports: [UserCommentsService],
})
export class UserCommentsModule {}

