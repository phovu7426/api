import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '@/shared/entities/comment.entity';
import { ComicReview } from '@/shared/entities/comic-review.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(ComicReview) private readonly reviewRepo: Repository<ComicReview>,
  ) {}

  /**
   * Ẩn comment
   */
  async hideComment(commentId: number) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.status = 'hidden';
    return this.commentRepo.save(comment);
  }

  /**
   * Hiện comment
   */
  async showComment(commentId: number) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.status = 'visible';
    return this.commentRepo.save(comment);
  }

  /**
   * Ẩn review
   */
  async hideReview(reviewId: number) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Soft delete review
    await this.reviewRepo.softRemove(review);
    return { hidden: true };
  }

  /**
   * Lấy danh sách comments chờ duyệt
   */
  async getPendingComments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Có thể thêm logic để filter comments cần moderation
    // Ví dụ: comments có từ khóa spam, hoặc được report
    const [data, total] = await this.commentRepo.findAndCount({
      where: { status: 'visible' } as any,
      relations: ['user', 'comic', 'chapter'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}



