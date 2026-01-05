import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from '@/shared/entities/bookmark.entity';
import { BookmarksController } from '@/modules/comics/user/bookmarks/controllers/bookmarks.controller';
import { BookmarksService } from '@/modules/comics/user/bookmarks/services/bookmarks.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmark]),
    RbacModule,
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class UserBookmarksModule {}



