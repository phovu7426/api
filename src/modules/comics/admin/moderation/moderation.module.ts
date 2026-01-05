import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '@/shared/entities/comment.entity';
import { ComicReview } from '@/shared/entities/comic-review.entity';
import { ModerationController } from '@/modules/comics/admin/moderation/controllers/moderation.controller';
import { ModerationService } from '@/modules/comics/admin/moderation/services/moderation.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, ComicReview]),
    RbacModule,
  ],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}



