import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicReview } from '@/shared/entities/comic-review.entity';
import { PublicReviewsController } from '@/modules/comics/public/reviews/controllers/reviews.controller';
import { PublicReviewsService } from '@/modules/comics/public/reviews/services/reviews.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComicReview]),
  ],
  controllers: [PublicReviewsController],
  providers: [PublicReviewsService],
  exports: [PublicReviewsService],
})
export class PublicReviewsModule {}



