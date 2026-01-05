import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import shared entities
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { ComicCategory } from '@/shared/entities/comic-category.entity';
import { Chapter } from '@/shared/entities/chapter.entity';
import { ChapterPage } from '@/shared/entities/chapter-page.entity';
import { ComicReview } from '@/shared/entities/comic-review.entity';
import { ComicFollow } from '@/shared/entities/comic-follow.entity';
import { ReadingHistory } from '@/shared/entities/reading-history.entity';
import { Bookmark } from '@/shared/entities/bookmark.entity';
import { Comment } from '@/shared/entities/comment.entity';
import { ComicView } from '@/shared/entities/comic-view.entity';

// Import admin modules
import { AdminComicsModule } from '@/modules/comics/admin/comics/comics.module';
import { AdminComicCategoriesModule } from '@/modules/comics/admin/comic-categories/comic-categories.module';
import { AdminChaptersModule } from '@/modules/comics/admin/chapters/chapters.module';
import { ModerationModule } from '@/modules/comics/admin/moderation/moderation.module';
import { AnalyticsModule } from '@/modules/comics/admin/analytics/analytics.module';
import { AdminCommentsModule } from '@/modules/comics/admin/comments/comments.module';
import { AdminReviewsModule } from '@/modules/comics/admin/reviews/reviews.module';

// Import public modules
import { PublicComicsModule } from '@/modules/comics/public/comics/comics.module';
import { PublicChaptersModule } from '@/modules/comics/public/chapters/chapters.module';
import { PublicCommentsModule } from '@/modules/comics/public/comments/comments.module';
import { PublicReviewsModule } from '@/modules/comics/public/reviews/reviews.module';
import { PublicComicCategoriesModule } from '@/modules/comics/public/comic-categories/comic-categories.module';
import { StatsModule } from '@/modules/comics/public/stats/stats.module';

// Import user modules
import { UserReadingHistoryModule } from '@/modules/comics/user/reading-history/reading-history.module';
import { UserBookmarksModule } from '@/modules/comics/user/bookmarks/bookmarks.module';
import { UserFollowsModule } from '@/modules/comics/user/follows/follows.module';
import { UserReviewsModule } from '@/modules/comics/user/reviews/reviews.module';
import { UserCommentsModule } from '@/modules/comics/user/comments/comments.module';
import { DashboardModule } from '@/modules/comics/user/dashboard/dashboard.module';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';
import { Notification } from '@/shared/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comic,
      ComicStats,
      ComicCategory,
      Chapter,
      ChapterPage,
      ComicReview,
      ComicFollow,
      ReadingHistory,
      Bookmark,
      Comment,
      ComicView,
      Notification,
    ]),
    // Admin modules
    AdminComicsModule,
    AdminComicCategoriesModule,
    AdminChaptersModule,
    ModerationModule,
    AnalyticsModule,
    AdminCommentsModule,
    AdminReviewsModule,
    // Public modules
    PublicComicsModule,
    PublicChaptersModule,
    PublicCommentsModule,
    PublicReviewsModule,
    PublicComicCategoriesModule,
    StatsModule,
    // User modules
    UserReadingHistoryModule,
    UserBookmarksModule,
    UserFollowsModule,
    UserReviewsModule,
    UserCommentsModule,
    DashboardModule,
  ],
  providers: [
    ComicNotificationService,
  ],
  exports: [
    TypeOrmModule,
    ComicNotificationService,
  ],
})
export class ComicsModule {}

