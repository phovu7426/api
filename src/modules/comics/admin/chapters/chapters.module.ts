import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from '@/shared/entities/chapter.entity';
import { ChapterPage } from '@/shared/entities/chapter-page.entity';
import { ChaptersController } from '@/modules/comics/admin/chapters/controllers/chapters.controller';
import { ChaptersService } from '@/modules/comics/admin/chapters/services/chapters.service';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { FileUploadModule } from '@/modules/file-upload/file-upload.module';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';
import { Notification } from '@/shared/entities/notification.entity';
import { ComicFollow } from '@/shared/entities/comic-follow.entity';
import { Comment } from '@/shared/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter, ChapterPage, Notification, ComicFollow, Comment]),
    RbacModule,
    FileUploadModule,
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService, ComicNotificationService],
  exports: [ChaptersService, ComicNotificationService],
})
export class AdminChaptersModule {}

