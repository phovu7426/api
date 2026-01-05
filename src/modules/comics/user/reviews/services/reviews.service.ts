import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComicReview } from '@/shared/entities/comic-review.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class ReviewsService {
  private get statsRepo(): Repository<ComicStats> {
    return this.reviewRepo.manager.getRepository(ComicStats);
  }

  constructor(
    @InjectRepository(ComicReview) private readonly reviewRepo: Repository<ComicReview>,
  ) {}

  async getByComic(comicId: number) {
    return this.reviewRepo.find({
      where: { comic_id: comicId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getByUser(userId: number) {
    return this.reviewRepo.find({
      where: { user_id: userId },
      relations: ['comic'],
      order: { created_at: 'DESC' },
    });
  }

  async createOrUpdate(comicId: number, rating: number, content?: string) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating phải từ 1 đến 5');
    }

    const existing = await this.reviewRepo.findOne({
      where: { user_id: userId, comic_id: comicId },
    });

    let review: ComicReview;
    let oldRating: number | null = null;

    if (existing) {
      oldRating = existing.rating;
      existing.rating = rating;
      existing.content = content;
      review = await this.reviewRepo.save(existing);
    } else {
      review = this.reviewRepo.create({
        user_id: userId,
        comic_id: comicId,
        rating,
        content,
      });
      review = await this.reviewRepo.save(review);
    }

    // Update comic stats
    await this.updateComicStats(comicId, rating, oldRating, !existing);

    return review;
  }

  async delete(comicId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const review = await this.reviewRepo.findOne({
      where: { user_id: userId, comic_id: comicId },
    });

    if (!review) {
      throw new BadRequestException('Review không tồn tại');
    }

    await this.reviewRepo.remove(review);

    // Update comic stats
    const stats = await this.statsRepo.findOne({ where: { comic_id: comicId } });
    if (stats) {
      stats.rating_count = Math.max(0, stats.rating_count - 1);
      stats.rating_sum = Math.max(0, stats.rating_sum - review.rating);
      await this.statsRepo.save(stats);
    }

    return { deleted: true };
  }

  private async updateComicStats(comicId: number, newRating: number, oldRating: number | null, isNew: boolean) {
    let stats = await this.statsRepo.findOne({ where: { comic_id: comicId } });
    
    if (!stats) {
      stats = this.statsRepo.create({
        comic_id: comicId,
        view_count: 0,
        follow_count: 0,
        rating_count: 0,
        rating_sum: 0,
      });
    }

    if (isNew) {
      stats.rating_count += 1;
      stats.rating_sum += newRating;
    } else if (oldRating !== null) {
      stats.rating_sum = stats.rating_sum - oldRating + newRating;
    }

    await this.statsRepo.save(stats);
  }
}



